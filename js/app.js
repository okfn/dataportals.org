jQuery(document).ready(function($) {
  var catalog = new Catalog.Models.Catalog();
  window.catalog = new Catalog.Views.Application({
    model: catalog,
    el: $('body')
  });
  Backbone.history.start();

  var url = 'https://docs.google.com/spreadsheet/ccc?key=0Aon3JiuouxLUdE9POFhudGd6NFk0THpxR0NicFViRUE#gid=1';
  var dataset = new recline.Model.Dataset({
    backend: 'gdocs',
    url: url
  });
  dataset.fetch()
    .done(function() {
      $('.view.home .loading').hide();
    });

  var queryEditor = new recline.View.QueryEditor({
    model: dataset.queryState
  });
  $('.query-editor-here').append(queryEditor.el);

  var searchView = new SearchView({
    model: dataset,
    el: $('.placeholder-search')
  });
});

var SearchView = Backbone.View.extend({
  templateDataset: ' \
    <div class="dataset summary"> \
      {{#image}} \
      <img src="{{image}}" alt="{{title}}" class="logo" /> \
      {{/image}} \
      <h3> \
        <a href="{{url}}" target="_blank">{{title}}</a> \
      </h3> \
      <div class="description">{{description}}</div> \
      <div class="place">Location: {{place}}</div> \
      <ul class="keywords"> \
        {{#tags}} \
        <li>{{.}} \
        {{/tags}} \
      </ul> \
    <div> \
  ',

  initialize: function() {
    this.el = $(this.el);
    _.bindAll(this, 'render');
    this.model.bind('all', this.render);
  },

  render: function() {
    var self = this;
    this.el.html('');
    this.model.records.each(function(catalog) {
      var tmplData = catalog.toJSON();
      tmplData.tags = tmplData.tags.split(' ');
      var rendered = Mustache.render(self.templateDataset, tmplData);
      self.el.append(rendered);
    });
    return this;
  }
});

