const express = require('express');
const dbAPI = require('./dbAPI.js');
const path = require('path');
const multer = require('multer');
const expressHandlebars = require('express-handlebars');
const { createVerify } = require('crypto');
const session = require('express-session');
const constants = require('./constants.js');

const app = express();

app.engine("hbs", expressHandlebars.engine({
  defaultLayout: 'main.hbs'
}))

app.use(
  express.urlencoded({
    extended: false
  })
)

// app.use(
//   expressSession({
//     saveUninitialized: false,
//     resave: false,
//     secret: 'secret'
//   })
// )

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
  dbAPI.getPortfolioSkills(function(skills) {
    if (skills) {
      response.render("edit-portfolio.hbs", { skills });
    } else {
      response.redirect('/error');
    }
  });
});

app.post('/portfolio/edit', (request, response) => {
  const title = request.body.title;
  const skill = request.body.skill;

  const errorMessages = [];
  if (title === "" || isNaN(skill) || title.length > 20) {
    errorMessages.push("All fields are required and should be less than 20 chars");
  } if (skill <= 0 && skill > 5) {
    errorMessages.push("Skill shoule be greater than 0 and less than 6"); 
  }

  if (errorMessages.length === 0) {
    dbAPI.createPortfolioSkill(title, skill, (error) => {
      if (error) {
        errorMessages.push('Internal Server Error');
        response.render('edit-portfolio.hbs', { errorMessages });
      }
      response.redirect('/portfolio');
    });
  } else {
    response.render('edit-portfolio.hbs', { errorMessages });
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
  if (nickname && comment && postId && nickname.length < 20 && comment.length <= 100) {
    dbAPI.createComment(nickname, comment, postId, () => {
      response.redirect(`/articles/${postId}`);
    });
  }
});

app.post('/articles/create', upload.single('imageUrl'), function(request, response){
  const title = request.body.title;
  const text = request.body.text;
  let imageUrl;
  if (request.file) {
    imageUrl = request.file.filename;
  }

  const errorMessages = [];
  if (title.length < constants.ARTICLE_TITLE_MINLENGTH || text.length <= constants.ARTICLE_TEXT_MINLENGTH) {
    errorMessages.push('Please, write detailed title and text.');
  } if (title.length > constants.ARTICLE_TITLE_MAXLENGTH) {
    errorMessages.push('Title should not be too big');
  } if (!title || !text || !imageUrl) {
    errorMessages.push('All fields are required!');
  }
  if (errorMessages.length) {
    response.render('create-article.hbs', { errorMessages });
    return;
  }

  dbAPI.createPost(title, text, imageUrl, function(error){
    if (error) {
      errorMessages.push('Internal Error');
      response.render('create-article.hbs', { errorMessages });
  }
    response.redirect('/articles');
  });
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

app.get('/login', function(request, response){ 
  response.render('login.hbs');
});

app.post('/login', function(request, response){ 
  const username = request.body.username;
  if (username === constants.ADMIN_USERNAME && password === constants.ADMIN_PASSWORD) {
  request.session.isLoggedIn = true;
  response.redirect('/');
}
});

app.listen(8080)

console.log("Server is running on http://localhost:8080")