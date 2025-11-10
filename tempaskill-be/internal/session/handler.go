package session

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
	}
}

// CreateSession handles POST /sessions
func (h *Handler) CreateSession(c *gin.Context) {
	var req CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from JWT middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	session, err := h.service.CreateSession(c.Request.Context(), userID.(uint), &req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err == ErrInvalidScheduleTime {
			statusCode = http.StatusBadRequest
		}
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Session created successfully",
		"data":    session,
	})
}

// GetSession handles GET /sessions/:id
func (h *Handler) GetSession(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	// Get user ID from JWT middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	session, err := h.service.GetSessionByID(c.Request.Context(), userID.(uint), uint(id))
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err == ErrSessionNotFound {
			statusCode = http.StatusNotFound
		}
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": session,
	})
}

// ListSessions handles GET /sessions
func (h *Handler) ListSessions(c *gin.Context) {
	var query SessionListQuery

	// Parse query parameters
	if page := c.Query("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil && p > 0 {
			query.Page = p
		}
	} else {
		query.Page = 1
	}

	if limit := c.Query("limit"); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil && l > 0 && l <= 100 {
			query.Limit = l
		}
	} else {
		query.Limit = 10
	}

	if courseID := c.Query("course_id"); courseID != "" {
		if cid, err := strconv.ParseUint(courseID, 10, 32); err == nil {
			query.CourseID = uint(cid)
		}
	}

	if upcoming := c.Query("upcoming"); upcoming != "" {
		if u, err := strconv.ParseBool(upcoming); err == nil {
			query.Upcoming = &u
		}
	}

	if published := c.Query("published"); published != "" {
		if p, err := strconv.ParseBool(published); err == nil {
			query.Published = &p
		}
	}

	// Get user ID from JWT middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	response, err := h.service.ListSessions(c.Request.Context(), userID.(uint), &query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": response,
	})
}

// UpdateSession handles PUT /sessions/:id
func (h *Handler) UpdateSession(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	var req UpdateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from JWT middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	session, err := h.service.UpdateSession(c.Request.Context(), userID.(uint), uint(id), &req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		switch err {
		case ErrSessionNotFound:
			statusCode = http.StatusNotFound
		case ErrUnauthorized:
			statusCode = http.StatusForbidden
		case ErrSessionInPast, ErrInvalidScheduleTime:
			statusCode = http.StatusBadRequest
		}
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Session updated successfully",
		"data":    session,
	})
}

// DeleteSession handles DELETE /sessions/:id
func (h *Handler) DeleteSession(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	// Get user ID from JWT middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := h.service.DeleteSession(c.Request.Context(), userID.(uint), uint(id)); err != nil {
		statusCode := http.StatusInternalServerError
		switch err {
		case ErrSessionNotFound:
			statusCode = http.StatusNotFound
		case ErrUnauthorized:
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Session deleted successfully",
	})
}

// RegisterForSession handles POST /sessions/:id/register
func (h *Handler) RegisterForSession(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	// Get user ID from JWT middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := h.service.RegisterForSession(c.Request.Context(), userID.(uint), uint(id)); err != nil {
		statusCode := http.StatusInternalServerError
		switch err {
		case ErrSessionNotFound:
			statusCode = http.StatusNotFound
		case ErrAlreadyRegistered:
			statusCode = http.StatusConflict
		case ErrSessionFull, ErrSessionCancelled, ErrSessionInPast:
			statusCode = http.StatusBadRequest
		}
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully registered for session",
	})
}

// UnregisterFromSession handles DELETE /sessions/:id/register
func (h *Handler) UnregisterFromSession(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	// Get user ID from JWT middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := h.service.UnregisterFromSession(c.Request.Context(), userID.(uint), uint(id)); err != nil {
		statusCode := http.StatusInternalServerError
		switch err {
		case ErrSessionNotFound:
			statusCode = http.StatusNotFound
		case ErrNotRegistered:
			statusCode = http.StatusBadRequest
		}
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully unregistered from session",
	})
}

// GetSessionParticipants handles GET /sessions/:id/participants
func (h *Handler) GetSessionParticipants(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	// Get user ID from JWT middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	participants, err := h.service.GetSessionParticipants(c.Request.Context(), userID.(uint), uint(id))
	if err != nil {
		statusCode := http.StatusInternalServerError
		switch err {
		case ErrSessionNotFound:
			statusCode = http.StatusNotFound
		case ErrUnauthorized:
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": participants,
	})
}

// MarkAttendance handles POST /sessions/:id/attendance/:participantId
func (h *Handler) MarkAttendance(c *gin.Context) {
	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return
	}

	participantID, err := strconv.ParseUint(c.Param("participantId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid participant ID"})
		return
	}

	// Get user ID from JWT middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := h.service.MarkAttendance(c.Request.Context(), userID.(uint), uint(sessionID), uint(participantID)); err != nil {
		statusCode := http.StatusInternalServerError
		switch err {
		case ErrSessionNotFound:
			statusCode = http.StatusNotFound
		case ErrUnauthorized:
			statusCode = http.StatusForbidden
		}
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Attendance marked successfully",
	})
}