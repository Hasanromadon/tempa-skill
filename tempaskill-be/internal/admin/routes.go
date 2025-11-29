package admin

import (
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers admin routes
func RegisterRoutes(rg *gin.RouterGroup, handler *Handler, authMiddleware *middleware.AuthMiddleware, adminMiddleware gin.HandlerFunc) {
	admin := rg.Group("/admin")
	admin.Use(authMiddleware.RequireAuth())
	admin.Use(adminMiddleware)
	{
		// Dashboard statistics
		admin.GET("/stats", handler.GetDashboardStats)
	}
}
