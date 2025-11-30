package payment

import "time"

// Request DTOs
type CreatePaymentRequest struct {
	CourseID      uint   `json:"course_id" binding:"required"`
	PaymentMethod string `json:"payment_method,omitempty"` // gopay, bank_transfer, credit_card, qris
}

// PaymentListQuery contains query parameters for listing payments
type PaymentListQuery struct {
	Page              int    `form:"page"`
	Limit             int    `form:"limit"`
	Search            string `form:"search"`            // Search user name/email
	Status            string `form:"status"`            // settlement, pending, expired, failed
	CourseID          uint   `form:"course_id"`         // Filter by course
	InstructorID      uint   `form:"instructor_id"`     // Admin only: filter by instructor
	SortBy            string `form:"sort_by"`           // created_at, gross_amount
	SortOrder         string `form:"sort_order"`        // asc, desc
}

// Response DTOs
type PaymentResponse struct {
	ID                uint       `json:"id"`
	UserID            uint       `json:"user_id"`
	CourseID          uint       `json:"course_id"`
	CourseTitle       string     `json:"course_title"`
	UserName          string     `json:"user_name"`
	OrderID           string     `json:"order_id"`
	GrossAmount       float64    `json:"gross_amount"`
	PaymentType       string     `json:"payment_type"`
	SnapToken         string     `json:"snap_token,omitempty"` // For frontend Snap.js integration
	TransactionStatus string     `json:"transaction_status"`
	TransactionTime   time.Time  `json:"transaction_time"`
	SettlementTime    *time.Time `json:"settlement_time,omitempty"`
	PaymentURL        string     `json:"payment_url,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// PaymentWithDetails contains full payment information with user and course details
type PaymentWithDetails struct {
	ID                uint       `json:"id"`
	OrderID           string     `json:"order_id"`
	GrossAmount       float64    `json:"gross_amount"`
	PaymentType       string     `json:"payment_type"`
	SnapToken         string     `json:"snap_token,omitempty"` // For Snap.js integration
	TransactionStatus string     `json:"transaction_status"`
	TransactionTime   time.Time  `json:"transaction_time"`
	SettlementTime    *time.Time `json:"settlement_time,omitempty"`
	PaymentURL        string     `json:"payment_url,omitempty"` // For repayment
	
	// User details
	UserID    uint   `json:"user_id"`
	UserName  string `json:"user_name"`
	UserEmail string `json:"user_email"`
	
	// Course details
	CourseID         uint   `json:"course_id"`
	CourseTitle      string `json:"course_title"`
	CourseSlug       string `json:"course_slug"`
	InstructorID     uint   `json:"instructor_id"`
	InstructorName   string `json:"instructor_name"`
	
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type PaymentListResponse struct {
	Payments []PaymentResponse `json:"payments"`
	Pagination struct {
		Page       int `json:"page"`
		Limit      int `json:"limit"`
		Total      int `json:"total"`
		TotalPages int `json:"total_pages"`
	} `json:"pagination"`
}

// PaymentStatsResponse contains statistics for payment overview
type PaymentStatsResponse struct {
	TotalRevenue      float64 `json:"total_revenue"`
	PendingAmount     float64 `json:"pending_amount"`
	TotalTransactions int     `json:"total_transactions"`
}

// Midtrans DTOs for Snap API
type MidtransSnapRequest struct {
	TransactionDetails MidtransTransactionDetail `json:"transaction_details"`
	CustomerDetails    MidtransCustomerDetail    `json:"customer_details,omitempty"`
	ItemDetails        []MidtransItemDetail      `json:"item_details,omitempty"`
	EnabledPayments    []string                  `json:"enabled_payments,omitempty"`
	GoPay              *MidtransGoPayConfig      `json:"gopay,omitempty"`
}

// GoPay specific configuration
type MidtransGoPayConfig struct {
	EnableCallback bool   `json:"enable_callback"`
	CallbackURL    string `json:"callback_url,omitempty"`
}

type MidtransTransactionDetail struct {
	OrderID     string  `json:"order_id"`
	GrossAmount int64   `json:"gross_amount"`
}

type MidtransCustomerDetail struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name,omitempty"`
	Email     string `json:"email"`
	Phone     string `json:"phone,omitempty"`
}

type MidtransItemDetail struct {
	ID       string  `json:"id"`
	Price    int64   `json:"price"`
	Quantity int     `json:"quantity"`
	Name     string  `json:"name"`
}

type MidtransSnapResponse struct {
	Token         string `json:"token"`
	RedirectURL   string `json:"redirect_url"`
	StatusCode    string `json:"status_code,omitempty"`
	StatusMessage string `json:"status_message,omitempty"`
}

// Midtrans notification webhook
type MidtransNotification struct {
	TransactionType   string `json:"transaction_type"`
	TransactionTime   string `json:"transaction_time"`
	TransactionStatus string `json:"transaction_status"`
	TransactionID     string `json:"transaction_id"`
	StatusMessage     string `json:"status_message"`
	StatusCode        string `json:"status_code"`
	SignatureKey      string `json:"signature_key"`
	SettlementTime    string `json:"settlement_time,omitempty"`
	PaymentType       string `json:"payment_type"`
	OrderID           string `json:"order_id"`
	MerchantID        string `json:"merchant_id"`
	GrossAmount       string `json:"gross_amount"`
	FraudStatus       string `json:"fraud_status,omitempty"`
	Currency          string `json:"currency"`
}