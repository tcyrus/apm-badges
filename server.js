const express = require('express'),
      app = express(),
      https = require('https'),
      path = require('path'),
      swig = require('swig');

app.set('etag', 'strong');
app.set('port', (process.env.PORT || 5000));
app.engine('svg', swig.renderFile);
app.set('views', path.join(__dirname, '/views/themes'));
app.set('view cache', false);

const themes = ["one-light", "one-dark", "solarized-light", "solarized-dark"];

app.get('/', (req, res) => {
  res.redirect('/apm');
});

app.get('/apm', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/apm/:name.svg', (req, res) => {
  var name = req.params.name.replace(/[|&;$%@"<>()+,]/g, '');
  var url = 'https://atom.io/api/packages/' + name;
  https.get(url, resp => {
    var body = '';

    resp.on('data', chunk => {body += chunk});

    resp.on('end', () => {
      json_res = JSON.parse(body);
      if ('message' in json_res) {
        console.log('Package %s Gives Error %s', name, json_res['message']);
        res.status(500).send(json_res['message']);
      } else {
        res.type('image/svg+xml');
        res.append('Cache-Control', 'private,max-age=0,no-cache,no-store');
        res.append('Pragma', 'no-cache');
        var theme='one-light';
        if ('theme' in req.query && themes.indexOf(req.query.theme) > -1) {
          theme = req.query.theme;
        }
        res.render(theme + ".svg", {json: json_res});
      }
    });
  }).on('error', err => {
    console.log('Error: %s', err);
    res.status(500).send(err);
  });
});

var server = app.listen(app.get('port'), () => {
  console.log("Node app is running at localhost:" + app.get('port'));
});

process.on('SIGINT', server.close);
process.on('SIGTERM', server.close);
