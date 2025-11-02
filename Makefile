# TempaSKill Makefile
# Mempermudah development workflow

.PHONY: help dev backend frontend install-frontend build-frontend test clean

# Default target
help:
	@echo "=================================================="
	@echo "  TempaSKill - Development Commands"
	@echo "=================================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make dev              - Run backend & frontend together"
	@echo "  make backend          - Run backend only (port 8080)"
	@echo "  make frontend         - Run frontend only (port 3000)"
	@echo "  make install-frontend - Install frontend dependencies"
	@echo "  make build-frontend   - Build frontend for production"
	@echo "  make test             - Run all tests"
	@echo "  make clean            - Clean build artifacts"
	@echo ""
	@echo "Quick URLs:"
	@echo "  Backend:  http://localhost:8080"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Swagger:  http://localhost:8080/swagger/index.html"
	@echo ""

# Run both backend and frontend
dev:
	@echo "Starting backend and frontend..."
	@echo "Backend:  http://localhost:8080"
	@echo "Frontend: http://localhost:3000"
	@powershell -ExecutionPolicy Bypass -File start-dev.ps1

# Run backend only
backend:
	@echo "Starting backend server..."
	@echo "Server: http://localhost:8080"
	@powershell -ExecutionPolicy Bypass -File start-backend.ps1

# Run frontend only
frontend:
	@echo "Starting frontend server..."
	@echo "Server: http://localhost:3000"
	@powershell -ExecutionPolicy Bypass -File start-frontend.ps1

# Install frontend dependencies
install-frontend:
	@echo "Installing frontend dependencies..."
	cd tempaskill-fe && yarn install

# Build frontend for production
build-frontend:
	@echo "Building frontend for production..."
	cd tempaskill-fe && yarn build

# Run all tests
test:
	@echo "Running backend tests..."
	cd tempaskill-be && go test ./...
	@echo ""
	@echo "Running frontend tests..."
	cd tempaskill-fe && yarn test

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	cd tempaskill-fe && rm -rf .next node_modules/.cache
	@echo "Done!"
