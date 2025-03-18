const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if a username is valid
const isValid = (username) => {
    // Ensure the username is a non-empty string and does not contain spaces
    return typeof username === "string" && username.trim().length > 0 && !username.includes(" ");
};

// Check if the user exists and credentials are correct
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT token
        let accessToken = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });

        // Store access token in session
        req.session.authorization = { accessToken, username };

        return res.status(300).json({ message: "Login successful", token: accessToken });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let { review } = req.body;
    let username = req.session.authorization?.username; // Retrieve username from session

    // Ensure the user is logged in
    if (!username) {
        return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    // Ensure a review is provided
    if (!review) {
        return res.status(400).json({ message: "Review content is required" });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Store or update the review
    books[isbn].reviews[username] = review;

    return res.status(300).json({ message: "Review added/updated successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let username = req.session.authorization?.username; // Retrieve username from session

    // Ensure the user is logged in
    if (!username) {
        return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has a review to delete
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found to delete" });
    }

    // Delete the review
    delete books[isbn].reviews[username];

    return res.status(300).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
