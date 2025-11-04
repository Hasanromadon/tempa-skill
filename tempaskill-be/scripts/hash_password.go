package main

import (
	"fmt"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run scripts/hash_password.go <password>")
		os.Exit(1)
	}

	password := os.Args[1]

	// Use bcrypt cost 10 (same as in User.BeforeCreate hook)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Printf("Error hashing password: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("\nPassword:", password)
	fmt.Println("Bcrypt Hash:", string(hashedPassword))
	fmt.Println("\nCopy this hash to migrations/seed_admin.sql")

	// Verify the hash works
	err = bcrypt.CompareHashAndPassword(hashedPassword, []byte(password))
	if err != nil {
		fmt.Println("\n❌ ERROR: Hash verification failed!")
	} else {
		fmt.Println("\n✅ Hash verified successfully")
	}
}
