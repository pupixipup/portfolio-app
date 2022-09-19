const sqlite3 = require('sqlite3');

class dbAPI {
  constructor() {
    this.db = new sqlite3.Database('app-database.db');
  }

  createTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        title TEXT,
        description TEXT,
        imageUrl TEXT
      )
    `);
  }
  
  getPosts(action) {
    const query = `SELECT * FROM posts`;
    this.db.all(query, (error, posts) => {
      action(posts);
    });
  }

  getPost(id, action) {
    const query = `SELECT * FROM posts WHERE id = ?`;
    const values = [id];
    this.db.get(query, values, (error, post) => {
      action(post);
    });
  }

  createPost(title, description, imageUrl, action) {
    const query = `INSERT INTO posts (title, description, imageUrl) VALUES (?, ?, ?)`;
    const values = [title, description, imageUrl];
    this.db.run(query, values, action);
  };
}

const database = new dbAPI();
database.createTable();

module.exports = database;