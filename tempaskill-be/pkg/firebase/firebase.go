package firebase

import (
	"context"
	"fmt"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/storage"
	"google.golang.org/api/option"
)

var (
	app           *firebase.App
	storageClient *storage.Client
)

// InitializeFirebase initializes Firebase App with service account
func InitializeFirebase() error {
	ctx := context.Background()

	// Get service account path from environment
	serviceAccountPath := os.Getenv("FIREBASE_SERVICE_ACCOUNT")
	if serviceAccountPath == "" {
		serviceAccountPath = "ngecis-4035d-firebase-adminsdk-fbsvc-b062d03ee9.json"
	}

	// Get storage bucket from environment
	storageBucket := os.Getenv("FIREBASE_STORAGE_BUCKET")
	if storageBucket == "" {
		storageBucket = "ngecis-4035d.firebasestorage.app" // Default bucket
	}

	// Initialize Firebase app
	opt := option.WithCredentialsFile(serviceAccountPath)
	config := &firebase.Config{
		StorageBucket: storageBucket,
	}

	var err error
	app, err = firebase.NewApp(ctx, config, opt)
	if err != nil {
		return fmt.Errorf("error initializing firebase app: %v", err)
	}

	// Initialize Storage client
	storageClient, err = app.Storage(ctx)
	if err != nil {
		return fmt.Errorf("error initializing firebase storage: %v", err)
	}

	return nil
}

// GetStorageClient returns the Firebase Storage client
func GetStorageClient() *storage.Client {
	return storageClient
}
