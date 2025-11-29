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
// Returns aggregated statistics for admin dashboard
// Requires admin authentication
func (h *Handler) GetDashboardStats(c *gin.Context) {
	stats, err := h.service.GetDashboardStats(c.Request.Context())
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
