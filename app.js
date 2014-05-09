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
  var catalogs = catalog.query();
  var total = catalogs.length;
  res.render('home.html', {
    catalogs: catalogs,
    total: total
  });
})

app.get('/about', function(req, res) {
  res.render('about.html', {});
});

app.get('/search', function(req, res) {
  var catalogs = catalog.query();
  var total = catalogs.length;
  res.render('search.html', {
    catalogs: catalogs,
    total: total
  });
});

app.get('/catalog/:id', function(req, res) {
  var id = req.params.id;
  var thiscatalog = catalog.get(id)
  if (!thiscatalog) {
    res.send(404, 'Not Found');
  } else {
    res.render('catalog.html', {
      catalog: thiscatalog
    });
  }
});

app.get('/group/:id', function(req, res) {
  var id = req.params.id;
  var catalogs = catalog.getGroup(id)
  res.render('group.html', {
    group: id,
    catalogs: catalogs,
    total: catalogs.length
  });
});

app.get('/api/data.json', function(req, res) {
  res.json(catalog._cache);
});

var model = require('./model.js');
// TODO: put this in a config
var url = 'https://docs.google.com/a/okfn.org/spreadsheet/ccc?key=0Aon3JiuouxLUdE9POFhudGd6NFk0THpxR0NicFViRUE#gid=1';
var catalog = new model.Catalog();

catalog.loadUrl(url, function(err) {
  if (err) {
    console.error('Failed to load dataset info');
  }
  app.listen(app.get('port'), function() {
    console.log("Listening on " + app.get('port'));
  });
});

