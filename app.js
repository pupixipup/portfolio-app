const express = require('express');
const dbAPI = require('./dbAPI.js');
const path = require('path');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');

const app = express();

app.engine("hbs", expressHandlebars.engine({
  defaultLayout: 'main.hbs'
}))

app.use(
  express.urlencoded({
    extended: false
  })
)

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());

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
    console.log(posts);
    response.render("articles.hbs", { posts });
  });
});

app.get('/articles/create', function(request, response) {
  response.render("create-article.hbs")
});

app.post('/articles/create', function(request, response){
  const title = request.body.title;
  const text = request.body.text;
  console.log(request.body);
  
  dbAPI.createPost(title, text, 'url', function(){
    response.redirect('/articles');
  });
});

app.listen(8080)

console.log("Server is running on localhost:8080")