const express = require('express');
const dbAPI = require('./dbAPI.js');
const path = require('path');
const multer = require('multer');
const expressHandlebars = require('express-handlebars');
const { createVerify } = require('crypto');

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
    response.render("articles.hbs", { posts });
  });
});

app.get('/articles/create', function(request, response) {
  response.render("create-article.hbs")
});

app.get('/articles/:id', function(request, response) {
  console.log(request.params.id); 
  dbAPI.getPost(request.params.id, function(post) {
    response.render("article.hbs", { post });
  });
});

app.post('/articles/create', upload.single('imageUrl'), function(request, response){
  const title = request.body.title;
  const text = request.body.text;
  const imageUrl = request.file.filename;
  
  dbAPI.createPost(title, text, imageUrl, function(){
    response.redirect('/articles');
  });
});

app.listen(8080)

console.log("Server is running on localhost:8080")