package payment

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, handler *PaymentHandler, authMiddleware, adminMiddleware gin.HandlerFunc) {
	// Payment routes
	paymentGroup := router.Group("/api/v1/payment")
	{
		// Protected routes (require authentication)
		protected := paymentGroup.Group("")
		protected.Use(authMiddleware)
		{
			// Create payment transaction
			protected.POST("/create-transaction", handler.CreatePayment)

			// Get payment status
			protected.GET("/status/:orderId", handler.GetPaymentStatus)

			// Get user's payment history
			protected.GET("/user", handler.GetUserPayments)
		}

		// Admin routes (require admin role)
		admin := paymentGroup.Group("/admin")
		admin.Use(authMiddleware)
		admin.Use(adminMiddleware)
		{
			// Get all payments (admin only)
			admin.GET("/all", handler.GetAllPayments)
		}

		// Public webhook route (no auth required for Midtrans)
		paymentGroup.POST("/webhook", handler.HandleMidtransWebhook)
	}
}