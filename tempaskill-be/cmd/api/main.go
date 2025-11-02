package main

import (
	"log"
	"strings"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/config"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/database"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/response"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}

	// Connect to database
	if err := database.ConnectDB(cfg); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	// Set Gin mode based on environment
	if cfg.Server.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize Gin router
	router := gin.Default()

	// CORS Middleware
	router.Use(func(c *gin.Context) {
		origins := strings.Split(cfg.CORS.AllowedOrigins, ",")
		origin := c.Request.Header.Get("Origin")
		
		// Check if origin is allowed
		for _, allowedOrigin := range origins {
			if strings.TrimSpace(allowedOrigin) == origin {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}
		
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Health check endpoint
		v1.GET("/health", func(c *gin.Context) {
			response.Success(c, 200, "TempaSKill API is running", gin.H{
				"version":     "1.0.0",
				"environment": cfg.Server.AppEnv,
				"database":    "connected",
			})
		})
	}

	// Start server
	serverAddr := ":" + cfg.Server.Port
	log.Printf("🚀 Server starting on http://localhost%s", serverAddr)
	log.Printf("📝 API Documentation: http://localhost%s/api/v1/health", serverAddr)
	
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
