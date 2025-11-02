package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const RequestIDKey = "request_id"

// RequestID adds a unique request ID to each request
// This helps with tracing requests across logs and debugging production issues
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if request already has an ID (from load balancer or upstream service)
		requestID := c.GetHeader("X-Request-ID")
		
		// Generate new ID if not present
		if requestID == "" {
			requestID = uuid.New().String()
		}

		// Store in context for access in handlers
		c.Set(RequestIDKey, requestID)

		// Add to response headers
		c.Header("X-Request-ID", requestID)

		c.Next()
	}
}

// GetRequestID retrieves the request ID from the context
func GetRequestID(c *gin.Context) string {
	if requestID, exists := c.Get(RequestIDKey); exists {
		if id, ok := requestID.(string); ok {
			return id
		}
	}
	return ""
}
