package auth

import (
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all auth routes
func RegisterRoutes(rg *gin.RouterGroup, handler *Handler, authMiddleware *middleware.AuthMiddleware) {
	auth := rg.Group("/auth")
	{
		// Public routes
		auth.POST("/register", handler.Register)
		auth.POST("/login", handler.Login)

		// Protected routes
		auth.GET("/me", authMiddleware.RequireAuth(), handler.GetMe)
	}
}
