package middleware

import (
	"net/http"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/config"
	"github.com/gin-gonic/gin"
)

// SecurityHeaders adds security headers to all responses
func SecurityHeaders(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Prevent MIME type sniffing
		c.Header("X-Content-Type-Options", "nosniff")

		// Prevent clickjacking attacks
		c.Header("X-Frame-Options", "DENY")

		// Enable XSS protection (legacy browsers)
		c.Header("X-XSS-Protection", "1; mode=block")

		// Enforce HTTPS in production
		if cfg.Server.AppEnv == "production" {
			c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		}

		// Content Security Policy
		// Adjust based on your frontend requirements
		csp := "default-src 'self'; " +
			"script-src 'self'; " +
			"style-src 'self' 'unsafe-inline'; " +
			"img-src 'self' data: https:; " +
			"font-src 'self'; " +
			"connect-src 'self'; " +
			"frame-ancestors 'none'; " +
			"base-uri 'self'; " +
			"form-action 'self'"
		c.Header("Content-Security-Policy", csp)

		// Referrer policy
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// Prevent browser caching of sensitive data
		c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")

		// Remove server information
		c.Header("X-Powered-By", "")
		c.Header("Server", "")

		c.Next()
	}
}

// RequestSizeLimit limits the maximum request body size to prevent DoS attacks
func RequestSizeLimit(maxBytes int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Set maximum request body size (default 10MB)
		if maxBytes == 0 {
			maxBytes = 10 * 1024 * 1024 // 10MB
		}

		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBytes)

		c.Next()
	}
}
