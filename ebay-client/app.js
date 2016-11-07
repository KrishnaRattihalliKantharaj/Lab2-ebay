
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , url = require('url')
  , path = require('path')
//Importing the 'client-sessions' module
  ,fs = require('fs')
  , session = require('client-sessions');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongo = require('./routes/mongo');
require('./routes/passport')(passport);
var expressSessions = require("express-session");
var mongoStore = require("connect-mongo/es5")(expressSessions);

var routes = require('./routes/index');
var mongoSessionURL = "mongodb://localhost:27017/ebayuser";


var eLoginAndRegister=require('./routes/eLoginAndRegister');
var app = express();

//all environments
//configure the sessions with our application


app.use(expressSessions({
	  secret: "CMPE273_test_string",
	  resave: false,
	  saveUninitialized: false,
	  duration: 30 * 60 * 1000,
	  activeDuration: 5 * 60 * 1000,
	  store: new mongoStore({
	    url: mongoSessionURL
	  })
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', routes.index);
app.get('/users', user.list);
//app.post('/ebayLogin',eLoginAndRegister.ebayValidateLogin);
app.post('/getAdvertisementMainPage',eLoginAndRegister.getAdvertisementMainPage);
app.post('/ebayRegistration',eLoginAndRegister.ebayRegister);
app.post('/postAdvertisement',eLoginAndRegister.postAdvertisement);
app.post('/fetchAdvertisement',eLoginAndRegister.fetchAdvertisement);
app.post('/ebayAddCart',eLoginAndRegister.ebayAddCart);
app.post('/getCartItems',eLoginAndRegister.getCartItems);
app.post('/checkOut',eLoginAndRegister.checkOut);
app.post('/removeItemFromCart',eLoginAndRegister.removeItemFromCart);
app.post('/creditCardvalidation',eLoginAndRegister.creditCardvalidation);
app.post('/buyProduct',eLoginAndRegister.buyProduct);
app.post('/myPurchases',eLoginAndRegister.myPurchases);
app.post('/mySoldItems',eLoginAndRegister.mySoldItems);
app.post('/getCheckoutItems',eLoginAndRegister.getCheckoutItems);
app.post('/postAdvertisementBid',eLoginAndRegister.postAdvertisementBid);
app.post('/ebayBidCart',eLoginAndRegister.ebayBidCart);
app.post('/eBayShowBidders',eLoginAndRegister.eBayShowBidders);

app.get('/showCheckoutPage',eLoginAndRegister.showCheckoutPage);
app.get('/ebayCart',eLoginAndRegister.ebayCart);
app.get('/ebay',eLoginAndRegister.ebayMainPage);
//app.get('/logout',eLoginAndRegister.logout);
app.get('/profile',eLoginAndRegister.profile);



app.get('/logout', function(req,res) {
	  req.session.destroy();
	  res.redirect('/');
	});

	app.post('/ebayLogin', function(req, res, next) {
	  passport.authenticate('ebayLogin', function(err, user, info) {
	    if(err) {
	      return next(err);
	    }

	    if(!user) {
	    	console.log(user.username);
	    	console.log("session initilizedsdfsd");
	    	return res.send({"result":"404"});
	   
	    }

	    req.logIn(user, {session:false}, function(err) {
	      if(err) {
	        return next(err);
	      }

	      
	      req.session.seller_handle = user[0]._id;
			req.session.emailId = user[0].emailId;
			req.session.firstName="";
			req.session.cart=[];
			req.session.totalPrice=0;
			//request.session.datelogin=logDate;
			req.session.logdate=new Date();
	      console.log("session initilized");
	      return res.send({"result":"200"});
	      //fs.appendFile('public/logs/userLogs.txt', '\nDate of Log :\n '+logDate+'\n\tLogin Module:\n\tUser:'+emailId+' Loged In and the buttonId is: ebayLogin\n',function(err){});
	    });
	  })(req, res, next);
	});



	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
	  var err = new Error('Not Found');
	  err.status = 404;
	  next(err);
	});

	// error handlers

	// development error handler
	// will print stacktrace
	if (app.get('env') === 'development') {
	  app.use(function(err, req, res, next) {
	    res.status(err.status || 500);
	    res.render('error', {
	      message: err.message,
	      error: err
	    });
	  });
	}

	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
	  res.status(err.status || 500);
	  res.render('error', {
	    message: err.message,
	    error: {}
	  });
	});


	//connect to the mongo collection session and then createServer
	mongo.connect(mongoSessionURL, function(){
		console.log('Connected to mongo at: ' +mongoSessionURL);
		http.createServer(app).listen(app.get('port'), function(){
			console.log('Express server listening on port ' + app.get('port'));
		});  
	});