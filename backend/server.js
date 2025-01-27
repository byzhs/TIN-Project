


const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET = 'hello';

app.use(bodyParser.json());
app.use(cors());

// token auth
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
};

// user register
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        [name, email, hashedPassword],
        function (err) {
            if (err) {
                console.error('error registering user:', err.message);
                return res.status(500).json({ error: err.message });
            }

            const userId = this.lastID;

            db.run(
                `INSERT INTO user_categories (user_id, category_id)
                 SELECT ?, id FROM categories WHERE category_name IN ('Food', 'Transport', 'Entertainment')`,
                [userId],
                (linkErr) => {
                    if (linkErr) {
                        console.error('error linking user to basic categories:', linkErr.message);
                        return res.status(500).json({ error: 'failed to link basic categories' });
                    }
                    res.status(201).json({ message: 'User registered successfully!', user_id: userId });
                }
            );
        }
    );
});


// user login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required!' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) {
            console.log('Login error: Invalid credentials');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            console.log('Login error: Invalid credentials');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, SECRET, { expiresIn: '1h' });
        console.log('Login successful, token issued:', token);
        res.json({ token });
    });
});


// add transaction
app.post('/transactions', authenticateToken, (req, res) => {
    const { type, category_id, amount, date } = req.body;

    if (!type || !category_id || !amount) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    db.run(
        `INSERT INTO transactions (user_id, category_id, type, amount, date)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, category_id, type, amount, date || new Date().toISOString().split('T')[0]],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, message: 'Transaction added successfully' });
        }
    );
});

// get transactions
// no
app.get('/transactions', authenticateToken, (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    db.all(
        `SELECT t.*, c.category_name
         FROM transactions t
                  JOIN categories c ON t.category_id = c.id
         WHERE t.user_id = ?
             LIMIT ? OFFSET ?`,
        [req.user.id, parseInt(limit), parseInt(offset)],
        (err, rows) => {
            if (err) {
                console.error('Error fetching transactions:', err.message);
                return res.status(500).json({ error: err.message });
            }

            db.get(
                `SELECT COUNT(*) as total FROM transactions WHERE user_id = ?`,
                [req.user.id],
                (countErr, countResult) => {
                    if (countErr) {
                        console.error('Error counting transactions:', countErr.message);
                        return res.status(500).json({ error: countErr.message });
                    }

                    res.json({
                        transactions: rows,
                        totalPages: Math.ceil(countResult.total / limit),
                        currentPage: parseInt(page),
                    });
                }
            );
        }
    );
});


// delete transaction
app.delete('/transactions/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM transactions WHERE id = ? AND user_id = ?`, [id, req.user.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Transaction deleted successfully' });
    });
});

// modify transaction
app.put('/transactions/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { type, category_id, amount, date } = req.body;

    db.run(
        `UPDATE transactions
         SET type = ?, category_id = ?, amount = ?, date = ?
         WHERE id = ? AND user_id = ?`,
        [type, category_id, amount, date, id, req.user.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Transaction updated successfully' });
        }
    );
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// user Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name || null,
                role: user.role,
            },
            SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token });
    });
});

// adding new category for the user
app.post('/categories', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { category_name } = req.body;

    db.run(
        `INSERT INTO categories (category_name) VALUES (?)`,
        [category_name],
        function (err) {
            if (err) {
                console.error('Error adding category:', err.message);
                return res.status(500).json({ error: 'Failed to add category' });
            }

            const categoryId = this.lastID;

            // link user_categories table
            db.run(
                `INSERT INTO user_categories (user_id, category_id) VALUES (?, ?)`,
                [userId, categoryId],
                (linkErr) => {
                    if (linkErr) {
                        console.error('Error linking category to user:', linkErr.message);
                        return res.status(500).json({ error: 'Failed to link category to user' });
                    }
                    res.status(201).json({ message: 'Category added successfully', category_id: categoryId });
                }
            );
        }
    );
});


// fetch categori
app.get('/categories', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(
        `SELECT c.id, c.category_name
         FROM categories c
                  JOIN user_categories uc ON c.id = uc.category_id
         WHERE uc.user_id = ?`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error('Error fetching categories:', err.message);
                return res.status(500).json({ error: 'Failed to fetch categories' });
            }
            res.json(rows);
        }
    );
});



// delete category
app.delete('/categories/:id', authenticateToken, (req, res) => {
    const categoryId = req.params.id;
    const userId = req.user.id;

    db.run(
        `DELETE FROM user_categories WHERE category_id = ? AND user_id = ?`,
        [categoryId, userId],
        function (err) {
            if (err) {
                console.error('Error deleting category link:', err.message);
                return res.status(500).json({ error: 'Failed to delete category link.' });
            }

            db.get(
                `SELECT COUNT(*) as count FROM user_categories WHERE category_id = ?`,
                [categoryId],
                (countErr, result) => {
                    if (countErr) {
                        console.error('Error counting category usage:', countErr.message);
                        return res.status(500).json({ error: 'Failed to check category usage.' });
                    }

                    if (result.count === 0) {
                        db.run(
                            `DELETE FROM categories WHERE id = ?`,
                            [categoryId],
                            (deleteErr) => {
                                if (deleteErr) {
                                    console.error('Error deleting category:', deleteErr.message);
                                    return res.status(500).json({ error: 'Failed to delete category.' });
                                }
                                res.json({ message: 'Category deleted successfully.' });
                            }
                        );
                    } else {
                        res.json({ message: 'Category link removed successfully.' });
                    }
                }
            );
        }
    );
});

