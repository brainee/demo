var express = require('express');
var app = express();
var env = process.env.NODE_ENV || 'production';
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'accept, content-type');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('Content-Type', 'application/json');
  next();
});

app.post('/restful/index', function(req, res) {
  var list = [{
    title: '北京',
    id: 1
  },{
    title: '上海',
    id: 2
  }];
  res.send(list);
});

app.post('/restful/detail', function(req, res) {
  var data = req.body;
  res.send({
    hotelId: data.hotelId,
    date: data.date
  });
});

app.post('/restful/detail/api1', function(req, res) {
  var random = Math.random();
  var data = {
    list: [
      { id: 1, city: '上海' }
    ]
  };

  if (random > .5) {
    data.request = 'api1';
  } else {
    data.request = 'api2';
  }

  res.send(data);
});

app.post('/restful/detail/api2', function(req, res) {
  var data = req.body;
  res.send({
    list: [
      { id: 2, city: '北京' }
    ],
    key: data.key
  });
});

app.post('/restful/detail/api3', function(req, res) {
  var data = req.body;
  res.send({
    list: [
      { id: 3, city: '成都' }
    ],
    key: data.key
  });
});


app.post('/restful/restful/timeout', function(req, res) {
  function sleep(milliSecond) {

    var startTime = new Date().getTime();

    while(new Date().getTime() <= milliSecond + startTime) {

    }

  }
  sleep(10 * 1000);

  res.send({
    status: 1
  });
});

// 404静态文件处理
/*app.use(function(req, res, next) {
  var url = req.url;
  console.log('http://localhost' + url);
  res.redirect(301, 'http://localhost' + url);
});*/

var port = process.env.PORT || 2000;
app.listen(port);
console.log('app started on port '+ port);