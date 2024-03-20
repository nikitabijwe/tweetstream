const date = new Date();

const utcDateString = date.toISOString().toLocaleString();

class User {
    constructor(dataAccessObject) {
        this.dataAccessObject = dataAccessObject;
    }

    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT,
          avatar: TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`;
        return this.dataAccessObject.run(sql);
    }

    deleteUsers() {
        const sql = 'DELETE FROM users';
        return this.dataAccessObject.run(sql);
    }

    createUser({ name, email, avatar }) {
        return this.dataAccessObject.run(
            'INSERT INTO users (name, email, avatar, created_at) VALUES (?, ?, ?, ?)',
            [name, email, avatar, utcDateString]
        );
    }

    getUser(id) {
        return this.dataAccessObject.get(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
    }

    getUsers() {
        return this.dataAccessObject.all('SELECT * FROM users');
    }
}

module.exports = User;