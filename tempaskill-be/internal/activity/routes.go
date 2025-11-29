package activity

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers activity routes
func RegisterRoutes(router *gin.Engine, handler *Handler, authMiddleware, adminMiddleware gin.HandlerFunc) {
	// Protected user routes
	protected := router.Group("/api/v1")
	protected.Use(authMiddleware)
	{
		protected.GET("/users/:id/activities", handler.GetUserActivities)
	}

	// Admin routes
	admin := router.Group("/api/v1/admin")
	admin.Use(authMiddleware, adminMiddleware)
	{
		admin.GET("/activities", handler.GetRecentActivities)
	}
}
