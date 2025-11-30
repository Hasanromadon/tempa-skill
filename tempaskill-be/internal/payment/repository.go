package payment

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type PaymentRepository interface {
	Create(transaction *PaymentTransaction) error
	FindByOrderID(orderID string) (*PaymentTransaction, error)
	FindByID(id uint) (*PaymentTransaction, error)
	FindByUserID(userID uint, page, limit int) ([]PaymentTransaction, int, error)
	FindAll(page, limit int) ([]PaymentTransaction, int, error)
	FindWithFilters(query PaymentListQuery) ([]PaymentTransaction, int, error)
	Update(transaction *PaymentTransaction) error
	UpdateStatus(orderID, status string, settlementTime *time.Time) error
	FindPendingPaymentByUserAndCourse(userID uint, courseID uint) (*PaymentTransaction, error)
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

// FindWithFilters retrieves payments with advanced filtering, pagination, and sorting
func (r *paymentRepository) FindWithFilters(query PaymentListQuery) ([]PaymentTransaction, int, error) {
	var transactions []PaymentTransaction
	var total int64

	// Build base query
	db := r.db.Model(&PaymentTransaction{})

	// Apply filters
	if query.Status != "" {
		db = db.Where("payment_transactions.transaction_status = ?", query.Status)
	}

	if query.CourseID > 0 {
		db = db.Where("payment_transactions.course_id = ?", query.CourseID)
	}

	if query.InstructorID > 0 {
		// Need to join courses table for instructor filter
		db = db.Joins("JOIN courses ON courses.id = payment_transactions.course_id").
			Where("courses.instructor_id = ?", query.InstructorID)
	}

	// Search by user name or email
	if query.Search != "" {
		searchPattern := "%" + query.Search + "%"
		// Need to join users table for search
		db = db.Joins("JOIN users ON users.id = payment_transactions.user_id").
			Where("users.name LIKE ? OR users.email LIKE ?", searchPattern, searchPattern)
	}

	// Count total before pagination
	db.Count(&total)

	// Sorting
	sortBy := "payment_transactions.created_at"
	sortOrder := "DESC"
	
	if query.SortBy != "" {
		switch query.SortBy {
		case "amount":
			sortBy = "payment_transactions.gross_amount"
		case "date":
			sortBy = "payment_transactions.created_at"
		case "status":
			sortBy = "payment_transactions.transaction_status"
		}
	}
	
	if query.SortOrder != "" && (query.SortOrder == "ASC" || query.SortOrder == "DESC") {
		sortOrder = query.SortOrder
	}

	// Pagination
	offset := (query.Page - 1) * query.Limit
	
	// Execute query with preloads (use same db query chain)
	err := db.Preload("User").Preload("Course").Preload("Course.Instructor").
		Order(sortBy + " " + sortOrder).
		Offset(offset).
		Limit(query.Limit).
		Find(&transactions).Error

	if err != nil {
		return nil, 0, err
	}

	return transactions, int(total), nil
}

func (r *paymentRepository) FindPendingPaymentByUserAndCourse(userID uint, courseID uint) (*PaymentTransaction, error) {
	var transaction PaymentTransaction
	err := r.db.Preload("User").Preload("Course").
		Where("user_id = ? AND course_id = ? AND transaction_status = ?", userID, courseID, "pending").
		Order("created_at DESC").
		First(&transaction).Error
	
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // No pending payment found, not an error
		}
		return nil, err
	}
	
	return &transaction, nil
}

// NewRepository creates a new payment repository
func NewRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db: db}
}