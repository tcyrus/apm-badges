var app=require('express')(),
  fs=require('fs'),
  request=require('request'),
  swig=require('swig');

app.set('port',(process.env.PORT||5000));
swig.setDefaults({loader:swig.loaders.fs(__dirname+"/views")});

app.get("/apm", function(req,res) {
    res.sendFile(__dirname+"/views/index.html");
});

app.get('/apm/:name.svg', function(req,res) {
  var name = req.params.name.replace(/[|&;$%@"<>()+,]/g, "");
  request("https://atom.io/api/packages/"+name, function(err,response,body) {
    if (err) {
      console.log('Error: %s',err);
      res.status(500).send(err);
    } else {
      json=JSON.parse(body);
      if ('message' in json) {
        console.log('Package %s Gives Error %s',name,json['message']);
        res.status(500).send(json['message']);
      } else {
        res.writeHead(200,{"Content-Type":"image/svg+xml"});
        var badge=swig.renderFile('default.svg',json);
        res.write(badge);
        res.end();
      }
    }
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:"+app.get('port'))
})
