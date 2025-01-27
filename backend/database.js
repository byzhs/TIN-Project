


const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const dbPath = config.database.path;
const dbDir = dbPath.substring(0, dbPath.lastIndexOf('/'));
if (!fs.existsSync(dbDir)) {
    console.error(`directory "${dbDir}" does not exist`);
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('error connecting to the database:', err.message);
    } else {
        console.log('connected to the sqlite database');
        initializeDatabase();
    }
});

const initializeDatabase = () => {
    db.serialize(() => {

        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 name TEXT NOT NULL,
                                                 email TEXT UNIQUE NOT NULL,
                                                 password TEXT,
                                                 role TEXT DEFAULT 'user'
            );
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS categories (
                                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                      category_name TEXT NOT NULL,
                                                      user_id INTEGER,
                                                      FOREIGN KEY (user_id) REFERENCES users(id)
                );
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS transactions (
                                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        user_id INTEGER NOT NULL,
                                                        category_id INTEGER NOT NULL,
                                                        amount REAL CHECK(amount > 0),
                date DATE DEFAULT CURRENT_DATE,
                type TEXT NOT NULL CHECK (type IN ('income', 'expense')) DEFAULT 'expense',
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (category_id) REFERENCES categories(id)
                );
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS user_categories (
                                                           user_id INTEGER,
                                                           category_id INTEGER,
                                                           FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (category_id) REFERENCES categories(id)
                );
        `);

        db.run(`
            INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES
            (1, 'Alice', 'alice@example.com', 'password123', 'user'),
            (2, 'Bob', 'bob@example.com', 'password123', 'user');
        `);

        db.run(`
            INSERT OR IGNORE INTO categories (id, category_name) VALUES
            (1, 'Food'),
            (2, 'Transport'),
            (3, 'Entertainment');
        `);

        db.run(`
            INSERT OR IGNORE INTO user_categories (user_id, category_id) VALUES
            (1, 1),
            (1, 2),
            (1, 3),
            (2, 1),
            (2, 3);
        `);

        db.run(`
            INSERT OR IGNORE INTO transactions (id, user_id, category_id, amount, type, date) VALUES
            (1, 1, 1, 50.00, 'expense', '2025-01-01'),
            (2, 2, 2, 20.00, 'expense', '2025-01-02'),
            (3, 1, 3, 15.00, 'income', '2025-01-03');
        `);

        console.log('database initialized with sample data');
    });
};

module.exports = db;
console.log('Database file path:', dbPath);
