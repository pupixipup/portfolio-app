const express = require('express')
const sqlite3 = require('sqlite3');
const path = require('path');
const expressHandlebars = require('express-handlebars')

// const db = new sqlite3.Database('');
const app = express()

app.engine("hbs", expressHandlebars.engine({
  defaultLayout: 'main.hbs'
}))

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

app.listen(8080)

