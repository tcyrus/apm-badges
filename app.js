var app=require('express')(),
//  fs=require('fs'),
  request=require('request'),
  swig=require('swig');

app.set('port',(process.env.PORT||5000));
app.engine('svg',swig.renderFile);
app.set('view engine','svg');
app.set('views',__dirname+'/views');
app.set('view cache',false);

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
      json_res=JSON.parse(body);
      if ('message' in json_res) {
        console.log('Package %s Gives Error %s',name,json_res['message']);
        res.status(500).send(json_res['message']);
      } else {
        res.append("Content-Type","image/svg+xml");
        res.render('default',{json:json_res});
      }
    }
  });
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:"+app.get('port'))
})
