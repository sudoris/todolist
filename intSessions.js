var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret:'SuperSecretPassword'}));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 5333);

app.get('/',function(req,res,next){
  var context = {};
  //If there is no session, go to the main page.
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }
  context.name = req.session.name;
  context.toDoCount = req.session.toDo.length || 0;
  context.toDo = req.session.toDo || [];
  console.log(context.toDo);
  
  res.render('toDo',context);
});

app.post('/',function(req,res){
  var context = {};
  var warmEnough = "";
  
  

  if(req.body['New List']){
    req.session.name = req.body.name;
	req.session.toDo = [];
    req.session.curId = 0;
	
  
		// context.city = req.body.city;
		// context.minTemp = req.body.minTemp;  

		context.name = req.session.name;
		context.toDoCount = req.session.toDo.length;   
		context.toDo = req.session.toDo;
		console.log(context.toDo);
		res.render('toDo',context);
	
  }

  //If there is no session, go to the main page.
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }

  if(req.body['Add Item']){	
    
	var apiKey = 'd4024520342080b82f7332a64f624df3';
	
	var city = req.body.city;
	var minTemp = req.body.minTemp;
		
	request('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&APPID=' + apiKey + "&units=metric", function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			console.log(data["main"]["temp"]);
			
			if (data["main"]["temp"] >= minTemp) {
				
				warmEnough = "warm";
			} else {
				warmEnough = "not warm";
			}
			
			req.session.toDo.push({"name":req.body.name, "id":req.session.curId, "city": req.body.city, "temp": data["main"]["temp"], "minTemp": req.body.minTemp, "warmEnough": warmEnough});
			
			
			
			context.city = req.body.city;
			context.minTemp = req.body.minTemp;  
			context.temp = data["main"]["temp"];

			console.log(context.temp);

			context.name = req.session.name;
			context.toDoCount = req.session.toDo.length;   
			context.toDo = req.session.toDo;
			console.log(context.toDo);
			res.render('toDo', context);
			
			
		} else {
			console.log("Error");
		}
	});
	
	req.session.curId++;
  }

  if(req.body['Done']){
	  
	  
    req.session.toDo = req.session.toDo.filter(function(e){
      return e.id != req.body.id;
    });
	
	
  
	context.city = req.body.city;
	context.minTemp = req.body.minTemp;  

	context.name = req.session.name;
	context.toDoCount = req.session.toDo.length;   
	context.toDo = req.session.toDo;
	console.log(context.toDo);
	res.render('toDo',context);
			
  }
  
  /*if(req.body['checkWeather']) {
	
	console.log(req.body);
	
	var apiKey = 'd4024520342080b82f7332a64f624df3';
	
	var city = req.body.city;
	var minTemp = req.body.minTemp;
		
	request('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&APPID=' + apiKey, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			console.log(data.main.temp);
		}
	});
  
  }*/
  
  
  
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
