jQuery(document).ready(function($) {
  var catalog = new Catalog.Models.Catalog();
  window.catalog = new Catalog.Views.Application({
    model: catalog,
    el: $('body')
  });
  Backbone.history.start();

  // retrieve datasets ...
  var datasetNames = ['gdp', 'us-cpi'];
  var retrieved = 0;
  _.each(datasetNames, function(name) {
    catalog.getByName(name, function(err, ds) {
      retrieved += 1;
      if (retrieved == datasetNames.length) {
        $('.dataset-search').submit();
      }
    });
  });
});

