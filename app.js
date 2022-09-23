const express = require('express');
const dbAPI = require('./dbAPI.js');
const path = require('path');
const multer = require('multer');
const expressHandlebars = require('express-handlebars');
const { createVerify } = require('crypto');
const session = require('express-session');

const app = express();

app.engine("hbs", expressHandlebars.engine({
  defaultLayout: 'main.hbs'
}))

app.use(
  express.urlencoded({
    extended: false
  })
)

let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

let upload = multer({
  storage: storage
})

app.use(express.static(path.join(__dirname, '/public')));

app.get('/about', function(request, response){
  response.render("about.hbs")
})

app.get('/contacts', function(request, response){
    response.render("contacts.hbs")
})

app.get('/', function(request, response){
  response.render("home.hbs")
})


app.get('/articles', function(request, response) {
  dbAPI.getPosts(function(posts) {
    if (posts) {
    response.render("articles.hbs", { posts });
    } else {
      response.redirect('/error');
    }
  });
});

app.get('/articles/create', function(request, response) {
  response.render("create-article.hbs")
});

app.get('/portfolio', function(request, response) {
  dbAPI.getPortfolioSkills(function(skills) {
    if (skills) {
      response.render("portfolio.hbs", { skills });
    } else {
      response.redirect('/error');
    }
  });
});

app.get('/portfolio/edit', (request, response) => {
  response.render("edit-portfolio.hbs");
});

app.post('/portfolio/edit', (request, response) => {
  if (request.body.title && request.body.skill) {
  dbAPI.createPortfolioSkill(request.body.title, request.body.skill, () => {
    response.redirect('/portfolio');
  });
}
});

app.get('/articles/:id', function(request, response) {
  const id = request.params.id;
  dbAPI.getPost(id, function(post, comments) {
    if (post) {
      response.render("article.hbs", { post, comments });
    }
     else {
      response.render("404-page-not-found.hbs");
    }
  });
});

app.post('/articles/comment', function(request, response) {
  const nickname = request.body.nickname;
  const comment = request.body.comment;
  const postId = request.body.postId;
  if (nickname && comment && postId) {
    dbAPI.createComment(nickname, comment, postId, () => {
      response.redirect(`/articles/${postId}`);
    });
  }
});

app.post('/articles/create', upload.single('imageUrl'), function(request, response){
  const title = request.body.title;
  const text = request.body.text;
  const imageUrl = request.file.filename;
  
  if (title && text && imageUrl) {
  dbAPI.createPost(title, text, imageUrl, function(){
    response.redirect('/articles');
  });
}
});

app.get('/error', function(request, response){
  response.render('error.hbs');
});


app.get('/404', function(request, response){
  response.render('404-page-not-found.hbs');
});

app.get('*', function(req, res){
  res.status(404).redirect('/404');
});

app.listen(8080)

console.log("Server is running on http://localhost:8080")