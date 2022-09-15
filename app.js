const dummyData = require('./dummy-data')
const express = require('express')
const path = require('path');
const expressHandlebars = require('express-handlebars')

const app = express()

app.engine("hbs", expressHandlebars.engine({
  defaultLayout: 'main.hbs'
}))

app.use(express.static(path.join(__dirname, '/public')));

app.get('/about', function(request, response){
  const model = {
    humans: dummyData.humans
  }
  response.render("about.hbs", model)
})

app.get('/contacts', function(request, response){
    response.render("contacts.hbs")
})

app.get('/', function(request, response){
  response.render("home.hbs")
})

app.listen(8080)
