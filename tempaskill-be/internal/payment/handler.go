package payment

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	service PaymentService
}

func NewPaymentHandler(service PaymentService) *PaymentHandler {
	return &PaymentHandler{service: service}
}

// CreatePayment handles POST /api/v1/payment/create-transaction
func (h *PaymentHandler) CreatePayment(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	var req CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Validate request
	if req.CourseID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "course_id is required",
		})
		return
	}

	payment, err := h.service.CreatePayment(userID.(uint), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Payment transaction created successfully",
		"data":    payment,
	})
}

// GetPaymentStatus handles GET /api/v1/payment/status/:orderId
func (h *PaymentHandler) GetPaymentStatus(c *gin.Context) {
	orderID := c.Param("orderId")
	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "order_id is required",
		})
		return
	}

	payment, err := h.service.GetPaymentStatus(orderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Payment not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment status retrieved successfully",
		"data":    payment,
	})
}

// GetUserPayments handles GET /api/v1/payment/user
func (h *PaymentHandler) GetUserPayments(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Parse pagination parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}

	payments, total, err := h.service.GetUserPayments(userID.(uint), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve payments",
		})
		return
	}

	totalPages := (total + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"message": "User payments retrieved successfully",
		"data":    payments,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// GetAllPayments handles GET /api/v1/payment/admin/all (Admin only)
func (h *PaymentHandler) GetAllPayments(c *gin.Context) {
	// Check if user is admin (this should be handled by middleware)
	userRole, exists := c.Get("userRole")
	if !exists || userRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Admin access required",
		})
		return
	}

	// Parse pagination parameters
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 || limit > 100 {
		limit = 10
	}

	payments, total, err := h.service.GetAllPayments(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve payments",
		})
		return
	}

	totalPages := (total + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"message": "All payments retrieved successfully",
		"data":    payments,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// HandleMidtransWebhook handles POST /api/v1/payment/webhook
func (h *PaymentHandler) HandleMidtransWebhook(c *gin.Context) {
	var notification MidtransNotification
	if err := c.ShouldBindJSON(&notification); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid notification format",
		})
		return
	}

	// Validate required fields
	if notification.OrderID == "" || notification.TransactionStatus == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required fields",
		})
		return
	}

	err := h.service.HandleMidtransNotification(notification)
	if err != nil {
		// Log error but return success to Midtrans
		// Midtrans expects 200 OK even if processing fails
		c.JSON(http.StatusOK, gin.H{
			"message": "Notification received but processing failed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Notification processed successfully",
	})
}