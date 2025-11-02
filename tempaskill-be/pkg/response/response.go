package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIResponse is the standard API response structure
type APIResponse struct {
	Success   bool        `json:"success"`
	Message   string      `json:"message,omitempty"`
	Data      interface{} `json:"data,omitempty"`
	Error     interface{} `json:"error,omitempty"`
	RequestID string      `json:"request_id,omitempty"`
}

// getRequestID retrieves request ID from context
func getRequestID(c *gin.Context) string {
	if id, exists := c.Get("request_id"); exists {
		if requestID, ok := id.(string); ok {
			return requestID
		}
	}
	return ""
}

// Success sends a successful response
func Success(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, APIResponse{
		Success:   true,
		Message:   message,
		Data:      data,
		RequestID: getRequestID(c),
	})
}

// Error sends an error response
func Error(c *gin.Context, statusCode int, message string, err interface{}) {
	c.JSON(statusCode, APIResponse{
		Success:   false,
		Message:   message,
		Error:     err,
		RequestID: getRequestID(c),
	})
}

// ValidationError sends validation error response
func ValidationError(c *gin.Context, errors interface{}) {
	c.JSON(http.StatusBadRequest, APIResponse{
		Success:   false,
		Message:   "Validation failed",
		Error:     errors,
		RequestID: getRequestID(c),
	})
}

// Unauthorized sends unauthorized response
func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, APIResponse{
		Success:   false,
		Message:   message,
		RequestID: getRequestID(c),
	})
}

// Forbidden sends forbidden response
func Forbidden(c *gin.Context, message string) {
	c.JSON(http.StatusForbidden, APIResponse{
		Success:   false,
		Message:   message,
		RequestID: getRequestID(c),
	})
}

// NotFound sends not found response
func NotFound(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, APIResponse{
		Success:   false,
		Message:   message,
		RequestID: getRequestID(c),
	})
}

// InternalServerError sends internal server error response
func InternalServerError(c *gin.Context, err interface{}) {
	c.JSON(http.StatusInternalServerError, APIResponse{
		Success:   false,
		Message:   "Internal server error",
		Error:     err,
		RequestID: getRequestID(c),
	})
}
