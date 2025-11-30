package payment

import (
	"time"
	
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/auth"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/course"
)

type PaymentTransaction struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	UserID            uint      `gorm:"not null;index" json:"user_id"`
	CourseID          uint      `gorm:"not null;index" json:"course_id"`
	OrderID           string    `gorm:"uniqueIndex;size:100;not null" json:"order_id"`
	GrossAmount       float64   `gorm:"type:decimal(15,2);not null" json:"gross_amount"`
	PaymentType       string    `gorm:"size:50" json:"payment_type"`
	TransactionStatus string    `gorm:"size:20;not null;default:'pending'" json:"transaction_status"`
	TransactionTime   time.Time `json:"transaction_time"`
	SettlementTime    *time.Time `json:"settlement_time,omitempty"`
	PaymentURL        string    `gorm:"size:500" json:"payment_url,omitempty"`
	MidtransResponse  string    `gorm:"type:text" json:"midtrans_response,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`

	// Relations
	User   auth.User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Course course.Course `gorm:"foreignKey:CourseID" json:"course,omitempty"`
}