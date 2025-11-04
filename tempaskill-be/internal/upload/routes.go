package upload

import (
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers upload routes
func RegisterRoutes(router gin.IRouter, handler *Handler, authMiddleware *middleware.AuthMiddleware) {
	// Protected routes (require authentication)
	uploadRoutes := router.Group("/upload")
	uploadRoutes.Use(authMiddleware.RequireAuth())
	{
		uploadRoutes.POST("/image", handler.UploadImage)
	}
}
