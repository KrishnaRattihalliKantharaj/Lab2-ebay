var mongo = require('./mongo');
var mongoURL = "mongodb://localhost:27017/ebayuser"
var fs = require('file-system');
function handle_request(msg, callback){
	
	var res = {};
	console.log("skldjfsdk:"+msg.emailId+msg.password);
	/*console.log("In handle request:"+ msg.username);
	
	if(msg.username == "test@email.com" && msg.password =="test"){
		res.code = "200";
		res.value = "Succes Login";
		
	}
	else{
		res.code = "401";
		res.value = "Failed Login";
	}
	callback(null, res);*/


	/*mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.find({"email_id" : msg.emailId, "password" : msg.password}, function(err, user){
			if (user) {
				console.log("hghjgjgj");
				res.code = "200";
				res.data = user;
				callback(null, res);
			} else {
				console.log("hg");
				res.code = "401";
				res.value = "Failed Login";
				callback(null, res);
			}
		});
	});*/
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.findOne({"emailId":msg.emailId}, function(err, user){
			if (user) {
				console.log("User already exsists");
				res.code="401";
				callback(null,res);

			} else {
				mongo.connect(mongoURL, function(){
					console.log('In Register: Connected to mongo at: ' + mongoURL);
					var coll = mongo.collection('users');
					coll.insert({"emailId": msg.emailId, "password": msg.password, "firstName":msg.firstName,"lastName":msg.lastName, "Dob":msg.Dob, "location":msg.location, "contactNo":msg.contactNo,"lastLogin":"null"}, function(err, user){
							console.log("successfuly inserted");
							res.code="200";
							callback(null,res);
					});
				});
			}
		});
	});
	
}
function handle_mainPage(msg, callback){
	
	var res = {};
	//console.log("skldjfsdk:"+msg.username+msg.password);
	/*console.log("In handle request:"+ msg.username);
	
	if(msg.username == "test@email.com" && msg.password =="test"){
		res.code = "200";
		res.value = "Succes Login";
		
	}
	else{
		res.code = "401";
		res.value = "Failed Login";
	}
	callback(null, res);*/


	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.find({"emailId":msg.emailId}).toArray(function(err, results){
			if (results) {
				// This way subsequent requests will know the user is logged in.
				
				res.code="200";
				res.data= results[0].firstName;
				callback(null,res);

			} else {
				res.code="400";
				console.log("returned false");
				callback(null,res);
			}
		});
	});
	
}

function handle_login(msg, callback){
	
	var res = {};
	//console.log("skldjfsdk:"+msg.username+msg.password);
	/*console.log("In handle request:"+ msg.username);
	
	if(msg.username == "test@email.com" && msg.password =="test"){
		res.code = "200";
		res.value = "Succes Login";
		
	}
	else{
		res.code = "401";
		res.value = "Failed Login";
	}
	callback(null, res);*/


	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.find({"emailId":msg.emailId,"password":msg.password}).toArray(function(err, results){
			if (results) {
				// This way subsequent requests will know the user is logged in.
				
				res.code="200";
				res.data= results;
				callback(null,res);

			} else if(!results){
				res.code="401";
				console.log("returned false");
				callback(null,res);
			} else if(results[0].password!=msg.password){
				res.code="401";
				console.log("returned false");
				callback(null,res);
			}
		});
	});
	
}

function handle_profile(msg, callback){
	
	var res = {};
	var date = new Date();
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
		coll.find({"emailId":msg.emailId}).toArray(function(err, results){
			if (results) {
				var Dob=results[0].Dob;
				Dob.toString();
				var date="";
				for(var i=0;i<10;i++){
					date += Dob[i];
				}
				res.code="200";
				res.data=results;
				fs.appendFile('public/logs/userLogs.txt', '\n\tProfile of:'+msg.emailId+' was loaded at: '+date+' and the button Id is: loadProfile\n',function(err){});
				callback(null,res);

			} else {
				res.code="400";
				console.log("something went wrong");
				callback(null,res);
			}
		});
	});

	
}

function handle_ebayCart(msg, callback){
	
	var res = {};
	var date = new Date();
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.find({"emailId":msg.emailId}).toArray(function(err, results){
			if (results) {
				res.data=results[0].firstName;
				res.code="200";
				callback(null,res);
				
			} else {
				console.log("user does not exsits");
			}
		});
	});
}
function handle_postAdvertisement(msg, callback){
	
	var res = {};
	var date = new Date();
	mongo.connect(mongoURL, function(){
		console.log('In Register: Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('product');
		
		coll.insert({"seller_handle": msg.seller_handle,"s_username":msg.s_username, "prd_name":msg.prd_name, "prd_desc":msg.prd_desc,"prd_quantity":msg.prd_quantity, "prd_price":msg.prd_price, "prd_image":msg.prd_image, "type":msg.type }, function(err, user){
			fs.appendFile('public/logs/userLogs.txt', '\n\tUser: '+msg.seller_handle+' Posted: '+msg.itemName+' item of quantity: '+msg.quantity+' for sale at : '+msg.date+' an the button Id is: postBid\n',function(err){});
			res.code="200";
			callback(null,res);
		});
	});
}
function handle_fetchAdvertisement(msg, callback){
	
	var res = {};
	var date = new Date();
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('product');

		coll.find({"s_username":msg.s_username}).toArray(function(err, results){
			if (results) {
				res.code="200";
				res.data=results;
				callback(null,res);
			} else {
				console.log("user does not exsits");
			}
		});
	});
	
	fs.appendFile('public/logs/userLogs.txt', '\n\tLoaded all the Advertisements to: '+msg.s_username+' Main Page at: '+date+'\n',function(err){});
}
function handle_myPurchases(msg, callback){
	
	var res = {};
	var date = new Date();
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('bill');

		coll.find({"buyer_uname":msg.buyer_uname}).toArray(function(err, results){
			if (results) {
				fs.appendFile('public/logs/userLogs.txt', '\n\tUser : '+msg.buyer_uname+'clicked on Show My Purchases in Profile Page at:'+date+' and the button Id is: showMyPurchases',function(err){});
				res.code="200";
				res.data=results;
				callback(null,res);
			} else {
				console.log("No items in your collections");
			}
		});
	});
}
function handle_mySoldItems(msg, callback){
	
	var res = {};
	var date = new Date();
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('bill');

		coll.find({"s_username":msg.s_username}).toArray(function(err, results){
			if (results) {
				fs.appendFile('public/logs/userLogs.txt', '\n\tUser: '+msg.s_username+' clicked on Show Sold Items In Profile Page at:'+date+' and the button Id is: showSoldItems\n',function(err){});
				res.code="200";
				res.data=results;
				callback(null,res);
			} else {
				console.log("No items in your collections");
			}
		});
	});
}
function handle_getAdvertisementMainPage(msg, callback){
	
	var res = {};
	var date = new Date();
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.update({"emailId":msg.emailId},{$set:{"lastLogin":msg.lastLogin}},function(err, results){
			
				mongo.connect(mongoURL, function(){
					console.log('Connected to mongo at: ' + mongoURL);
					var coll = mongo.collection('users');

					coll.find({"emailId":msg.emailId}).toArray(function(err, results){
						if (results) {
							res.code="200";
							res.data=results[0].lastLogin;
							callback(null,res);
						} else {
							console.log("No items in your collections");
						}
					});
				});
		});
	});
}
function handle_getAdvertisementMainPage1(msg, callback){
	
	var res = {};
	var date = new Date();
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('product');

		coll.find({"s_username": {$ne:msg.emailId}}).toArray(function(err, results){
			if (results) {
				res.code="200";
				res.data=results;
				callback(null,res);
			} else {
				console.log("No items are posted on cart");
				
			}
		});
	});
}
function handle_eBayShowBidders(msg, callback){
	
	var res = {};
	var date = new Date();
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('bill');

		coll.find({"type":msg.type, "productId":msg.productId}).toArray(function(err, results){
			if (results) {
				//console.log("result is:"+results[0].prd_quantity);
				res.code="200";
				res.data=results;
				callback(null,res);
			} else {
				console.log("there is no product");
			}
		});
	});
}
function handle_buyProduct(msg, callback){
	
	var res = {};
	var date = new Date();
	for (var i=0;i<msg.cart.length;i++){
			
			console.log("productID *********: "+msg.cart[i].productId);
			var productid=msg.cart[i].productId;
			var productname =msg.cart[i].productname;
			var productBuyQuantity = msg.cart[i].productBuyQuantity;
			var sellerName = msg.cart[i].sellerName;
			mongo.connect(mongoURL, function(){
				console.log('In Register: Connected to mongo at: ' + mongoURL);
				var coll = mongo.collection('bill');
				
				coll.insert({"productId":productid, "prd_name": productname, "prd_quantity":productBuyQuantity,"buyer_uname":msg.buyer_uname, "s_username":sellerName, "address":msg.address,"totalPrice":msg.totalPrice,"type":"normal"}, function(err, results){
					
				console.log("successful11");
				});
			});
			
	}
	res.code="200";
	callback(null,res);
}
function handle_buyProduct1(msg, callback){
	
	var res = {};
	var date = new Date();
	for(var j=0;j<msg.cart.length;j++){
			var updateProductQuantity = msg.cart[j].prdAvailableQuantity - msg.cart[j].productBuyQuantity;
			console.log("updated successfull:  "+updateProductQuantity);
			
			var productId=msg.cart[j].productId;
			var sellerName1 =msg.cart[j].sellerName;
			var prd_name = msg.cart[j].prd_name;
			mongo.connect(mongoURL, function(){
				console.log('Connected to mongo at: ' + mongoURL);
				var coll = mongo.collection('product');

				coll.update({"s_username":sellerName1,"prd_name":prd_name},{$set:{"prd_quantity":updateProductQuantity}}, function(err, user){
					console.log("successfully updated data to the table");
				});
			});
	}
	res.code="200";
	callback(null,res);
}
function handle_postAdvertisementBid(msg, callback){
	
	var res = {};
	var date = new Date();
	mongo.connect(mongoURL, function(){
		console.log('In Register: Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('product');
		
		coll.insert({"seller_handle": msg.seller_handle, "s_username": msg.s_username, "prd_name":msg.prd_name,"prd_desc":msg.prd_desc, "prd_quantity":msg.prd_quantity,"prd_price":msg.prd_price,"prd_image":msg.prd_image,"type":msg.type,"bid_days":msg.bid_days,"date_of_sale":new Date(),"available_till":msg.available_till} , function(err, user){
			console.log("item inserted");
			console.log("item inserteddsfsadfasdfsfsdfdsfsdfs");
			fs.appendFile('public/logs/userLogs.txt', '\n\tuser: '+msg.emailId+' Posted: '+msg.prd_name+' item for Bid ('+msg.prd_quantity+' items) for '+msg.bid_days+' days an the button Id is bidItem\n',function(err){});
			res.code="200";
			callback(null,res);
		});
	});
}
function handle_ebayBidCart(msg, callback){
	
	var res = {};
	var date = new Date();
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('product');

		coll.find({"_id":msg._id,"available_till":{$gt:new Date()}},function(err, results){
			if (results) {
				mongo.connect(mongoURL, function(){
					console.log('Connected to mongo at: ' + mongoURL);
					var coll = mongo.collection('product');

					coll.find({"s_username": msg.s_username,"_id":msg._id,"type":msg.type,"prd_price":{$lt:msg.biddingPrice}}, function(err, result){
						if (result) {
							mongo.connect(mongoURL, function(){
								console.log('In Register: Connected to mongo at: ' + mongoURL);
								var coll = mongo.collection('product');
								
								coll.update({"_id":msg._id,"type":"bid","prd_price":msg.prd_price,"prd_desc":msg.productDesc},{$set:{"prd_price":msg.biddingPrice}}, function(err, user){
			 						console.log("successfully updated data to the table1234");
			 					});
							});
							mongo.connect(mongoURL, function(){
								console.log('In Register: Connected to mongo at: ' + mongoURL);
								var coll = mongo.collection('bill');
								
								coll.insert({"productId":msg.productId,"prd_name":msg.prd_name,"prd_quantity":msg.prd_quantity,"buyer_uname":msg.emailId,"s_username":msg.s_username,"type":msg.type,"totalPrice":msg.biddingPrice}, function(err, user){
									console.log("successfully inserted data to the table");
								});
							});
							

						} else {
							console.log("something went worong");
						}
						
						 res.code="200";
						 callback(null,res);
					});
					
				});
				
			} else {
				 response.send({
                     "statusCode" : 402,
                     "error" : "Time Up! Sorry You Can't Bid Anymore, better Luck Next Time!"
                 });
				 res.code="402";
				 callback(null,res);
			}
		});
	});
}
function handle_creditCardvalidation(msg, callback){
	
	var res = {};
	var date = new Date();
	var d = new Date();
	var tday = d.getDate();
	var tmonth=d.getMonth()+1;
	var tyear=d.getYear();
	if (msg.CreditCardNo == "16" && msg.CvvNumber == "3" && msg.day>=tday ){
		res.code="200";
		callback(null,res);
		fs.appendFile('public/logs/userLogs.txt', '\n\tUser: '+msg.emailId+' validated credit cart info at '+date+'\n',function(err){});
	}
	else if (msg.CreditCardNo != "16" ){
		res.code="401";
		res.data="inValidcard";
		callback(null,res);
	}
	else if (msg.CvvNumber != "3" ){
		res.code="401";
		res.data="inValidcvv";
		callback(null,res);
	}
	else{
		res.code="401";
		res.data="inValiddate";
		callback(null,res);
	}
	
}
function handle_ebayAddCart(msg, callback){
	
	var res = {};
	var date = new Date();
	msg.cart.push({	"sellerName":msg.sellerName,
		"productname":msg.productname,
		"prdAvailableQuantity":msg.prdAvailableQuantity,
		"productDesc":msg.productDesc,
		"productId":msg.productId,
		"seller_handle":msg.seller_handle,
		"prd_price":msg.prd_price,
		"productBuyQuantity":msg.productBuyQuantity,
		"totalPrice":msg.totalPrice
	});
		fs.appendFile('public/logs/userLogs.txt', '\n\tUser: '+msg.emailId+' added item: '+msg.productname+' ('+msg.productBuyQuantity+' quantity) to cart at time: '+date+' and the button Id is addToCart\n',function(err){});
		res.code="200";
		res.data=msg.cart;
		callback(null,res);
}
function handle_removeItemFromCart(msg, callback){
	
	var res = {};
	var date = new Date();
	var i = 0;
    for (i = msg.cart.length - 1; i >= 0; i--) {
        if (msg.cart[i].productname == msg.productname) {
            msg.cart.splice(i, 1);
           
            res.code="200";
            res.data=msg.cart;
            res.totalPrice = msg.totalPrice
            
        }
    }
    fs.appendFile('public/logs/userLogs.txt', '\n\tUser: '+msg.emailId+' removed '+msg.productname+'item at '+date+' and the button Id is cartRemove\n',function(err){});
    callback(null,res);
    
}



exports.handle_removeItemFromCart = handle_removeItemFromCart;
exports.handle_ebayAddCart = handle_ebayAddCart;
exports.handle_creditCardvalidation = handle_creditCardvalidation;
exports.handle_ebayBidCart = handle_ebayBidCart;
exports.handle_postAdvertisementBid = handle_postAdvertisementBid;
exports.handle_buyProduct1 = handle_buyProduct1;
exports.handle_buyProduct = handle_buyProduct;
exports.handle_eBayShowBidders = handle_eBayShowBidders;
exports.handle_getAdvertisementMainPage1 = handle_getAdvertisementMainPage1;
exports.handle_getAdvertisementMainPage = handle_getAdvertisementMainPage;
exports.handle_mySoldItems =handle_mySoldItems;
exports.handle_myPurchases = handle_myPurchases;
exports.handle_fetchAdvertisement = handle_fetchAdvertisement;
exports.handle_postAdvertisement = handle_postAdvertisement;
exports.handle_ebayCart = handle_ebayCart;
exports.handle_profile = handle_profile;
exports.handle_login = handle_login;
exports.handle_mainPage = handle_mainPage;
exports.handle_request = handle_request;