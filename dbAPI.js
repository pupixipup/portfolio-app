const sqlite3 = require('sqlite3');

class DBAPI {
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

  getPosts(page, action) {
    const offset = (page - 1) * 5 || 0;
    const query = 'SELECT * FROM posts LIMIT 5 OFFSET ?';
    this.db.all(query, [offset], (error, posts) => {
      action(posts);
    });
  }

  getPostsCount(action) {
    const query = 'SELECT COUNT(*) FROM posts';
    this.db.get(query, (error, count) => {
      action(count);
    });
  }

  deletePost(id, action) {
    const query = 'DELETE FROM posts WHERE id = ?';
    this.db.run(query, [id], (error) => {
      action(error);
    });
  }

  getPost(id, action) {
    const query = 'SELECT * FROM posts WHERE id = ?';
    const values = [id];
    this.db.get(query, values, (error, post) => {
      this.getComments(id, post, action);
    });
  }

  createPost(title, description, imageUrl, action) {
    const query = 'INSERT INTO posts (title, description, imageUrl) VALUES (?, ?, ?)';
    const values = [title, description, imageUrl];
    this.db.run(query, values, action);
  }

  createPortfolioSkill(title, skill, action) {
    const query = 'INSERT INTO portfolio (title, skill) VALUES (?, ?)';
    const values = [title, skill];
    this.db.run(query, values, action);
  }

  getPortfolioSkills(action) {
    const query = 'SELECT * FROM portfolio ORDER BY skill DESC';
    this.db.all(query, (error, skills) => {
      action(skills);
    });
  }

  createComment(nickname, comment, postId, action) {
    const query = 'INSERT INTO comments (nickname, comment, postId) VALUES (?, ?, ?)';
    const values = [nickname, comment, postId];
    this.db.run(query, values, action);
  }

  deleteComment(id, action) {
    const query = 'DELETE FROM comments WHERE id = ?';
    const values = [id];
    this.db.run(query, values, action);
  }

  getComments(postId, post, action) {
    const query = 'SELECT * FROM comments WHERE postId = ?';
    const values = [postId];
    this.db.all(query, values, (error, comments) => {
      action(post, comments);
    });
  }

  deleteSkill(id, action) {
    const query = 'DELETE FROM portfolio WHERE id = ?';
    const values = [id];
    this.db.run(query, values, action);
  }

  searchPosts(search, action) {
    const query = `SELECT * FROM posts WHERE title LIKE '%${search}%'`;
    this.db.all(query, (error, posts) => {
      action(posts);
    });
  }
}

const database = new DBAPI();
database.createTable();

module.exports = database;
