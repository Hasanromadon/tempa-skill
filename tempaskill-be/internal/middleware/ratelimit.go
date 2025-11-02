package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/logger"
	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	"github.com/ulule/limiter/v3/drivers/store/memory"
	"go.uber.org/zap"
)

// RateLimitMiddleware creates a rate limiting middleware
type RateLimitMiddleware struct {
	limiter *limiter.Limiter
}

// NewRateLimitMiddleware creates a new rate limit middleware with the specified rate
// Format: "requests-per-duration" (e.g., "5-M" = 5 per minute, "100-H" = 100 per hour)
func NewRateLimitMiddleware(rate string) *RateLimitMiddleware {
	// Parse rate (e.g., "5-M" means 5 requests per minute)
	rateLimit := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  100,
	}

	// Custom parsing for common rates
	switch rate {
	case "5-15M": // 5 requests per 15 minutes (auth endpoints)
		rateLimit = limiter.Rate{
			Period: 15 * time.Minute,
			Limit:  5,
		}
	case "100-M": // 100 requests per minute (general API)
		rateLimit = limiter.Rate{
			Period: 1 * time.Minute,
			Limit:  100,
		}
	case "10-M": // 10 requests per minute (strict)
		rateLimit = limiter.Rate{
			Period: 1 * time.Minute,
			Limit:  10,
		}
	}

	// Create in-memory store
	store := memory.NewStore()

	// Create limiter instance
	instance := limiter.New(store, rateLimit)

	return &RateLimitMiddleware{
		limiter: instance,
	}
}

// Limit returns a Gin middleware that enforces rate limiting
func (rl *RateLimitMiddleware) Limit() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get client IP as key
		key := c.ClientIP()

		// Get current rate limit context
		context, err := rl.limiter.Get(c.Request.Context(), key)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Rate limiter error",
			})
			c.Abort()
			return
		}

		// Set rate limit headers
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", context.Limit))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", context.Remaining))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", context.Reset))

		// Check if limit is reached
		if context.Reached {
			logger.Warn("Rate limit exceeded",
				zap.String("request_id", GetRequestID(c)),
				zap.String("ip", key),
				zap.Int64("limit", context.Limit),
				zap.String("path", c.Request.URL.Path),
			)
			
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded",
				"message": "Too many requests. Please try again later.",
				"retry_after": context.Reset,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// LimitByUser returns a Gin middleware that enforces rate limiting per authenticated user
func (rl *RateLimitMiddleware) LimitByUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from context (set by auth middleware)
		userID, exists := c.Get("userID")
		if !exists {
			// Fall back to IP-based limiting for unauthenticated requests
			key := c.ClientIP()
			context, err := rl.limiter.Get(c.Request.Context(), key)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Rate limiter error",
				})
				c.Abort()
				return
			}

			c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", context.Limit))
			c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", context.Remaining))
			c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", context.Reset))

			if context.Reached {
				logger.Warn("Rate limit exceeded (unauthenticated)",
					zap.String("request_id", GetRequestID(c)),
					zap.String("ip", key),
					zap.Int64("limit", context.Limit),
					zap.String("path", c.Request.URL.Path),
				)
				
				c.JSON(http.StatusTooManyRequests, gin.H{
					"error":   "Rate limit exceeded",
					"message": "Too many requests. Please try again later.",
				})
				c.Abort()
				return
			}

			c.Next()
			return
		}

		// Use user ID as key
		key := fmt.Sprintf("user:%v", userID)

		context, err := rl.limiter.Get(c.Request.Context(), key)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Rate limiter error",
			})
			c.Abort()
			return
		}

		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", context.Limit))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", context.Remaining))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", context.Reset))

		if context.Reached {
			logger.Warn("Rate limit exceeded (authenticated)",
				zap.String("request_id", GetRequestID(c)),
				zap.Any("user_id", userID),
				zap.Int64("limit", context.Limit),
				zap.String("path", c.Request.URL.Path),
			)
			
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded",
				"message": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
