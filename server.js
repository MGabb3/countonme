// server.js
//This code was created with the aid of Microsoft Copilot
//Reference: code generated December 1, 2024
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'G892!0&.223f912',
    resave: false,
    saveUninitialized: true
}));

const dbConnection = mysql.createConnection({
    host: 'localhost',
    user: 'your_db_username',
    password: 'your_db_password',
    database: 'countonme'
});

dbConnection.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Database connection successful.');
});

app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'public', 'home.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'loginpg.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));
app.get('/us_dash', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'user_dash.html'));
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    dbConnection.query(sql, [username, hashedPassword], (err, results) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).send('There was an issue submitting your request. Please try again.');
        }
        req.session.userId = results.insertId; // Set the session userId
        res.redirect('/us_dash'); // Redirect to user dashboard
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    dbConnection.query(sql, [username], (err, results) => {
        if (err || results.length === 0) {
            console.error('Error fetching user:', err);
            return res.status(401).send('Please input a valid username and password.');
        }
        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).send('Please input a valid username and password.');
        }
        req.session.userId = user.id; // Set the session userId
        res.redirect('/us_dash'); // Redirect to user dashboard
    });
});

app.post('/create_timer', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const { timerName, timerDate } = req.body;
    const sql = 'INSERT INTO timers (user_id, timer_name, start_time, end_time) VALUES (?, ?, ?, ?)';
    const userId = req.session.userId;
    const endTime = new Date(timerDate).toISOString();
    dbConnection.query(sql, [userId, timerName, timerDate, endTime], (err) => {
        if (err) {
            console.error('Error creating timer:', err);
            return res.status(500).send('There was an issue submitting your request. Please try again.');
        }
        res.send('New timer created!');
    });
});

app.get('/get_timers', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const sql = 'SELECT * FROM timers WHERE user_id = ? ORDER BY start_time DESC';
    dbConnection.query(sql, [req.session.userId], (err, results) => {
        if (err) {
            console.error('Error fetching timers:', err);
            return res.status(500).send('There was an issue submitting your request. Please try again.');
        }
        res.json(results);
    });
});

app.post('/edit_timer', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const { timerId, newTimerName, newTimerDate } = req.body;
    const sql = 'UPDATE timers SET timer_name = ?, start_time = ?, end_time = ? WHERE id = ? AND user_id = ?';
    const userId = req.session.userId;
    const endTime = new Date(newTimerDate).toISOString();
    dbConnection.query(sql, [newTimerName, newTimerDate, endTime, timerId, userId], (err) => {
        if (err) {
            console.error('Error updating timer:', err);
            return res.status(500).send('There was an issue submitting your request. Please try again.');
        }
        res.send('Edit complete');
    });
});

app.post('/delete_timer', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const { timerId } = req.body;
    const sql = 'DELETE FROM timers WHERE id = ? AND user_id = ?';
    const userId = req.session.userId;
    dbConnection.query(sql, [timerId, userId], (err) => {
        if (err) {
            console.error('Error deleting timer:', err);
            return res.status(500).send('There was an issue submitting your request. Please try again.');
        }
        res.send('Timer Deleted');
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
