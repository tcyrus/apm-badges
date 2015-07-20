express = require 'express'
request = require 'request'
path = require 'path'
swig = require 'swig'

app = express()
app.set 'etag', 'strong'
app.set 'port', process.env.PORT or 5000
app.engine 'svg', swig.renderFile
app.set 'views', path.join(__dirname, '/views/themes')
app.set 'view cache', false

themes = [
  'one-light'
  'one-dark'
  'solarized-light'
  'solarized-dark'
]

app.get '/apm', (req, res) ->
  res.sendFile path.join(__dirname, '/views/index.html')
  return

app.get '/apm/:name.svg', (req, res) ->
  name = req.params.name.replace(/[|&;$%@"<>()+,]/g, '')
  request 'https://atom.io/api/packages/' + name, (err, response, body) ->
    if err
      console.log 'Error: %s', err
      res.status(500).send err
    else
      json_res = JSON.parse(body)
      if 'message' of json_res
        console.log 'Package %s Gives Error %s', name, json_res['message']
        res.status(500).send json_res['message']
      else
        #res.append('Content-Type','image/svg+xml');
        res.type 'image/svg+xml'
        res.append 'Cache-Control', 'private, max-age=0, no-cache, no-store'
        res.append 'Pragma', 'no-cache'
        theme = 'one-light'
        if 'theme' of req.query and themes.indexOf(req.query.theme) > -1
          theme = req.query.theme
        res.render theme + '.svg', json: json_res
    return
  return

app.listen app.get('port'), ->
  console.log 'Node app is running at localhost:' + app.get 'port'
  return
