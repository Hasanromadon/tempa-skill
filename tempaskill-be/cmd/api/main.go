package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/config"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/auth"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/course"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/payment"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/progress"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/review"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/session"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/upload"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/user"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/database"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/firebase"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/logger"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/response"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}

	// Initialize structured logger
	if err := logger.InitLogger(cfg.Server.AppEnv); err != nil {
		log.Fatalf("❌ Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	logger.Info("Application starting",
		zap.String("environment", cfg.Server.AppEnv),
		zap.String("port", cfg.Server.Port),
	)

	// Connect to database
	if err := database.ConnectDB(cfg); err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}

	// Initialize Firebase
	if err := firebase.InitializeFirebase(); err != nil {
		logger.Fatal("Failed to initialize Firebase", zap.Error(err))
	}
	logger.Info("Firebase initialized successfully")

	// Auto-migrate database models
	db := database.GetDB()
	if err := db.AutoMigrate(
		&auth.User{},
		&course.Course{},
		&course.Lesson{},
		&course.Enrollment{},
		&payment.PaymentTransaction{},
		&progress.LessonProgress{},
		&review.CourseReview{},
	); err != nil {
		logger.Fatal("Failed to migrate database", zap.Error(err))
	}
	logger.Info("Database migrations completed")

	// Set Gin mode based on environment
	if cfg.Server.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize Gin router with custom logger
	router := gin.New()
	router.Use(middleware.Recovery()) // Custom panic recovery with request ID

	// Structured Logging Middleware (logs all HTTP requests)
	router.Use(middleware.Logger())

	// Security Middleware (Applied to all routes)
	// 1. Security Headers - Prevent XSS, clickjacking, etc.
	router.Use(middleware.SecurityHeaders(cfg))

	// 2. Request Size Limit - Prevent DoS via large payloads (10MB max)
	router.Use(middleware.RequestSizeLimit(10 * 1024 * 1024))

	// 3. Request ID - Add unique ID to each request for tracing
	router.Use(middleware.RequestID())

	// 4. General API Rate Limiting - 100 requests per minute per IP
	apiRateLimiter := middleware.NewRateLimitMiddleware("100-M")
	router.Use(apiRateLimiter.Limit())

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

		// Register session routes
		session.RegisterRoutes(v1, db, authMiddleware)

		// Initialize progress module
		courseRepo := course.NewRepository(db)
		progressRepo := progress.NewRepository(db)
		progressService := progress.NewService(progressRepo, courseRepo)
		progressHandler := progress.NewHandler(progressService)

		// Register progress routes
		progress.RegisterRoutes(v1, progressHandler, authMiddleware)

		// Initialize upload module
		uploadService := upload.NewService()
		uploadHandler := upload.NewHandler(uploadService)

		// Register upload routes
		upload.RegisterRoutes(v1, uploadHandler, authMiddleware)

		// Initialize payment module
		paymentRepo := payment.NewRepository(db)
		paymentConfig := payment.MidtransConfig{
			ServerKey:    cfg.Midtrans.ServerKey,
			ClientKey:    cfg.Midtrans.ClientKey,
			IsProduction: cfg.Midtrans.IsProduction,
			BaseURL:      cfg.Midtrans.BaseURL,
		}
		paymentService := payment.NewPaymentService(paymentRepo, courseRepo, userRepo, paymentConfig)
		paymentHandler := payment.NewPaymentHandler(paymentService)

		// Register payment routes
		payment.RegisterRoutes(router, paymentHandler, authMiddleware.RequireAuth(), func(c *gin.Context) {
			// Simple admin middleware - check if user role is admin
			userRole, exists := c.Get("userRole")
			if !exists || userRole != "admin" {
				c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
				c.Abort()
				return
			}
			c.Next()
		})

		// Initialize review module
		reviewRepo := review.NewRepository(db)
		reviewService := review.NewService(reviewRepo)
		reviewHandler := review.NewHandler(reviewService)

		// Register review routes
		review.RegisterRoutes(router, reviewHandler, authMiddleware.RequireAuth())
	}

	// Start server
	serverAddr := ":" + cfg.Server.Port
	
	// TLS/HTTPS Configuration for Production
	if cfg.Server.AppEnv == "production" {
		log.Printf("🚀 Server starting on https://localhost%s (TLS enabled)", serverAddr)
		log.Printf("📝 API Documentation: https://localhost%s/api/v1/health", serverAddr)
		log.Printf("⚠️  Ensure TLS certificates are configured: cert.pem and key.pem")
		
		// In production, use TLS certificates
		// Certificates should be placed in a secure location
		certFile := getEnv("TLS_CERT_FILE", "./certs/cert.pem")
		keyFile := getEnv("TLS_KEY_FILE", "./certs/key.pem")
		
		if err := router.RunTLS(serverAddr, certFile, keyFile); err != nil {
		logger.Fatal("Failed to start TLS server",
			zap.Error(err),
			zap.String("cert_file", certFile),
			zap.String("key_file", keyFile),
		)
		}
	} else {
		// Development mode - HTTP only
		logger.Info("Server starting",
			zap.String("address", "http://localhost"+serverAddr),
			zap.String("mode", cfg.Server.AppEnv),
			zap.String("protocol", "HTTP"),
		)
		logger.Warn("Running in development mode - HTTP only (not secure for production)")
		
		if err := router.Run(serverAddr); err != nil {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}
}

// getEnv gets environment variable with fallback (helper function)
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
