package withdrawal

import (
	"errors"
)

type WithdrawalService interface {
	GetBalance(instructorID uint) (*BalanceResponse, error)
	RequestWithdrawal(instructorID uint, req CreateWithdrawalRequest) (*WithdrawalResponse, error)
	GetWithdrawal(id uint, userID uint, isAdmin bool) (*WithdrawalRequest, error)
	ListWithdrawals(instructorID uint, status string, page, limit int) ([]WithdrawalRequest, int64, error)
	ProcessWithdrawal(id uint, adminID uint, req ProcessWithdrawalRequest) error
	
	// Bank account methods
	GetBankAccounts(userID uint) (verified *InstructorBankAccount, pending *InstructorBankAccount, err error)
	ListBankAccounts(status string, page, limit int) ([]InstructorBankAccount, int64, error)
	CreateBankAccount(userID uint, req BankAccountRequest) (*BankAccountResponse, error)
	VerifyBankAccount(id uint, adminID uint, status string, notes string) error
}

type withdrawalService struct {
	repo WithdrawalRepository
}

func NewWithdrawalService(repo WithdrawalRepository) WithdrawalService {
	return &withdrawalService{repo: repo}
}

func (s *withdrawalService) GetBalance(instructorID uint) (*BalanceResponse, error) {
	return s.repo.GetBalance(instructorID)
}

func (s *withdrawalService) RequestWithdrawal(instructorID uint, req CreateWithdrawalRequest) (*WithdrawalResponse, error) {
	// Check for existing pending/processing withdrawals
	hasPending, err := s.repo.HasPendingWithdrawal(instructorID)
	if err != nil {
		return nil, err
	}
	if hasPending {
		return nil, errors.New("you have a pending withdrawal request. please wait for it to be processed")
	}
	
	balance, _ := s.repo.GetBalance(instructorID)
	
	if req.Amount > balance.AvailableBalance {
		return nil, errors.New("insufficient available balance")
	}
	
	// Must have a verified bank account
	account, err := s.repo.GetVerifiedBankAccount(instructorID)
	if err != nil {
		return nil, err
	}
	if account == nil {
		return nil, errors.New("no verified bank account found")
	}
	
	adminFee := req.Amount * 0.025
	netAmount := req.Amount - adminFee
	
	withdrawal := &WithdrawalRequest{
		UserID:        instructorID,
		Amount:        req.Amount,
		AdminFee:      adminFee,
		NetAmount:     netAmount,
		Status:        "pending",
		BankAccountID: req.BankAccountID,
		Notes:         req.Notes,
	}
	
	if err := s.repo.CreateWithdrawal(withdrawal); err != nil {
		return nil, err
	}
	
	return &WithdrawalResponse{
		ID:            withdrawal.ID,
		Amount:        withdrawal.Amount,
		AdminFee:      withdrawal.AdminFee,
		NetAmount:     withdrawal.NetAmount,
		Status:        withdrawal.Status,
		BankAccountID: withdrawal.BankAccountID,
		CreatedAt:     withdrawal.CreatedAt,
	}, nil
}

func (s *withdrawalService) GetWithdrawal(id uint, userID uint, isAdmin bool) (*WithdrawalRequest, error) {
	withdrawal, err := s.repo.GetWithdrawalByID(id)
	if err != nil {
		return nil, err
	}
	if !isAdmin && withdrawal.UserID != userID {
		return nil, errors.New("unauthorized")
	}
	return withdrawal, nil
}

func (s *withdrawalService) ListWithdrawals(instructorID uint, status string, page, limit int) ([]WithdrawalRequest, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListWithdrawals(instructorID, status, limit, offset)
}

func (s *withdrawalService) ProcessWithdrawal(id uint, adminID uint, req ProcessWithdrawalRequest) error {
	return s.repo.UpdateWithdrawalStatus(id, req.Status, adminID, req.Notes)
}

func (s *withdrawalService) GetBankAccounts(userID uint) (verified *InstructorBankAccount, pending *InstructorBankAccount, err error) {
	verified, err = s.repo.GetVerifiedBankAccount(userID)
	if err != nil {
		return nil, nil, err
	}
	
	pending, err = s.repo.GetPendingBankAccount(userID)
	if err != nil {
		return nil, nil, err
	}
	
	// If there's a verified account and pending is rejected, don't return the rejected one
	// (it's already resolved by the new verified account)
	if verified != nil && pending != nil && pending.VerificationStatus == "rejected" {
		// Only show rejected if it's newer than verified (user submitted after verification)
		if pending.CreatedAt.Before(verified.CreatedAt) {
			pending = nil
		}
	}
	
	return verified, pending, nil
}

func (s *withdrawalService) ListBankAccounts(status string, page, limit int) ([]InstructorBankAccount, int64, error) {
	offset := (page - 1) * limit
	return s.repo.ListBankAccounts(status, limit, offset)
}

func (s *withdrawalService) CreateBankAccount(userID uint, req BankAccountRequest) (*BankAccountResponse, error) {
	// Check if there's already a pending account
	hasPending, err := s.repo.HasPendingBankAccount(userID)
	if err != nil {
		return nil, err
	}
	if hasPending {
		return nil, errors.New("you already have a pending bank account verification")
	}
	
	account := &InstructorBankAccount{
		UserID:             userID,
		BankName:           req.BankName,
		AccountNumber:      req.AccountNumber,
		AccountHolderName:  req.AccountHolderName,
		VerificationStatus: "pending",
	}
	
	if err := s.repo.CreateBankAccount(account); err != nil {
		return nil, err
	}
	
	return &BankAccountResponse{
		ID:                 account.ID,
		BankName:           account.BankName,
		AccountNumber:      account.AccountNumber,
		AccountHolderName:  account.AccountHolderName,
		VerificationStatus: account.VerificationStatus,
		CreatedAt:          account.CreatedAt,
	}, nil
}

func (s *withdrawalService) VerifyBankAccount(id uint, adminID uint, status string, notes string) error {
	if status != "verified" && status != "rejected" {
		return errors.New("invalid status: must be 'verified' or 'rejected'")
	}
	return s.repo.VerifyBankAccount(id, adminID, status, notes)
}
