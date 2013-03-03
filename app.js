var express = require('express')
  , path = require('path')
  , fs = require('fs')
  , nunjucks = require('nunjucks')
  ;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/templates');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
});

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('templates'));
env.express(app);

app.get('/', function(req, res) {
  res.render('home.html', {
  });
})

app.get('/about', function(req, res) {
  res.render('about.html', {});
});

app.get('/catalog/:id', function(req, res) {
  var id = req.params.id;
  var catalog = catalog.get(id)
  if (!dataset) {
    res.send(404, 'Not Found');
  }
  res.render('catalog.html', {
  });
});

app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});
