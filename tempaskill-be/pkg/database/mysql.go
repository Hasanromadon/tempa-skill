package database

import (
	"fmt"
	"time"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/config"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/logger"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

var DB *gorm.DB

// ConnectDB establishes MySQL connection using GORM
func ConnectDB(cfg *config.Config) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.DBName,
	)

	// Set logger level based on environment
	logLevel := gormlogger.Silent
	if cfg.Server.AppEnv == "development" {
		logLevel = gormlogger.Info
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: gormlogger.Default.LogMode(logLevel),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	// Get underlying SQL DB to configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %v", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)                  // Maximum idle connections
	sqlDB.SetMaxOpenConns(100)                 // Maximum open connections
	sqlDB.SetConnMaxLifetime(time.Hour)        // Connection max lifetime (prevents stale connections)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute) // Idle connection timeout (cleanup unused connections)

	DB = db
	logger.Info("Database connected successfully",
		zap.String("host", cfg.Database.Host),
		zap.String("database", cfg.Database.DBName),
		zap.Int("max_idle_conns", 10),
		zap.Int("max_open_conns", 100),
	)
	return nil
}

// GetDB returns the global database instance
func GetDB() *gorm.DB {
	return DB
}

// SetDB sets the global database instance (for testing)
func SetDB(db *gorm.DB) {
	DB = db
}
