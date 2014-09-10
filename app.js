var express = require('express')
  , path = require('path')
  , fs = require('fs')
  , nunjucks = require('nunjucks')
  , config = require('./lib/config.js')
  , model = require('./lib/model.js')
  , routes = require('./routes/index.js')
  ;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
});

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
env.express(app);

app.get('/', function(req, res) {
  var catalogs = model.catalog.query();
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
  var catalogs = model.catalog.query();
  var total = catalogs.length;
  res.render('search.html', {
    catalogs: catalogs,
    total: total
  });
});

app.get('/add', function(req, res) {
  res.render('add.html');
});

app.get('/catalog/:id', function(req, res) {
  var id = req.params.id;
  var thiscatalog = model.catalog.get(id)
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
  var catalogs = model.catalog.getGroup(id)
  res.render('group.html', {
    group: id,
    catalogs: catalogs,
    total: catalogs.length
  });
});

app.get('/api/data.json', function(req, res) {
  res.json(model.catalog._cache);
});

app.get('/api/catalogs/:id', function(req, res) {
  var id = req.params.id;
  var c = model.catalog.get(id);
  console.log(c)
  if (!c) {
    res.send(404, 'Not Found');
  }
  res.header("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(c));
  res.end();
});

app.get('/api/catalogs', function(req, res) {
  var catalogs = model.catalog.query();

  res.header("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(catalogs));
  res.end();
});

app.get('/api/groups', function(req, res) {
  var groups = model.catalog.getGroups();

  res.header("Content-Type", "application/json; charset=utf-8");
  res.write(JSON.stringify(groups));
  res.end();
});

app.get('/admin/reload', routes.reload);

model.catalog.loadUrl(config.databaseUrl, function(err) {
  if (err) {
    console.error('Failed to load dataset info');
  }
  app.listen(app.get('port'), function() {
    console.log("Listening on " + app.get('port'));
  });
});

