var request = require('request')
  , csvparse = require('csv-parse')
  , marked = require('marked')
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

// Load catalog from a google spreadsheet
Catalog.prototype.loadUrl = function(url, cb) {
  var that = this;
  request(url, function(err, res, body) {
    if (err) {
      cb(err);
    } else {
      csvparse(body, {'columns': true}, function(err, output) {
        // console.log(output.slice(0, 10));
        that.load(output);
        cb();
      })
        .on('error', function(err) {
          console.log(url);
          console.log(body);
          cb(err);
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
exports.catalog = new Catalog();

