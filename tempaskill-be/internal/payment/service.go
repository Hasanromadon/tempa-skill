package payment

import (
	"bytes"
	"crypto/sha512"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type PaymentService interface {
	CreatePayment(userID uint, req CreatePaymentRequest) (*PaymentResponse, error)
	GetPaymentStatus(orderID string) (*PaymentResponse, error)
	GetUserPayments(userID uint, page, limit int) ([]PaymentResponse, int, error)
	GetAllPayments(page, limit int) ([]PaymentResponse, int, error)
	HandleMidtransNotification(notification MidtransNotification) error
}

type paymentService struct {
	repo           PaymentRepository
	courseRepo     interface{} // We'll need to import course repository
	userRepo       interface{} // We'll need to import user repository
	midtransConfig MidtransConfig
}

type MidtransConfig struct {
	ServerKey    string
	ClientKey    string
	IsProduction bool
	BaseURL      string
}

func NewPaymentService(repo PaymentRepository, courseRepo, userRepo interface{}, config MidtransConfig) PaymentService {
	return &paymentService{
		repo:           repo,
		courseRepo:     courseRepo,
		userRepo:       userRepo,
		midtransConfig: config,
	}
}

func (s *paymentService) CreatePayment(userID uint, req CreatePaymentRequest) (*PaymentResponse, error) {
	// Get course details (we'll need to implement this)
	// For now, let's assume we have a way to get course info
	course, err := s.getCourseByID(req.CourseID)
	if err != nil {
		return nil, fmt.Errorf("course not found: %w", err)
	}

	// Check if user already purchased this course
	existingPayment, _ := s.repo.FindByOrderID(fmt.Sprintf("user_%d_course_%d", userID, req.CourseID))
	if existingPayment != nil && existingPayment.TransactionStatus == "settlement" {
		return nil, fmt.Errorf("course already purchased")
	}

	// Get user details
	user, err := s.getUserByID(userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Generate unique order ID
	orderID := fmt.Sprintf("TS-%s-%d", uuid.New().String()[:8], time.Now().Unix())

	// Create payment transaction record
	transaction := &PaymentTransaction{
		UserID:            userID,
		CourseID:          req.CourseID,
		OrderID:           orderID,
		GrossAmount:       course.Price,
		TransactionStatus: "pending",
		TransactionTime:   time.Now(),
	}

	// Determine payment type
	paymentType := "bank_transfer" // default
	if req.PaymentMethod != "" {
		switch req.PaymentMethod {
		case "gopay":
			paymentType = "gopay"
		case "credit_card":
			paymentType = "credit_card"
		case "qris":
			paymentType = "qris"
		default:
			paymentType = "bank_transfer"
		}
	}

	// Create Midtrans charge request
	chargeReq := MidtransChargeRequest{
		PaymentType: paymentType,
		TransactionDetails: MidtransTransactionDetail{
			OrderID:     orderID,
			GrossAmount: int64(course.Price * 100), // Convert to cents
		},
		CustomerDetails: MidtransCustomerDetail{
			FirstName: user.Name,
			Email:     user.Email,
		},
		ItemDetails: []MidtransItemDetail{
			{
				ID:       fmt.Sprintf("course_%d", req.CourseID),
				Price:    int64(course.Price * 100),
				Quantity: 1,
				Name:     course.Title,
			},
		},
	}

	// Call Midtrans API
	chargeResp, err := s.callMidtransAPI(chargeReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment: %w", err)
	}

	// Update transaction with Midtrans response
	transaction.PaymentType = chargeResp.PaymentType
	transaction.PaymentURL = chargeResp.RedirectURL
	transaction.MidtransResponse = fmt.Sprintf("%+v", chargeResp)

	// Save transaction
	if err := s.repo.Create(transaction); err != nil {
		return nil, fmt.Errorf("failed to save transaction: %w", err)
	}

	// Convert to response
	response := &PaymentResponse{
		ID:                transaction.ID,
		UserID:            transaction.UserID,
		CourseID:          transaction.CourseID,
		CourseTitle:       course.Title,
		UserName:          user.Name,
		OrderID:           transaction.OrderID,
		GrossAmount:       transaction.GrossAmount,
		PaymentType:       transaction.PaymentType,
		TransactionStatus: transaction.TransactionStatus,
		TransactionTime:   transaction.TransactionTime,
		PaymentURL:        transaction.PaymentURL,
		CreatedAt:         transaction.CreatedAt,
		UpdatedAt:         transaction.UpdatedAt,
	}

	return response, nil
}

func (s *paymentService) GetPaymentStatus(orderID string) (*PaymentResponse, error) {
	transaction, err := s.repo.FindByOrderID(orderID)
	if err != nil {
		return nil, fmt.Errorf("payment not found: %w", err)
	}

	response := &PaymentResponse{
		ID:                transaction.ID,
		UserID:            transaction.UserID,
		CourseID:          transaction.CourseID,
		CourseTitle:       transaction.Course.Title,
		UserName:          transaction.User.Name,
		OrderID:           transaction.OrderID,
		GrossAmount:       transaction.GrossAmount,
		PaymentType:       transaction.PaymentType,
		TransactionStatus: transaction.TransactionStatus,
		TransactionTime:   transaction.TransactionTime,
		SettlementTime:    transaction.SettlementTime,
		PaymentURL:        transaction.PaymentURL,
		CreatedAt:         transaction.CreatedAt,
		UpdatedAt:         transaction.UpdatedAt,
	}

	return response, nil
}

func (s *paymentService) GetUserPayments(userID uint, page, limit int) ([]PaymentResponse, int, error) {
	transactions, total, err := s.repo.FindByUserID(userID, page, limit)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]PaymentResponse, len(transactions))
	for i, transaction := range transactions {
		responses[i] = PaymentResponse{
			ID:                transaction.ID,
			UserID:            transaction.UserID,
			CourseID:          transaction.CourseID,
			CourseTitle:       transaction.Course.Title,
			UserName:          transaction.User.Name,
			OrderID:           transaction.OrderID,
			GrossAmount:       transaction.GrossAmount,
			PaymentType:       transaction.PaymentType,
			TransactionStatus: transaction.TransactionStatus,
			TransactionTime:   transaction.TransactionTime,
			SettlementTime:    transaction.SettlementTime,
			PaymentURL:        transaction.PaymentURL,
			CreatedAt:         transaction.CreatedAt,
			UpdatedAt:         transaction.UpdatedAt,
		}
	}

	return responses, total, nil
}

func (s *paymentService) GetAllPayments(page, limit int) ([]PaymentResponse, int, error) {
	transactions, total, err := s.repo.FindAll(page, limit)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]PaymentResponse, len(transactions))
	for i, transaction := range transactions {
		responses[i] = PaymentResponse{
			ID:                transaction.ID,
			UserID:            transaction.UserID,
			CourseID:          transaction.CourseID,
			CourseTitle:       transaction.Course.Title,
			UserName:          transaction.User.Name,
			OrderID:           transaction.OrderID,
			GrossAmount:       transaction.GrossAmount,
			PaymentType:       transaction.PaymentType,
			TransactionStatus: transaction.TransactionStatus,
			TransactionTime:   transaction.TransactionTime,
			SettlementTime:    transaction.SettlementTime,
			PaymentURL:        transaction.PaymentURL,
			CreatedAt:         transaction.CreatedAt,
			UpdatedAt:         transaction.UpdatedAt,
		}
	}

	return responses, total, nil
}

func (s *paymentService) HandleMidtransNotification(notification MidtransNotification) error {
	// Verify signature
	expectedSignature := s.generateSignature(notification.OrderID, notification.StatusCode, notification.GrossAmount, s.midtransConfig.ServerKey)
	if expectedSignature != notification.SignatureKey {
		return fmt.Errorf("invalid signature")
	}

	// Parse settlement time if provided
	var settlementTime *time.Time
	if notification.SettlementTime != "" {
		if parsedTime, err := time.Parse("2006-01-02 15:04:05", notification.SettlementTime); err == nil {
			settlementTime = &parsedTime
		}
	}

	// Update payment status
	err := s.repo.UpdateStatus(notification.OrderID, notification.TransactionStatus, settlementTime)
	if err != nil {
		return fmt.Errorf("failed to update payment status: %w", err)
	}

	// If payment is successful, enroll user in course
	if notification.TransactionStatus == "settlement" {
		if err := s.enrollUserInCourse(notification.OrderID); err != nil {
			// Log error but don't fail the webhook
			fmt.Printf("Failed to enroll user in course: %v\n", err)
		}
	}

	return nil
}

func (s *paymentService) callMidtransAPI(req MidtransChargeRequest) (*MidtransChargeResponse, error) {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	url := s.midtransConfig.BaseURL + "/v2/charge"
	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("Authorization", "Basic "+s.encodeBase64(s.midtransConfig.ServerKey+":"))

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var chargeResp MidtransChargeResponse
	if err := json.Unmarshal(body, &chargeResp); err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("midtrans API error: %s", chargeResp.StatusMessage)
	}

	return &chargeResp, nil
}

func (s *paymentService) generateSignature(orderID, statusCode, grossAmount, serverKey string) string {
	hash := sha512.Sum512([]byte(orderID + statusCode + grossAmount + serverKey))
	return fmt.Sprintf("%x", hash)
}

func (s *paymentService) encodeBase64(str string) string {
	// Simple base64 encoding (in real implementation, use proper base64 package)
	return "base64_encoded_string"
}

// Helper methods (these will need to be implemented with proper repositories)
func (s *paymentService) getCourseByID(courseID uint) (*Course, error) {
	// This should use the course repository
	// For now, return a mock course
	return &Course{
		ID:    courseID,
		Title: "Sample Course",
		Price: 50000, // 50,000 IDR
	}, nil
}

func (s *paymentService) getUserByID(userID uint) (*User, error) {
	// This should use the user repository
	// For now, return a mock user
	return &User{
		ID:    userID,
		Name:  "Sample User",
		Email: "user@example.com",
	}, nil
}

func (s *paymentService) enrollUserInCourse(orderID string) error {
	// This should enroll the user in the course after successful payment
	// Implementation depends on enrollment system
	return nil
}

// Mock types (these should be imported from their respective packages)
type Course struct {
	ID    uint
	Title string
	Price float64
}

type User struct {
	ID    uint
	Name  string
	Email string
}