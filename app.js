const express = require('express');
const path = require('path');
const multer = require('multer');
const expressHandlebars = require('express-handlebars');
// const { createVerify } = require('crypto');
const expressSession = require('express-session');
const dbAPI = require('./dbAPI');
const constants = require('./constants');

const app = express();

app.engine('hbs', expressHandlebars.engine({
  defaultLayout: 'main.hbs',
}));

app.use(
  express.urlencoded({
    extended: false,
  }),
);

app.use(
  expressSession({
    saveUninitialized: false,
    resave: false,
    secret: 'secret',
  }),
);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './public/uploads');
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
});

app.use(express.static(path.join(__dirname, '/public')));

app.get('/about', (request, response) => {
  response.render('about.hbs');
});

app.get('/contacts', (request, response) => {
  response.render('contacts.hbs');
});

app.get('/', (request, response) => {
  response.render('home.hbs');
});

app.get('/articles', (request, response) => {
  const page = request.query.page || 0;
  dbAPI.getPostsCount((count) => {
    const postsTotalCount = count['COUNT(*)'];
    const pagesTotalCount = Math.ceil(postsTotalCount / 5);
    const pages = [];
    for (let i = 1; i <= pagesTotalCount; i += 1) {
      pages.push(i);
    }
    dbAPI.getPosts(page, (posts) => {
      if (posts) {
        response.render('articles.hbs', { posts, isLoggedIn: request.session.isLoggedIn, pages });
      } else {
        response.redirect('/error');
      }
    });
  });
});

app.get('/articles/create', (request, response) => {
  response.render('create-article.hbs');
});

app.get('/portfolio', (request, response) => {
  dbAPI.getPortfolioSkills((skills) => {
    if (skills) {
      response.render('portfolio.hbs', { skills, isLoggedIn: request.session.isLoggedIn });
    } else {
      response.redirect('/error');
    }
  });
});

app.get('/portfolio/edit', (request, response) => {
  dbAPI.getPortfolioSkills((skills) => {
    if (skills) {
      response.render('edit-portfolio.hbs', { skills });
    } else {
      response.redirect('/error');
    }
  });
});

app.post('/portfolio/edit', (request, response) => {
  const { title } = request.body;
  const { skill } = request.body;

  const errorMessages = [];
  if (title === '' || Number.isNaN(skill) || title.length > constants.SKILL_TITLE_MAXLENGTH || title.length < constants.SKILL_TITLE_MINLENGTH) {
    errorMessages.push('All fields are required and should be less than 15 chars');
  } if (skill <= 0 && skill > 5) {
    errorMessages.push('Skill shoule be greater than 0 and less than 6');
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

app.get('/articles/:id', (request, response) => {
  const { id } = request.params;
  dbAPI.getPost(id, (post, comments) => {
    if (post) {
      response.render('article.hbs', { post, comments, isLoggedIn: request.session.isLoggedIn });
    } else {
      response.render('404-page-not-found.hbs');
    }
  });
});

app.post('/articles/:id/delete', (request, response) => {
  const { id } = request.params;
  dbAPI.deletePost(id, (error) => {
    if (error) {
      response.redirect('/error');
    }
    response.redirect('/articles');
  });
});

app.post('/articles/comment', (request, response) => {
  const { nickname } = request.body;
  const { comment } = request.body;
  const { postId } = request.body;
  if (nickname && comment && postId && nickname.length < 20 && comment.length <= 100) {
    dbAPI.createComment(nickname, comment, postId, () => {
      response.redirect(`/articles/${postId}`);
    });
  }
});

app.post('/articles/create', upload.single('imageUrl'), (request, response) => {
  const { title } = request.body;
  const { text } = request.body;
  let imageUrl;
  if (request.file) {
    imageUrl = request.file.filename;
  }

  const errorMessages = [];
  if (title.length < constants.ARTICLE_TITLE_MINLENGTH
    || text.length <= constants.ARTICLE_TEXT_MINLENGTH) {
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

  dbAPI.createPost(title, text, imageUrl, (error) => {
    if (error) {
      errorMessages.push('Internal Error');
      response.render('create-article.hbs', { errorMessages });
    }
    response.redirect('/articles');
  });
});

app.get('/error', (request, response) => {
  response.render('error.hbs');
});

app.get('/404', (request, response) => {
  response.render('404-page-not-found.hbs');
});

app.get('/login', (request, response) => {
  response.render('login.hbs', { isLoggedIn: request.session.isLoggedIn });
});

app.post('/portfolio/remove/:id', (request, response) => {
  const { id } = request.params;
  dbAPI.deleteSkill(id, (error) => {
    if (error) {
      console.log(error);
      response.render('error.hbs');
    } else {
      response.redirect('/portfolio');
    }
  });
});

app.get('/search-articles', (request, response) => {
  const { search } = request.query;
  dbAPI.searchPosts(search, (posts) => {
    if (posts) {
      response.render('articles.hbs', { posts, isLoggedIn: request.session.isLoggedIn });
    } else {
      response.redirect('/error');
    }
  });
});

app.post('/login', (request, response) => {
  const { username } = request.body;
  const { password } = request.body;

  if (username === constants.ADMIN_USERNAME && password === constants.ADMIN_PASSWORD) {
    request.session.isLoggedIn = true;
    response.redirect('/');
  } else {
    const model = { failedToLogin: true };
    response.render('login.hbs', model);
  }
});

// app.get('*', (req, res) => {
//   res.status(404).redirect('/404');
// });

app.listen(8080);

console.log('Server is running on http://localhost:8080');
