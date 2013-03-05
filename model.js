var request = require('request');
var recline = require('./public/vendor/backend.gdocs.js');
// var marked = require('marked');

var Catalog = function() {
  this._cache = {};
};

Catalog.prototype.load = function(catalogs) {
  var that = this;
  for (idx in catalogs) {
    var dp = catalogs[idx];
    that._cache[dp.id] = dp;
  }
  that.total = catalogs.length;
}

// Load catalog from a google spreadsheet
Catalog.prototype.loadUrl = function(url, cb) {
  var that = this;
  var urls = recline.Backend.GDocs.getGDocsApiUrls(url);
  request(urls.worksheetAPI, function(err, res, body) {
    if (err) {
      cb(err);
    } else {
      var data = JSON.parse(body);
      data = recline.Backend.GDocs.parseData(data);
      that.load(data.records);
      cb();
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
