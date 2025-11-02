# TempaSKill Backend Makefile
# Commands untuk development workflow

# Variables
BINARY_NAME=tempaskill
GO_FILES=$(shell find . -name '*.go' -type f)
MAIN_PATH=./cmd/api/main.go
MYSQL_BIN=C:/tools/mysql/current/bin/mysql.exe
DB_NAME=tempaskill

# Colors for output
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

.PHONY: help
help: ## Show this help message
	@echo ========================================
	@echo TempaSKill Backend - Available Commands
	@echo ========================================
	@echo.
	@echo SETUP:
	@echo   make setup          - Install Go dependencies
	@echo   make start          - Create DB and start server
	@echo.
	@echo DATABASE:
	@echo   make db-create      - Create database
	@echo   make db-drop        - Drop database
	@echo   make db-reset       - Reset database
	@echo   make db-status      - Show database status
	@echo.
	@echo DEVELOPMENT:
	@echo   make run            - Run server
	@echo   make dev            - Run server (alias)
	@echo   make build          - Build binary
	@echo   make test           - Run all tests
	@echo   make test-unit      - Run unit tests only
	@echo   make test-integration - Run integration tests only
	@echo   make test-coverage  - Run tests with coverage
	@echo   make test-auth      - Test authentication (PowerShell)
	@echo   make format         - Format code
	@echo.
	@echo UTILS:
	@echo   make clean          - Clean build files
	@echo   make git-status     - Show git status
	@echo.

.PHONY: setup
setup: ## Initial project setup (install dependencies)
	@echo Installing Go dependencies...
	@go mod download
	@go mod tidy
	@echo Done! Dependencies installed

.PHONY: db-create
db-create: ## Create database
	@echo Creating database '$(DB_NAME)'...
	@"$(MYSQL_BIN)" -u root -e "CREATE DATABASE IF NOT EXISTS $(DB_NAME) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
	@"$(MYSQL_BIN)" -u root -e "SHOW DATABASES LIKE '$(DB_NAME)';"
	@echo Done! Database created

.PHONY: db-drop
db-drop: ## Drop database (WARNING: deletes all data)
	@echo Dropping database '$(DB_NAME)'...
	@"$(MYSQL_BIN)" -u root -e "DROP DATABASE IF EXISTS $(DB_NAME);"
	@echo Done! Database dropped

.PHONY: db-reset
db-reset: db-drop db-create ## Reset database (drop and recreate)
	@echo Done! Database reset complete

.PHONY: db-status
db-status: ## Show database tables and row counts
	@echo ==============================
	@echo Database Status:
	@echo ==============================
	@"$(MYSQL_BIN)" -u root $(DB_NAME) -e "SHOW TABLES;"
	@echo.
	@echo Users Table:
	@"$(MYSQL_BIN)" -u root $(DB_NAME) -e "SELECT id, name, email, role, created_at FROM users LIMIT 10;"

.PHONY: run
run: ## Run server in development mode
	@echo Starting TempaSKill server...
	@set GOTOOLCHAIN=auto&& go run $(MAIN_PATH)

.PHONY: dev
dev: ## Run server with auto-reload (alias for run)
	@$(MAKE) run

.PHONY: build
build: ## Build production binary
	@echo Building binary...
	@go build -o bin/$(BINARY_NAME).exe $(MAIN_PATH)
	@echo Done! Binary built: bin/$(BINARY_NAME).exe

.PHONY: build-linux
build-linux: ## Build for Linux (production)
	@echo Building for Linux...
	@set GOOS=linux&& set GOARCH=amd64&& go build -o bin/$(BINARY_NAME) $(MAIN_PATH)
	@echo Done! Linux binary built: bin/$(BINARY_NAME)

.PHONY: test
test: ## Run all tests
	@echo Running all tests...
	@go test -v ./...
	@echo Done! Tests completed

.PHONY: test-unit
test-unit: ## Run only unit tests (service layer)
	@echo Running unit tests...
	@go test -v -run "TestService" ./...
	@echo Done! Unit tests completed

.PHONY: test-integration
test-integration: ## Run only integration tests (handler layer)
	@echo Running integration tests...
	@go test -v -run "TestHandler" ./...
	@echo Done! Integration tests completed

.PHONY: test-coverage
test-coverage: ## Run tests with coverage report
	@echo Running tests with coverage...
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo Done! Coverage report: coverage.html
	@echo Open coverage.html in browser to view results

.PHONY: test-auth
test-auth: ## Test authentication endpoints (requires server running)
	@echo Testing authentication endpoints...
	@powershell -ExecutionPolicy Bypass -File test-auth.ps1

.PHONY: lint
lint: ## Run linter (requires golangci-lint)
	@echo Running linter...
	@golangci-lint run
	@echo Done! Linting completed

.PHONY: format
format: ## Format code with gofmt
	@echo Formatting code...
	@gofmt -w $(GO_FILES)
	@echo Done! Code formatted

.PHONY: clean
clean: ## Clean build artifacts
	@echo Cleaning build artifacts...
	@if exist bin rmdir /s /q bin
	@if exist coverage.out del coverage.out
	@if exist coverage.html del coverage.html
	@echo Done! Cleaned

.PHONY: migrate
migrate: ## Run database migrations (auto-migrate on server start)
	@echo "$(YELLOW)Running migrations...$(NC)"
	@go run $(MAIN_PATH) --migrate-only
	@echo "$(GREEN)✓ Migrations completed$(NC)"

.PHONY: seed
seed: ## Seed database with sample data
	@echo "$(YELLOW)Seeding database...$(NC)"
	@"$(MYSQL_BIN)" -u root $(DB_NAME) < migrations/seed.sql
	@echo "$(GREEN)✓ Database seeded$(NC)"

.PHONY: install-tools
install-tools: ## Install development tools
	@echo "$(YELLOW)Installing development tools...$(NC)"
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@echo "$(GREEN)✓ Tools installed$(NC)"

.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "$(YELLOW)Building Docker image...$(NC)"
	@docker build -t tempaskill-be:latest .
	@echo "$(GREEN)✓ Docker image built$(NC)"

.PHONY: docker-run
docker-run: ## Run with Docker Compose
	@echo "$(YELLOW)Starting with Docker Compose...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✓ Containers started$(NC)"

.PHONY: docker-stop
docker-stop: ## Stop Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ Containers stopped$(NC)"

.PHONY: git-status
git-status: ## Show git status
	@git status --short

.PHONY: git-commit
git-commit: ## Commit changes (use: make git-commit MSG="your message")
	@git add .
	@git commit -m "$(MSG)"
	@git push origin main

.PHONY: start
start: db-create run ## Create database and start server (full setup)

.PHONY: all
all: clean setup build ## Clean, setup dependencies, and build

# Default target
.DEFAULT_GOAL := help
