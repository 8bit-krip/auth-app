const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // 👈 serves the HTML and static files

const JWT_SECRET = "Kishanbhaisahihai";
const users = [];

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).send("User already exists");
    }
    users.push({ username, password });
    res.send('You have signed up');
});

app.post("/signin", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        const token = jwt.sign({ username }, JWT_SECRET);
        res.json({ token });
    } else {
        res.status(403).send({ message: "Invalid username or password" });
    }
});

function auth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Token missing" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.username = decoded.username;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

app.get("/me", auth, (req, res) => {
    const user = users.find(user => user.username === req.username);
    if (user) {
        res.json({ username: user.username });
    } else {
        res.status(401).send({ message: "Unauthorized" });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
