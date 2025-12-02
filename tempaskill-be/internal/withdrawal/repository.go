package withdrawal

import (
	"time"
	"gorm.io/gorm"
)

type WithdrawalRepository interface {
	GetBalance(instructorID uint) (*BalanceResponse, error)
	CreateWithdrawal(withdrawal *WithdrawalRequest) error
	GetWithdrawalByID(id uint) (*WithdrawalRequest, error)
	ListWithdrawals(instructorID uint, status string, limit, offset int) ([]WithdrawalRequest, int64, error)
	UpdateWithdrawalStatus(id uint, status string, processedBy uint, notes string) error
	HasPendingWithdrawal(instructorID uint) (bool, error)
	
	// Bank account methods
	GetVerifiedBankAccount(userID uint) (*InstructorBankAccount, error)
	GetPendingBankAccount(userID uint) (*InstructorBankAccount, error)
	HasPendingBankAccount(userID uint) (bool, error)
	ListBankAccounts(status string, limit, offset int) ([]InstructorBankAccount, int64, error)
	CreateBankAccount(account *InstructorBankAccount) error
	VerifyBankAccount(id uint, verifiedBy uint, status string, notes string) error
	GetBankAccountByID(id uint) (*InstructorBankAccount, error)
}

type withdrawalRepository struct {
	db *gorm.DB
}

func NewWithdrawalRepository(db *gorm.DB) WithdrawalRepository {
	return &withdrawalRepository{db: db}
}

func (r *withdrawalRepository) GetBalance(instructorID uint) (*BalanceResponse, error) {
	var balance BalanceResponse
	
	r.db.Model(&InstructorEarning{}).
		Where("instructor_id = ?", instructorID).
		Select("COALESCE(SUM(instructor_share), 0) as total_earnings").
		Scan(&balance.TotalEarnings)
	
	r.db.Model(&InstructorEarning{}).
		Where("instructor_id = ? AND status = 'available'", instructorID).
		Select("COALESCE(SUM(instructor_share), 0) as available_balance").
		Scan(&balance.AvailableBalance)
	
	r.db.Model(&InstructorEarning{}).
		Where("instructor_id = ? AND status = 'held'", instructorID).
		Select("COALESCE(SUM(instructor_share), 0) as held_balance").
		Scan(&balance.HeldBalance)
	
	r.db.Model(&InstructorEarning{}).
		Where("instructor_id = ? AND status = 'withdrawn'", instructorID).
		Select("COALESCE(SUM(instructor_share), 0) as withdrawn_amount").
		Scan(&balance.WithdrawnAmount)
	
	r.db.Model(&WithdrawalRequest{}).
		Where("user_id = ? AND status IN ('pending', 'processing')", instructorID).
		Select("COALESCE(SUM(amount), 0) as pending_amount").
		Scan(&balance.PendingAmount)
	
	return &balance, nil
}

func (r *withdrawalRepository) CreateWithdrawal(withdrawal *WithdrawalRequest) error {
	return r.db.Create(withdrawal).Error
}

func (r *withdrawalRepository) GetWithdrawalByID(id uint) (*WithdrawalRequest, error) {
	var withdrawal WithdrawalRequest
	err := r.db.Preload("BankAccount").First(&withdrawal, id).Error
	return &withdrawal, err
}

func (r *withdrawalRepository) ListWithdrawals(instructorID uint, status string, limit, offset int) ([]WithdrawalRequest, int64, error) {
	var withdrawals []WithdrawalRequest
	var total int64
	
	query := r.db.Model(&WithdrawalRequest{}).Preload("BankAccount")
	if instructorID > 0 {
		query = query.Where("user_id = ?", instructorID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Count(&total)
	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&withdrawals).Error
	
	return withdrawals, total, err
}

func (r *withdrawalRepository) UpdateWithdrawalStatus(id uint, status string, processedBy uint, notes string) error {
	now := time.Now()
	return r.db.Model(&WithdrawalRequest{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":       status,
		"processed_by": processedBy,
		"processed_at": now,
		"notes":        notes,
	}).Error
}

func (r *withdrawalRepository) GetVerifiedBankAccount(userID uint) (*InstructorBankAccount, error) {
	var account InstructorBankAccount
	err := r.db.Where("user_id = ? AND verification_status = 'verified'", userID).First(&account).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &account, err
}

func (r *withdrawalRepository) GetPendingBankAccount(userID uint) (*InstructorBankAccount, error) {
	var account InstructorBankAccount
	err := r.db.Where("user_id = ? AND verification_status IN ('pending', 'rejected')", userID).Order("created_at DESC").First(&account).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &account, err
}

func (r *withdrawalRepository) HasPendingBankAccount(userID uint) (bool, error) {
	var count int64
	err := r.db.Model(&InstructorBankAccount{}).Where("user_id = ? AND verification_status = 'pending'", userID).Count(&count).Error
	return count > 0, err
}

func (r *withdrawalRepository) HasPendingWithdrawal(instructorID uint) (bool, error) {
	var count int64
	err := r.db.Model(&WithdrawalRequest{}).Where("user_id = ? AND status IN ('pending', 'processing')", instructorID).Count(&count).Error
	return count > 0, err
}

func (r *withdrawalRepository) GetBankAccountByID(id uint) (*InstructorBankAccount, error) {
	var account InstructorBankAccount
	err := r.db.Preload("User").First(&account, id).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &account, err
}

func (r *withdrawalRepository) ListBankAccounts(status string, limit, offset int) ([]InstructorBankAccount, int64, error) {
	var accounts []InstructorBankAccount
	var total int64
	
	query := r.db.Model(&InstructorBankAccount{}).Preload("User")
	if status != "" {
		query = query.Where("verification_status = ?", status)
	}
	
	query.Count(&total)
	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&accounts).Error
	
	return accounts, total, err
}

func (r *withdrawalRepository) CreateBankAccount(account *InstructorBankAccount) error {
	return r.db.Create(account).Error
}

func (r *withdrawalRepository) VerifyBankAccount(id uint, verifiedBy uint, status string, notes string) error {
	now := time.Now()
	
	// Start transaction
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Get the account being verified
		var account InstructorBankAccount
		if err := tx.First(&account, id).Error; err != nil {
			return err
		}
		
		// If approving (status = 'verified'), replace any existing verified account
		if status == "verified" {
			// Set old verified account to rejected (if exists)
			tx.Model(&InstructorBankAccount{}).
				Where("user_id = ? AND verification_status = 'verified' AND id != ?", account.UserID, id).
				Update("verification_status", "rejected")
		}
		
		// Update the current account
		return tx.Model(&InstructorBankAccount{}).Where("id = ?", id).Updates(map[string]interface{}{
			"verification_status": status,
			"verified_by":          verifiedBy,
			"verified_at":          now,
			"verification_notes":   notes,
		}).Error
	})
}
