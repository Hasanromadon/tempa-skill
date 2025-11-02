package auth

import (
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all auth routes
func RegisterRoutes(rg *gin.RouterGroup, handler *Handler, authMiddleware *middleware.AuthMiddleware) {
	// Create strict rate limiter for auth endpoints (5 attempts per 15 minutes)
	authRateLimiter := middleware.NewRateLimitMiddleware("5-15M")

	auth := rg.Group("/auth")
	{
		// Public routes with strict rate limiting to prevent brute force
		auth.POST("/register", authRateLimiter.Limit(), handler.Register)
		auth.POST("/login", authRateLimiter.Limit(), handler.Login)

		// Protected routes
		auth.GET("/me", authMiddleware.RequireAuth(), handler.GetMe)
	}
}
