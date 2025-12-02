package withdrawal

import "github.com/gin-gonic/gin"

func RegisterRoutes(router *gin.Engine, handler *WithdrawalHandler, authMiddleware, instructorMiddleware, adminMiddleware gin.HandlerFunc) {
	api := router.Group("/api/v1")
	
	instructor := api.Group("/instructor/withdrawals")
	instructor.Use(authMiddleware, instructorMiddleware)
	{
		instructor.GET("/balance", handler.GetBalance)
		instructor.POST("", handler.CreateWithdrawal)
		instructor.GET("", handler.ListWithdrawals)
		instructor.GET("/:id", handler.GetWithdrawal)
		
		instructor.GET("/bank-account", handler.GetBankAccount)
		instructor.POST("/bank-account", handler.CreateBankAccount)
	}
	
	admin := api.Group("/admin/withdrawals")
	admin.Use(authMiddleware, adminMiddleware)
	{
		admin.GET("", handler.ListWithdrawals)
		admin.GET("/:id", handler.GetWithdrawal)
		admin.PUT("/:id/process", handler.ProcessWithdrawal)
		admin.GET("/bank-accounts", handler.ListBankAccounts)
		admin.PUT("/bank-accounts/:id/verify", handler.VerifyBankAccount)
	}
}
