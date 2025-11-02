package main

import (
	"log"
	"strings"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/config"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/auth"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/course"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/progress"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/user"
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

	// Auto-migrate database models
	db := database.GetDB()
	if err := db.AutoMigrate(
		&auth.User{},
		&course.Course{},
		&course.Lesson{},
		&course.Enrollment{},
		&progress.LessonProgress{},
	); err != nil {
		log.Fatalf("❌ Failed to migrate database: %v", err)
	}
	log.Println("✅ Database migrations completed")

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

		// Initialize auth module
		authRepo := auth.NewRepository(db)
		authService := auth.NewService(authRepo, cfg)
		authHandler := auth.NewHandler(authService)
		authMiddleware := middleware.NewAuthMiddleware(cfg)
		
		// Register auth routes
		auth.RegisterRoutes(v1, authHandler, authMiddleware)

		// Initialize user module
		userRepo := user.NewRepository(db)
		userService := user.NewService(userRepo)
		userHandler := user.NewHandler(userService)

		// Register user routes
		user.RegisterRoutes(v1, userHandler, authMiddleware)

		// Register course routes
		course.RegisterRoutes(v1, db, authMiddleware)

		// Initialize progress module
		courseRepo := course.NewRepository(db)
		progressRepo := progress.NewRepository(db)
		progressService := progress.NewService(progressRepo, courseRepo)
		progressHandler := progress.NewHandler(progressService)

		// Register progress routes
		progress.RegisterRoutes(v1, progressHandler, authMiddleware)
	}

	// Start server
	serverAddr := ":" + cfg.Server.Port
	log.Printf("🚀 Server starting on http://localhost%s", serverAddr)
	log.Printf("📝 API Documentation: http://localhost%s/api/v1/health", serverAddr)
	
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
