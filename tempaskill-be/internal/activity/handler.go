package activity

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Handler handles activity log HTTP requests
type Handler struct {
	service Service
}

// NewHandler creates a new activity handler
func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// GetUserActivities retrieves activities for a specific user
// GET /api/v1/users/:id/activities
func (h *Handler) GetUserActivities(c *gin.Context) {
	userIDParam := c.Param("id")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	limitParam := c.DefaultQuery("limit", "20")
	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 20
	}

	activities, err := h.service.GetUserActivities(uint(userID), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activities"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": activities,
	})
}

// GetRecentActivities retrieves recent activities (admin only)
// GET /api/v1/admin/activities
func (h *Handler) GetRecentActivities(c *gin.Context) {
	limitParam := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 50
	}

	activities, err := h.service.GetRecentActivities(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activities"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": activities,
	})
}
