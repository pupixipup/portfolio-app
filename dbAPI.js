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
    this.db.run(`
      CREATE TABLE IF NOT EXISTS portfolio (
        id INTEGER PRIMARY KEY,
        title TEXT,
        skill INTEGER
      )
    `);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY,
        nickname TEXT,
        comment TEXT,
        postId INTEGER,
        FOREIGN KEY (postId) REFERENCES posts(id)
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
      this.getComments(id, post, action)
    });
  }

  createPost(title, description, imageUrl, action) {
    const query = `INSERT INTO posts (title, description, imageUrl) VALUES (?, ?, ?)`;
    const values = [title, description, imageUrl];
    this.db.run(query, values, action);
  };

  createPortfolioSkill(title, skill, action) {
    const query = `INSERT INTO portfolio (title, skill) VALUES (?, ?)`;
    const values = [title, skill];
    this.db.run(query, values, action);
  }

  getPortfolioSkills(action) {
    const query = `SELECT * FROM portfolio ORDER BY skill DESC`;
    this.db.all(query, (error, skills) => {
      action(skills);
    });
  }

  createComment(nickname, comment, postId, action) {
    const query = `INSERT INTO comments (nickname, comment, postId) VALUES (?, ?, ?)`;
    const values = [nickname, comment, postId];
    this.db.run(query, values, action);
  }

  getComments(postId, post, action) {
    const query = `SELECT * FROM comments WHERE postId = ?`;
    const values = [postId];
    this.db.all(query, values, (error, comments) => {
      action(post, comments);
    });
  }
}

const database = new dbAPI();
database.createTable();

module.exports = database;