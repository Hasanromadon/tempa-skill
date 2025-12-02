package withdrawal

import "time"

type BalanceResponse struct {
	TotalEarnings    float64 `json:"total_earnings"`
	AvailableBalance float64 `json:"available_balance"`
	HeldBalance      float64 `json:"held_balance"`
	WithdrawnAmount  float64 `json:"withdrawn_amount"`
	PendingAmount    float64 `json:"pending_amount"`
}

type CreateWithdrawalRequest struct {
	Amount        float64 `json:"amount" binding:"required,min=50000,max=10000000"`
	BankAccountID uint    `json:"bank_account_id" binding:"required"`
	Notes         string  `json:"notes"`
}

type WithdrawalResponse struct {
	ID            uint      `json:"id"`
	Amount        float64   `json:"amount"`
	AdminFee      float64   `json:"admin_fee"`
	NetAmount     float64   `json:"net_amount"`
	Status        string    `json:"status"`
	BankAccountID uint      `json:"bank_account_id"`
	Notes         string    `json:"notes,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

type ProcessWithdrawalRequest struct {
	Status string `json:"status" binding:"required,oneof=completed failed"`
	Notes  string `json:"notes"`
}

type BankAccountRequest struct {
	BankName          string `json:"bank_name" binding:"required"`
	AccountNumber     string `json:"account_number" binding:"required"`
	AccountHolderName string `json:"account_holder_name" binding:"required"`
}

type BankAccountResponse struct {
	ID                 uint       `json:"id"`
	BankName           string     `json:"bank_name"`
	AccountNumber      string     `json:"account_number"`
	AccountHolderName  string     `json:"account_holder_name"`
	VerificationStatus string     `json:"verification_status"` // pending, verified, rejected
	VerifiedAt         *time.Time `json:"verified_at,omitempty"`
	VerificationNotes  string     `json:"verification_notes,omitempty"`
	CreatedAt          time.Time  `json:"created_at"`
}
