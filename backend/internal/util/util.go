package util

import (
	"math/rand"
	"strings"
)

// RandomCode returns a random uppercase alphabetic string of the given length.
func RandomCode(length int) string {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	b := strings.Builder{}
	b.Grow(length)
	for i := 0; i < length; i++ {
		b.WriteByte(letters[rand.Intn(len(letters))])
	}
	return b.String()
}

// RandomID returns a random lowercase alphanumeric string of the given length.
func RandomID(length int) string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := strings.Builder{}
	b.Grow(length)
	for i := 0; i < length; i++ {
		b.WriteByte(chars[rand.Intn(len(chars))])
	}
	return b.String()
}
