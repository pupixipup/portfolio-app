const dummyData = require('./dummy-data')
const express = require('express')
const path = require('path');
const expressHandlebars = require('express-handlebars')

const app = express()

app.engine("hbs", expressHandlebars.engine({
  defaultLayout: 'main.hbs'
}))

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(request, response){
  const model = {
    humans: dummyData.humans
  }
  response.render("show-all-humans.hbs", model)
})

  app.get('/contacts', function(request, response){
    response.render("about-us.hbs")
  })

app.listen(8080)
