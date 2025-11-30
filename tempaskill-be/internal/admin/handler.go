package admin

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// GetDashboardStats handles GET /api/v1/admin/stats
// Returns aggregated statistics for admin/instructor dashboard
// Data is filtered based on user role
func (h *Handler) GetDashboardStats(c *gin.Context) {
	// Get user info from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	userRole, exists := c.Get("user_role")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User role not found",
		})
		return
	}

	stats, err := h.service.GetDashboardStats(
		c.Request.Context(),
		userID.(uint),
		userRole.(string),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch dashboard statistics",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": stats,
	})
}
