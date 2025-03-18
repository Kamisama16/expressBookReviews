const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");


public_users.post("/register", (req, res) => {
    const { username, password } = req.body; // Extract username & password

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if username already exists
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists!" });
    }

    // Add the new user to the users array
    users.push({ username, password });
    return res.status(300).json({ message: "User successfully registered. Now you can log in." });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
    try {
        let response = await axios.get("https://newworldskam-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/");
        return res.status(300).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books" });
    }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
    let isbn = req.params.isbn;

    axios.get(`https://newworldskam-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/isbn/${isbn}`)
        .then(response => res.status(300).json(response.data))
        .catch(error => res.status(500).json({ message: "Error retrieving book by ISBN" }));
});
  
// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
    let authorName = req.params.author;

    try {
        let response = await axios.get(`https://newworldskam-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author/${authorName}`);
        return res.status(300).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books by author" });
    }
});

// Get book details based on title
public_users.get("/title/:title", function (req, res) {
    let bookTitle = req.params.title;

    axios.get(`https://newworldskam-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/title/${bookTitle}`)
        .then(response => res.status(300).json(response.data))
        .catch(error => res.status(500).json({ message: "Error retrieving book by title" }));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    let isbn = req.params.isbn; // Extract ISBN from request parameters

    if (books[isbn]) {
        return res.status(300).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found with given ISBN" });
    }
});

module.exports.general = public_users;
