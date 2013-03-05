var model = require('../model.js');

var url = 'https://docs.google.com/a/okfn.org/spreadsheet/ccc?key=0Aon3JiuouxLUdE9POFhudGd6NFk0THpxR0NicFViRUE#gid=1';

var catalog = new model.Catalog();

catalog.loadUrl(url, function() {
  console.log(catalog._cache['alabama']);
});
    
