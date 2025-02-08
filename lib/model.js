var request = require('request')
  , csvparse = require('csv-parse')
  , marked = require('marked')
  , csvparse = require("csv-parse/sync")
  , fs = require("node:fs")
  , path = require("node:path")
  ;

var Catalog = function() {
  this._cache = {};
  this._groups = {};
};

Catalog.prototype.clear = function() {
  this._cache = {};
  this._groups = {};
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
    dp.groups = dp.groups || '';
    dp.groups = dp.groups.replace(/^\s+|\s+$/g, '');
    dp.groups = dp.groups ? dp.groups.split(' ') : [];
    dp.groups.forEach(function(groupName) {
      if (groupName in that._groups) {
        var out = that._groups[groupName];
        out.push(dp.id);
        that._groups[groupName] = out;
      } else {
        that._groups[groupName] = [dp.id];
      }
    });
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

Catalog.prototype.getGroup = function(group) {
  var that = this;
  return this._groups[group].map(function(catalogId) {
    return that.get(catalogId);
  });
}

Catalog.prototype.getGroups = function() {
  return this._groups;
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
