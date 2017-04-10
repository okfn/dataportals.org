var config = require('../lib/config')
  , model = require('../lib/model')
  ;
// ========================================================
// Admin
// ========================================================

exports.reload = function(req, res) {
  model.catalog.clear();
  model.catalog.loadUrl(config.databaseUrl, function(err) {
    msg = 'Reloaded OK &ndash; <a href="/">Back to home page</a>';
    if (err) {
      console.error('Failed to reload config info');
      msg = 'Failed to reload config etc. ' + err;
    }
    res.send(msg);
  });
}

