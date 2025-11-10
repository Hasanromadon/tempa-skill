package payment

import "time"

// Request DTOs
type CreatePaymentRequest struct {
	CourseID      uint   `json:"course_id" binding:"required"`
	PaymentMethod string `json:"payment_method,omitempty"` // gopay, bank_transfer, credit_card, qris
}

// Response DTOs
type PaymentResponse struct {
	ID                uint      `json:"id"`
	UserID            uint      `json:"user_id"`
	CourseID          uint      `json:"course_id"`
	CourseTitle       string    `json:"course_title"`
	UserName          string    `json:"user_name"`
	OrderID           string    `json:"order_id"`
	GrossAmount       float64   `json:"gross_amount"`
	PaymentType       string    `json:"payment_type"`
	TransactionStatus string    `json:"transaction_status"`
	TransactionTime   time.Time `json:"transaction_time"`
	SettlementTime    *time.Time `json:"settlement_time,omitempty"`
	PaymentURL        string    `json:"payment_url,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
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

// Midtrans API structures
type MidtransChargeRequest struct {
	PaymentType        string                    `json:"payment_type"`
	TransactionDetails MidtransTransactionDetail `json:"transaction_details"`
	CustomerDetails    MidtransCustomerDetail    `json:"customer_details,omitempty"`
	ItemDetails        []MidtransItemDetail      `json:"item_details,omitempty"`
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

type MidtransChargeResponse struct {
	Token              string `json:"token,omitempty"`
	RedirectURL        string `json:"redirect_url,omitempty"`
	StatusCode         string `json:"status_code"`
	StatusMessage      string `json:"status_message"`
	TransactionID      string `json:"transaction_id"`
	OrderID            string `json:"order_id"`
	GrossAmount        string `json:"gross_amount"`
	PaymentType        string `json:"payment_type"`
	TransactionTime    string `json:"transaction_time"`
	TransactionStatus  string `json:"transaction_status"`
	FraudStatus        string `json:"fraud_status,omitempty"`
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