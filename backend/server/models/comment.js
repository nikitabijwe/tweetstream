const date = new Date();
const utcDateString = date.toISOString();

class Comment {
  constructor(dataAccessObject) {
    this.dataAccessObject = dataAccessObject;
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`;
    return this.dataAccessObject.run(sql);
  }

  deleteComments() {
    const sql = 'DELETE FROM comments';
    return this.dataAccessObject.run(sql);
  }

  createComment({ name, message, authorId }) {
    return this.dataAccessObject.run(
      'INSERT INTO comments (name, message, authorId, created_at) VALUES (?, ?, ?, ?)',
      [name, message, authorId, utcDateString]
    );
  }

  getComment(id) {
    return this.dataAccessObject.get(
      'SELECT * FROM comments WHERE id = ?',
      [id]
    );
  }
  
  getComments() {
    return this.dataAccessObject.all('SELECT * FROM comments');
  }
}

module.exports = Comment;
