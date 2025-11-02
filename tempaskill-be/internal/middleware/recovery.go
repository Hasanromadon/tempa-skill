package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// Recovery returns a middleware that recovers from panics and logs the error with request ID
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Get request ID for tracking
				requestID := GetRequestID(c)
				
				// Log the panic with full stack trace
				logger.Error("Panic recovered",
					zap.String("request_id", requestID),
					zap.String("method", c.Request.Method),
					zap.String("path", c.Request.URL.Path),
					zap.String("ip", c.ClientIP()),
					zap.Any("error", err),
					zap.String("stack", string(debug.Stack())),
				)
				
				// Return error response with request ID
				c.JSON(http.StatusInternalServerError, gin.H{
					"success":    false,
					"message":    "Internal server error",
					"error":      fmt.Sprintf("%v", err),
					"request_id": requestID,
				})
				
				c.Abort()
			}
		}()
		
		c.Next()
	}
}
