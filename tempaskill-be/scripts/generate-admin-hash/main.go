package main

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := "admin123"
	
	// Generate bcrypt hash (same cost as in the app)
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}
	
	fmt.Println("Password: admin123")
	fmt.Println("Bcrypt Hash:")
	fmt.Println(string(hash))
	fmt.Println("\nCopy this hash to the SQL file")
}
