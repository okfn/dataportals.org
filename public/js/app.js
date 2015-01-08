jQuery(document).ready(function($) {
  var url = '/api/data.json';
  $.getJSON(url, function(data) {
    var records = [];
    for (key in data) {
      var rec = data[key];
      records.push(rec);
    }
    var dataset = new recline.Model.Dataset({
      records: records
    });
    dataset.fetch();
    dataset.query({size: dataset.recordCount});
    createOverviewMap(dataset);
  });
});

function createOverviewMap(dataset) {
  $el = $('.overview-map');
  var view = new recline.View.Map({
    el: $el,
    model: dataset,
    state: {
      cluster: true,
      autoZoom: false
    }
  });
  view.infobox = function(record) {
    var html = '';
    html += '<a href="/catalog/' + record.attributes['id'] + '">' + record.attributes['title'] + '</a>';
    html += '<p>' + record.attributes['description'] + '</p>';
    html += '<p><strong>URL:</strong> <a href="'+ record.attributes['url'] + '">' + record.attributes['url'] + '</a></p>';
    return html;
  }
  view.render();

  var queryEditor = new recline.View.QueryEditor({
    model: dataset.queryState
  });
  $('.query-editor-here').append(queryEditor.el);
}
