package payment

import (
	"time"

	"gorm.io/gorm"
)

type PaymentRepository interface {
	Create(transaction *PaymentTransaction) error
	FindByOrderID(orderID string) (*PaymentTransaction, error)
	FindByID(id uint) (*PaymentTransaction, error)
	FindByUserID(userID uint, page, limit int) ([]PaymentTransaction, int, error)
	FindAll(page, limit int) ([]PaymentTransaction, int, error)
	Update(transaction *PaymentTransaction) error
	UpdateStatus(orderID, status string, settlementTime *time.Time) error
}

type paymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db: db}
}

func (r *paymentRepository) Create(transaction *PaymentTransaction) error {
	return r.db.Create(transaction).Error
}

func (r *paymentRepository) FindByOrderID(orderID string) (*PaymentTransaction, error) {
	var transaction PaymentTransaction
	err := r.db.Preload("User").Preload("Course").Where("order_id = ?", orderID).First(&transaction).Error
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *paymentRepository) FindByID(id uint) (*PaymentTransaction, error) {
	var transaction PaymentTransaction
	err := r.db.Preload("User").Preload("Course").First(&transaction, id).Error
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *paymentRepository) FindByUserID(userID uint, page, limit int) ([]PaymentTransaction, int, error) {
	var transactions []PaymentTransaction
	var total int64

	offset := (page - 1) * limit

	// Get total count
	r.db.Model(&PaymentTransaction{}).Where("user_id = ?", userID).Count(&total)

	// Get paginated results
	err := r.db.Preload("User").Preload("Course").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&transactions).Error

	if err != nil {
		return nil, 0, err
	}

	return transactions, int(total), nil
}

func (r *paymentRepository) FindAll(page, limit int) ([]PaymentTransaction, int, error) {
	var transactions []PaymentTransaction
	var total int64

	offset := (page - 1) * limit

	// Get total count
	r.db.Model(&PaymentTransaction{}).Count(&total)

	// Get paginated results
	err := r.db.Preload("User").Preload("Course").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&transactions).Error

	if err != nil {
		return nil, 0, err
	}

	return transactions, int(total), nil
}

func (r *paymentRepository) Update(transaction *PaymentTransaction) error {
	return r.db.Save(transaction).Error
}

func (r *paymentRepository) UpdateStatus(orderID, status string, settlementTime *time.Time) error {
	updateData := map[string]interface{}{
		"transaction_status": status,
		"updated_at":         time.Now(),
	}

	if settlementTime != nil {
		updateData["settlement_time"] = settlementTime
	}

	return r.db.Model(&PaymentTransaction{}).
		Where("order_id = ?", orderID).
		Updates(updateData).Error
}

// NewRepository creates a new payment repository
func NewRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db: db}
}