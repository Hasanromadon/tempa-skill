package withdrawal

import (
	"net/http"
	"strconv"
	
	"github.com/gin-gonic/gin"
)

type WithdrawalHandler struct {
	service WithdrawalService
}

func NewWithdrawalHandler(service WithdrawalService) *WithdrawalHandler {
	return &WithdrawalHandler{service: service}
}

func (h *WithdrawalHandler) GetBalance(c *gin.Context) {
	userID, _ := c.Get("userID")
	balance, err := h.service.GetBalance(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Balance retrieved successfully", "data": balance})
}

func (h *WithdrawalHandler) CreateWithdrawal(c *gin.Context) {
	userID, _ := c.Get("userID")
	var req CreateWithdrawalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	withdrawal, err := h.service.RequestWithdrawal(userID.(uint), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Withdrawal request created", "data": withdrawal})
}

func (h *WithdrawalHandler) GetWithdrawal(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID, _ := c.Get("userID")
	role, _ := c.Get("userRole")
	
	withdrawal, err := h.service.GetWithdrawal(uint(id), userID.(uint), role.(string) == "admin")
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Withdrawal retrieved", "data": withdrawal})
}

func (h *WithdrawalHandler) ListWithdrawals(c *gin.Context) {
	userID, _ := c.Get("userID")
	role, _ := c.Get("userRole")
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	
	var instructorID uint
	if role.(string) != "admin" {
		instructorID = userID.(uint)
	}
	
	withdrawals, total, err := h.service.ListWithdrawals(instructorID, status, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	totalPages := (total + int64(limit) - 1) / int64(limit)
	c.JSON(http.StatusOK, gin.H{
		"message": "Withdrawals retrieved",
		"data": gin.H{
			"withdrawals": withdrawals,
			"pagination": gin.H{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": totalPages,
			},
		},
	})
}

func (h *WithdrawalHandler) ProcessWithdrawal(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	adminID, _ := c.Get("userID")
	
	var req ProcessWithdrawalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := h.service.ProcessWithdrawal(uint(id), adminID.(uint), req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Withdrawal processed successfully"})
}

func (h *WithdrawalHandler) GetBankAccount(c *gin.Context) {
	userID, _ := c.Get("userID")
	verified, pending, err := h.service.GetBankAccounts(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	response := gin.H{
		"verified": verified,
		"pending":  pending,
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Bank account retrieved", "data": response})
}

func (h *WithdrawalHandler) CreateBankAccount(c *gin.Context) {
	userID, _ := c.Get("userID")
	var req BankAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	account, err := h.service.CreateBankAccount(userID.(uint), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Bank account created", "data": account})
}

func (h *WithdrawalHandler) ListBankAccounts(c *gin.Context) {
	status := c.DefaultQuery("status", "") // pending, verified, rejected, or empty for all
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	
	accounts, total, err := h.service.ListBankAccounts(status, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	totalPages := (total + int64(limit) - 1) / int64(limit)
	c.JSON(http.StatusOK, gin.H{
		"message": "Bank accounts retrieved",
		"data": gin.H{
			"accounts": accounts,
			"pagination": gin.H{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"total_pages": totalPages,
			},
		},
	})
}

func (h *WithdrawalHandler) VerifyBankAccount(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	adminID, _ := c.Get("userID")
	
	var req struct {
		Status            string `json:"status" binding:"required,oneof=verified rejected"`
		VerificationNotes string `json:"verification_notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := h.service.VerifyBankAccount(uint(id), adminID.(uint), req.Status, req.VerificationNotes); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	message := "Bank account verified successfully"
	if req.Status == "rejected" {
		message = "Bank account rejected"
	}
	c.JSON(http.StatusOK, gin.H{"message": message})
}
