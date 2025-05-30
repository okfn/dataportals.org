var fs = require('fs')
  , csvparse = require('csv-parse')
  , marked = require('marked')
  , csvparse = require("csv-parse/sync")
  , fs = require("node:fs")
  , path = require("node:path")
  ;

var Catalog = function() {
  this._cache = {};
};

Catalog.prototype.clear = function() {
  this._cache = {};
};

Catalog.prototype.load = function(catalogs) {
  var that = this;
  for (idx in catalogs) {
    var dp = catalogs[idx];
    dp.id = dp.name;
    dp.description_html = marked(dp.description);
    dp.tags = dp.tags || '';
    dp.tags = dp.tags.replace(/^\s+|\s+$/g, '');
    dp.tags = dp.tags ? dp.tags.split(' ') : [];
    that._cache[dp.id] = dp;
  }
  that.total = catalogs.length;
}

Catalog.prototype.loadFromFile = function(path, cb) {
  var that = this;
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) {
      cb(err);
    } else {
      csvparse(data, { 'columns': true }, function(err, output) {
        if (err) {
          cb(err);
        } else {
          that.load(output);
          cb();
        }
      });
    }
  });
}

Catalog.prototype.get = function(id) {
  return this._cache[id];
}

Catalog.prototype.query = function(q) {
  var that = this;
  // TODO: actual search
  return Object.keys(this._cache).map(function(key) {
    return that._cache[key];
  });
}

exports.Catalog = Catalog;

// singleton catalog

const catalog = new Catalog();

const csvPath = path.join(__dirname, "..", "data", "portals.csv");
const csvData = fs.readFileSync(csvPath);
const jsonData = csvparse.parse(csvData, { columns: true });
catalog.load(jsonData);

exports.catalog = catalog;
