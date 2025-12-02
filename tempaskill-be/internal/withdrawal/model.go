package withdrawal

import (
	"time"
)

type InstructorEarning struct {
	ID                   uint      `gorm:"primaryKey" json:"id"`
	InstructorID         uint      `gorm:"not null;index:idx_instructor_status" json:"instructor_id"`
	PaymentTransactionID uint      `gorm:"not null;index" json:"payment_transaction_id"`
	CourseID             uint      `gorm:"not null" json:"course_id"`
	GrossAmount          float64   `gorm:"type:decimal(15,2);not null" json:"gross_amount"`
	PlatformFee          float64   `gorm:"type:decimal(15,2);not null" json:"platform_fee"`
	InstructorShare      float64   `gorm:"type:decimal(15,2);not null" json:"instructor_share"`
	TransactionDate      time.Time `gorm:"not null;index" json:"transaction_date"`
	AvailableDate        time.Time `gorm:"not null;index" json:"available_date"`
	Status               string    `gorm:"type:varchar(20);default:'held';index:idx_instructor_status" json:"status"`
	WithdrawnAt          *time.Time `json:"withdrawn_at,omitempty"`
	WithdrawalID         *uint     `json:"withdrawal_id,omitempty"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

type WithdrawalRequest struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	UserID        uint       `gorm:"not null;index:idx_user_status" json:"user_id"`
	Amount        float64    `gorm:"type:decimal(15,2);not null" json:"amount"`
	AdminFee      float64    `gorm:"type:decimal(15,2);not null;default:0" json:"admin_fee"`
	NetAmount     float64    `gorm:"type:decimal(15,2);not null" json:"net_amount"`
	Status        string     `gorm:"type:varchar(20);default:'pending';index" json:"status"`
	BankAccountID uint       `gorm:"not null" json:"bank_account_id"`
	Notes         string     `gorm:"type:text" json:"notes,omitempty"`
	ProcessedAt   *time.Time `gorm:"index" json:"processed_at,omitempty"`
	ProcessedBy   *uint      `json:"processed_by,omitempty"`
	CreatedAt     time.Time  `gorm:"index" json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	
	BankAccount InstructorBankAccount `gorm:"foreignKey:BankAccountID" json:"bank_account,omitempty"`
}

type InstructorBankAccount struct {
	ID                 uint       `gorm:"primaryKey" json:"id"`
	UserID             uint       `gorm:"not null;index" json:"user_id"`
	BankName           string     `gorm:"type:varchar(100);not null;index:idx_account_number" json:"bank_name"`
	AccountNumber      string     `gorm:"type:varchar(50);not null;index:idx_account_number" json:"account_number"`
	AccountHolderName  string     `gorm:"type:varchar(100);not null" json:"account_holder_name"`
	VerificationStatus string     `gorm:"type:enum('pending','verified','rejected');default:'pending';index" json:"verification_status"` // pending, verified, rejected
	VerifiedAt         *time.Time `json:"verified_at,omitempty"`
	VerifiedBy         *uint      `json:"verified_by,omitempty"`
	VerificationNotes  string     `gorm:"type:text" json:"verification_notes,omitempty"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
	
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

type User struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}
