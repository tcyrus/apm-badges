var express=require('express'),
  app=express(),
  https=require('https'),
  path=require('path'),
  swig=require('swig');

app.set('etag','strong');
app.set('port',(process.env.PORT||5000));
app.engine('svg',swig.renderFile);
app.set('views',path.join(__dirname,'/views/themes'));
app.set('view cache',false);

var themes=["one-light","one-dark","solarized-light","solarized-dark"];

app.get("/apm", function(req,res) {
  res.sendFile(path.join(__dirname,"/views/index.html"));
});

app.get('/apm/:name.svg', function(req,res) {
  var name=req.params.name.replace(/[|&;$%@"<>()+,]/g,"");
  var url='https://atom.io/api/packages/'+name;
  https.get(url, function(resp) {
    var body='';

    resp.on('data', function(chunk) {body+=chunk;});

    resp.on('end', function() {
      json_res=JSON.parse(body);
      if ('message' in json_res) {
        console.log('Package %s Gives Error %s',name,json_res['message']);
        res.status(500).send(json_res['message']);
      } else {
        res.type('image/svg+xml');
        res.append('Cache-Control','private, max-age=0, no-cache, no-store');
        res.append('Pragma','no-cache');
        var theme='one-light';
        if ('theme' in req.query && themes.indexOf(req.query.theme)>-1) {
          theme=req.query.theme;
        }
        res.render(theme+".svg",{json:json_res});
      }
    });
  }).on('error', function(err) {
    console.log('Error: %s',err);
    res.status(500).send(err);
  });
  /*
  request("https://atom.io/api/packages/"+name, function(err,response,body) {
    if (err) {
      console.log('Error: %s',err);
      res.status(500).send(err);
    } else {
      json_res=JSON.parse(body);
      if ('message' in json_res) {
        console.log('Package %s Gives Error %s',name,json_res['message']);
        res.status(500).send(json_res['message']);
      } else {
        //res.append('Content-Type','image/svg+xml');
        res.type('image/svg+xml');
        res.append('Cache-Control','private, max-age=0, no-cache, no-store');
        res.append('Pragma','no-cache');
        var theme='one-light';
        if ('theme' in req.query && themes.indexOf(req.query.theme)>-1) {
          theme=req.query.theme;
        }
        res.render(theme+".svg",{json:json_res});
      }
    }
  });
  */
});

var server = app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:"+app.get('port'));
});

process.on('SIGINT', server.close);
process.on('SIGTERM', server.close);
