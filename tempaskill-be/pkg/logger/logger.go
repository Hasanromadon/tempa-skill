package logger

import (
	"os"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Log *zap.Logger

// InitLogger initializes the global structured logger
func InitLogger(environment string) error {
	var config zap.Config

	if environment == "production" {
		// Production: JSON format, Info level
		config = zap.NewProductionConfig()
		config.EncoderConfig.TimeKey = "timestamp"
		config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	} else {
		// Development: Console format, Debug level
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	logger, err := config.Build()
	if err != nil {
		return err
	}

	Log = logger
	return nil
}

// Sync flushes any buffered log entries
func Sync() {
	if Log != nil {
		_ = Log.Sync()
	}
}

// Info logs an info message with fields
func Info(msg string, fields ...zap.Field) {
	if Log != nil {
		Log.Info(msg, fields...)
	}
}

// Error logs an error message with fields
func Error(msg string, fields ...zap.Field) {
	if Log != nil {
		Log.Error(msg, fields...)
	}
}

// Warn logs a warning message with fields
func Warn(msg string, fields ...zap.Field) {
	if Log != nil {
		Log.Warn(msg, fields...)
	}
}

// Debug logs a debug message with fields
func Debug(msg string, fields ...zap.Field) {
	if Log != nil {
		Log.Debug(msg, fields...)
	}
}

// Fatal logs a fatal message and exits
func Fatal(msg string, fields ...zap.Field) {
	if Log != nil {
		Log.Fatal(msg, fields...)
	} else {
		// Fallback if logger not initialized
		println("FATAL:", msg)
		os.Exit(1)
	}
}

// With creates a child logger with additional fields
func With(fields ...zap.Field) *zap.Logger {
	if Log != nil {
		return Log.With(fields...)
	}
	return zap.NewNop()
}

// WithRequestID creates a child logger with request_id from Gin context
// This is a convenience function for easily adding request IDs to logs
func WithRequestID(c *gin.Context) *zap.Logger {
	if c == nil {
		return Log
	}
	
	requestID, exists := c.Get("request_id")
	if !exists || requestID == "" {
		return Log
	}
	
	return With(zap.String("request_id", requestID.(string)))
}
