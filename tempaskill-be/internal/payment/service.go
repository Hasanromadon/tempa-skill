package payment

import (
	"bytes"
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/course"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/auth"
	"github.com/google/uuid"
)

type PaymentService interface {
	CreatePayment(userID uint, req CreatePaymentRequest) (*PaymentResponse, error)
	GetPaymentStatus(orderID string) (*PaymentResponse, error)
	GetUserPayments(userID uint, page, limit int) ([]PaymentResponse, int, error)
	GetAllPayments(page, limit int) ([]PaymentResponse, int, error)
	GetPayments(userID uint, userRole string, query PaymentListQuery) ([]PaymentWithDetails, int, error)
	GetPaymentStats(userID uint, userRole string) (*PaymentStatsResponse, error)
	HandleMidtransNotification(notification MidtransNotification) error
}

type paymentService struct {
	repo           PaymentRepository
	courseRepo     course.Repository
	userRepo       auth.Repository
	midtransConfig MidtransConfig
}

type MidtransConfig struct {
	ServerKey    string
	ClientKey    string
	IsProduction bool
	BaseURL      string
}

func NewPaymentService(repo PaymentRepository, courseRepo course.Repository, userRepo auth.Repository, config MidtransConfig) PaymentService {
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

	// Check for existing pending payment (duplicate prevention)
	pendingPayment, err := s.repo.FindPendingPaymentByUserAndCourse(userID, req.CourseID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing payment: %w", err)
	}
	
	if pendingPayment != nil {
		// Check if payment is still valid (<24 hours old)
		if time.Since(pendingPayment.CreatedAt) < 24*time.Hour {
			// Return existing payment instead of creating new one
			return &PaymentResponse{
				ID:                pendingPayment.ID,
				UserID:            pendingPayment.UserID,
				CourseID:          pendingPayment.CourseID,
				CourseTitle:       course.Title,
				OrderID:           pendingPayment.OrderID,
				GrossAmount:       pendingPayment.GrossAmount,
				TransactionStatus: pendingPayment.TransactionStatus,
				PaymentType:       pendingPayment.PaymentType,
				TransactionTime:   pendingPayment.TransactionTime,
				SettlementTime:    pendingPayment.SettlementTime,
				PaymentURL:        pendingPayment.PaymentURL,
				SnapToken:         pendingPayment.SnapToken,
				CreatedAt:         pendingPayment.CreatedAt,
				UpdatedAt:         pendingPayment.UpdatedAt,
			}, nil
		}
		
		// Payment is older than 24 hours, expire it
		pendingPayment.TransactionStatus = "expired"
		if err := s.repo.Update(pendingPayment); err != nil {
			// Log error but continue creating new payment
			fmt.Printf("Warning: Failed to expire old payment %s: %v\n", pendingPayment.OrderID, err)
		}
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
		GrossAmount:       float64(course.Price),
		TransactionStatus: "pending",
		TransactionTime:   time.Now(),
	}

	// Create Midtrans Snap request
	// Note: Not specifying enabled_payments will show all available payment methods for this merchant
	snapReq := MidtransSnapRequest{
		TransactionDetails: MidtransTransactionDetail{
			OrderID:     orderID,
			GrossAmount: int64(course.Price), // Midtrans uses full Rupiah amount
		},
		CustomerDetails: MidtransCustomerDetail{
			FirstName: user.Name,
			Email:     user.Email,
		},
		ItemDetails: []MidtransItemDetail{
			{
				ID:       fmt.Sprintf("course_%d", req.CourseID),
				Price:    int64(course.Price),
				Quantity: 1,
				Name:     course.Title,
			},
		},
		// DON'T send EnabledPayments - let Midtrans show what's available for this merchant
		// EnabledPayments: enabledPayments,
	}

	// Add GoPay callback configuration if GoPay is selected
	if req.PaymentMethod == "gopay" {
		snapReq.GoPay = &MidtransGoPayConfig{
			EnableCallback: true,
			CallbackURL:    "https://your-frontend-domain.com/payment/success",
		}
	}

	// Call Midtrans Snap API
	snapResp, err := s.callMidtransSnapAPI(snapReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment: %w", err)
	}

	// Update transaction with Midtrans response
	transaction.PaymentType = req.PaymentMethod
	if transaction.PaymentType == "" {
		transaction.PaymentType = "snap" // Default to snap
	}
	transaction.PaymentURL = snapResp.RedirectURL
	transaction.SnapToken = snapResp.Token
	transaction.MidtransResponse = fmt.Sprintf("%+v", snapResp)

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
		SnapToken:         transaction.SnapToken, // Include Snap token for frontend
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
		SnapToken:         transaction.SnapToken, // FIXED: Include snap_token for Snap.js
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
			SnapToken:         transaction.SnapToken, // FIXED: Include snap_token
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
			SnapToken:         transaction.SnapToken, // FIXED: Include snap_token
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

// GetPayments retrieves payments with role-based filtering
func (s *paymentService) GetPayments(userID uint, userRole string, query PaymentListQuery) ([]PaymentWithDetails, int, error) {
	// Apply role-based filters
	switch userRole {
	case "instructor":
		// Instructor can only see settlement transactions from their courses
		query.Status = "settlement"
		query.InstructorID = userID
	case "student":
		// Student can only see their own transactions
		// This will be handled by filtering in the handler
		// For now, we don't set additional filters here
	case "admin":
		// Admin sees everything, no additional filters
	default:
		return nil, 0, fmt.Errorf("invalid user role")
	}

	// Retrieve transactions from repository
	transactions, total, err := s.repo.FindWithFilters(query)
	if err != nil {
		return nil, 0, err
	}

	// Convert to detailed response
	responses := make([]PaymentWithDetails, len(transactions))
	for i, transaction := range transactions {
		response := PaymentWithDetails{
			ID:                transaction.ID,
			OrderID:           transaction.OrderID,
			GrossAmount:       transaction.GrossAmount,
			PaymentType:       transaction.PaymentType,
			SnapToken:         transaction.SnapToken,
			TransactionStatus: transaction.TransactionStatus,
			TransactionTime:   transaction.TransactionTime,
			SettlementTime:    transaction.SettlementTime,
			PaymentURL:        transaction.PaymentURL,
			UserID:            transaction.UserID,
			CourseID:          transaction.CourseID,
			CreatedAt:         transaction.CreatedAt,
			UpdatedAt:         transaction.UpdatedAt,
		}

		// Add user details
		if transaction.User.ID > 0 {
			response.UserName = transaction.User.Name
			response.UserEmail = transaction.User.Email
		}

		// Add course details
		if transaction.Course.ID > 0 {
			response.CourseTitle = transaction.Course.Title
			response.CourseSlug = transaction.Course.Slug
			
			// Add instructor details if available
			if transaction.Course.Instructor.ID > 0 {
				response.InstructorID = transaction.Course.Instructor.ID
				response.InstructorName = transaction.Course.Instructor.Name
			}
		}

		responses[i] = response
	}

	return responses, total, nil
}

// GetPaymentStats retrieves payment statistics with role-based filtering
func (s *paymentService) GetPaymentStats(userID uint, userRole string) (*PaymentStatsResponse, error) {
	// Build query based on role
	var totalRevenue float64
	var pendingAmount float64
	var totalTransactions int64
	
	db := s.repo.(*paymentRepository).db.Model(&PaymentTransaction{})
	
	switch userRole {
	case "instructor":
		// Instructor only sees settlement from their courses
		db = db.Joins("JOIN courses ON courses.id = payment_transactions.course_id").
			Where("courses.instructor_id = ? AND payment_transactions.transaction_status = ?", userID, "settlement")
		
		// Get total revenue (settlement only)
		db.Select("COALESCE(SUM(gross_amount), 0)").Scan(&totalRevenue)
		
		// Get total transactions
		db.Count(&totalTransactions)
		
		// Instructor doesn't see pending
		pendingAmount = 0
		
	case "admin":
		// Admin sees all transactions
		
		// Total revenue (settlement only)
		s.repo.(*paymentRepository).db.Model(&PaymentTransaction{}).
			Where("transaction_status = ?", "settlement").
			Select("COALESCE(SUM(gross_amount), 0)").Scan(&totalRevenue)
		
		// Pending amount
		s.repo.(*paymentRepository).db.Model(&PaymentTransaction{}).
			Where("transaction_status = ?", "pending").
			Select("COALESCE(SUM(gross_amount), 0)").Scan(&pendingAmount)
		
		// Total transactions
		s.repo.(*paymentRepository).db.Model(&PaymentTransaction{}).Count(&totalTransactions)
		
	case "student":
		// Student sees their own transactions
		db = db.Where("user_id = ?", userID)
		
		// Total spent (settlement only)
		db.Where("transaction_status = ?", "settlement").
			Select("COALESCE(SUM(gross_amount), 0)").Scan(&totalRevenue)
		
		// Total transactions
		s.repo.(*paymentRepository).db.Model(&PaymentTransaction{}).
			Where("user_id = ?", userID).
			Count(&totalTransactions)
		
		pendingAmount = 0
	default:
		return nil, fmt.Errorf("invalid user role")
	}
	
	return &PaymentStatsResponse{
		TotalRevenue:      totalRevenue,
		PendingAmount:     pendingAmount,
		TotalTransactions: int(totalTransactions),
	}, nil
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

func (s *paymentService) callMidtransSnapAPI(req MidtransSnapRequest) (*MidtransSnapResponse, error) {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	// Snap API endpoint (different from Core API)
	url := "https://app.sandbox.midtrans.com/snap/v1/transactions"
	if s.midtransConfig.IsProduction {
		url = "https://app.midtrans.com/snap/v1/transactions"
	}

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")
	
	// Midtrans Authorization: Basic Base64(ServerKey:)
	// Format: {ServerKey}: (colon at the end, no password)
	authString := s.midtransConfig.ServerKey + ":"
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(authString))
	httpReq.Header.Set("Authorization", "Basic "+encodedAuth)

	// Debug logging
	fmt.Printf("🔑 Midtrans Request Debug:\n")
	fmt.Printf("  Server Key (first 20 chars): %s...\n", s.midtransConfig.ServerKey[:20])
	fmt.Printf("  Auth String (first 25 chars): %s...\n", authString[:25])
	fmt.Printf("  Encoded Auth (first 30 chars): %s...\n", encodedAuth[:30])
	fmt.Printf("  URL: %s\n", url)
	fmt.Printf("  Request Body: %s\n", string(jsonData))

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

	fmt.Printf("📥 Midtrans Response:\n")
	fmt.Printf("  Status Code: %d\n", resp.StatusCode)
	fmt.Printf("  Body: %s\n", string(body))

	var snapResp MidtransSnapResponse
	if err := json.Unmarshal(body, &snapResp); err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		if snapResp.StatusMessage != "" {
			return nil, fmt.Errorf("midtrans API error: %s", snapResp.StatusMessage)
		}
		return nil, fmt.Errorf("midtrans API error: status code %d", resp.StatusCode)
	}

	return &snapResp, nil
}

func (s *paymentService) generateSignature(orderID, statusCode, grossAmount, serverKey string) string {
	hash := sha512.Sum512([]byte(orderID + statusCode + grossAmount + serverKey))
	return fmt.Sprintf("%x", hash)
}

// Helper methods (these will need to be implemented with proper repositories)
func (s *paymentService) getCourseByID(courseID uint) (*course.Course, error) {
	// Use course repository to fetch actual course
	c, err := s.courseRepo.FindCourseByID(nil, courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get course: %v", err)
	}
	return c, nil
}

func (s *paymentService) getUserByID(userID uint) (*auth.User, error) {
	// Use user repository to fetch actual user
	u, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %v", err)
	}
	return u, nil
}

func (s *paymentService) enrollUserInCourse(orderID string) error {
	// This should enroll the user in the course after successful payment
	// Implementation depends on enrollment system
	return nil
}