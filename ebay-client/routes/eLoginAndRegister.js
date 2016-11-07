var ejs = require("ejs");
var mysql = require("./mysql");
var encryption = require('./encryption');
var fs = require('file-system');
var writeFile = require('write');
var append = require('append-stream');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/ebayuser";
var mq_client = require('../rpc/client');

exports.ebayMainPage=function(request,response){

	if(request.session.emailId)
	{
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		response.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		
		var msg_payload = { "emailId": request.session.emailId};
		console.log("In POST Request = UserName:"+ request.session.emailId);
		mq_client.make_request('mainPage_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == 200){
					request.session.firstName=results.data;					
					response.render("ebayMainPage",{firstName:request.session.firstName});
				}
				else {    
					console.log("Failed to load main page");
				}
			}  
		});
		
		
	}
	else
	{
		response.redirect('/');
	}
	

};

exports.ebayRegister = function(request,response){
	var regEmail = request.body.regEmail;
	var password = encryption.saltHashPassword(request.body.password);
	var firstName = request.body.firstName;
	var lastName = request.body.lastName;
	var Dob = request.body.Dob;
	var contactNo = request.body.contactNo;
	var location = request.body.location;
	console.log("location is:"+location);
	console.log("emailid is : "+regEmail+" password is : "+password);
	//var  getUser = "select * from ebayuser.users where emailId='"+regEmail+"'";
	var date=new Date();
	var msg_payload = { "emailId": regEmail, "password": password, "firstName":firstName,"lastName":lastName, "Dob":Dob, "location":location, "contactNo":contactNo,"lastLogin":"null" };
	
	console.log("In POST Request = regEmail:"+ regEmail+" "+password);
	
	mq_client.make_request('signup_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			
			if(results.code == 200){
				console.log("sign up successful");
			}
			else if(results.code == 401){    
				console.log("User already exsists");
				response.send({
					"result":"401"
				});
			}
		}  
	});
};


//Start of the main page functionalities like profile
exports.profile = function(request,response){
	if(request.session.emailId){
		var date = new Date();
		var msg_payload = { "emailId": request.session.emailId };
		console.log("In POST Request = UserName:"+ request.session.emailId);
		mq_client.make_request('profile_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.data!=""){
				if(results.code == "200"){
					response.render("profile",{firstName:results.data[0].firstName,emailId:results.data[0].emailId,lastName:results.data[0].lastName,
								Dob:results.data[0].date,location:results.data[0].location});	
				}
				}
				else {    
					if(results.code=="200"){
					console.log("something went wrong");
					}
				}
			}  
		});
	
	}
	
};
exports.ebayCart = function(request,response){
	
	if(request.session.emailId)
	{
		var msg_payload = { "emailId": request.session.emailId};
		mq_client.make_request('ebayCart_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == 200){
					request.session.firstName=results.data;					
					response.render("ebayCart",{firstName:request.session.firstName});
				}
				else {    
					console.log("Failed to load details");
				}
			}  
		});
		

	}
};


//post Advertisements
exports.postAdvertisement=function(request,response){
	
	var itemName = request.body.itemName;
	var itemDescription=request.body.itemDescription;
    var itemPrice=request.body.itemPrice;
    var quantity=request.body.Quantity;
    var sellDate = Date();
    var type = "normal";
    var prd_image;
    var date = new Date();
    if (itemName=="iphone 6S"){
		prd_image="./images/iPhone7.jpg";
	}
    else if (itemName=="Beats Headphone"){
    	prd_image="./images/Headphone.jpg";
    }
    else if (itemName=="Prom Dress"){
    	prd_image="./images/Dress.jpg";
    }
    else{
    	prd_image="./images/laptop.jpg";
    }
    var msg_payload = { "seller_handle": request.session.seller_handle,"s_username":request.session.emailId, "prd_name": itemName, "prd_desc":itemDescription,"prd_quantity":quantity, "prd_price":itemPrice, "prd_image":prd_image, "type":type};
	mq_client.make_request('postAdvertisement_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			
			if(results.code == 200){
				request.session.sellDate = sellDate;
				response.send({"results":"200"});
			}
			else{
				console.log("could not insert");
			}
		}  
	});
    
};
exports.fetchAdvertisement=function(request,response){
	var date = new Date();
	var msg_payload = { "s_username": request.session.emailId};
	mq_client.make_request('fetchAdvertisement_queue',msg_payload, function(err,results){
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				
				response.send({"result":results.data});
			}
			else {    
				
				console.log("Invalid Login");
			}
		}  
	});
};

exports.myPurchases = function(request,response){
	var date = new Date();
	var msg_payload = { "buyer_uname": request.session.emailId};
	mq_client.make_request('myPurchases_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){				
				response.send({"results1":results.data});
			}
			else { 
				console.log("Invalid Login");
			}
		}  
	});
	
};

exports.mySoldItems = function(request,response){
	var date = new Date();
	var msg_payload = { "s_username":request.session.emailId };
	mq_client.make_request('mySoldItems_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == "200"){
				
				response.send({"results2":results.data});
			}
			else {    
				
				console.log("Invalid Login");
			}
		}  
	});
};


exports.getAdvertisementMainPage = function(request,response){
	var msg_payload = { "emailId":request.session.emailId,"lastLogin":request.session.logdate};
	mq_client.make_request('getAdvertisementMainPage_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				request.session.logdate=results.data;
			}
			else {    
				
				console.log("Failed to perform operation");
			}
		}  
	});
	
	msg_payload = { "emailId":request.session.emailId};
	mq_client.make_request('getAdvertisementMainPage1_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				request.session.results=results.data;
				response.send({"results":request.session.results});
			}
			else {    
				
				console.log("No items are posted on cart");
			}
		}  
	});
};


//add to cart
exports.ebayAddCart = function(request,response){
	var quantity = request.body.quantity;
	var sellerName = request.body.sellerName;
	//console.log("sellername"+sellerName);
	var productname = request.body.productname;
	var prdAvailableQuantity = request.body.prdAvailableQuantity;
	var productDesc = request.body.productDesc;
	var productId = request.body.productid;
	var seller_handle = request.body.seller_handle;
	var prd_price = request.body.prd_price;
	var productBuyQuantity = request.body.productBuyQuantity;
	var date = new Date();
	console.log("***********************************************");
	console.log("product Id is:"+productId);
	
	request.session.totalPrice+= productBuyQuantity*prd_price;
	console.log("product quantity"+productBuyQuantity);
	var msg_payload = { "emailId":request.session.emailId,"cart":request.session.cart,"sellerName": sellerName, "productname": productname, "prdAvailableQuantity":prdAvailableQuantity,"productDesc":productDesc,"productId":productId,"seller_handle":seller_handle,"prd_price":prd_price,"productBuyQuantity":productBuyQuantity,"totalPrice":request.session.totalPrice };
	mq_client.make_request('ebayAddCart_queue',msg_payload, function(err,results){
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("valid Login");
				request.session.cart = results.data;
				response.send({"result":"200"});
			}
			else {    
				
				console.log("Invalid Login");
			}
		}  
	});
	
};

exports.getCartItems=function(request,response){
	var date = new Date();
	console.log("quantity and price"+request.session.totalPrice);
	fs.appendFile('public/logs/userLogs.txt', '\n\tUser: '+request.session.emailId+' cart page was loaded at '+date+'\n',function(err){});
	response.send({"cart":request.session.cart,	"totalPrice":request.session.totalPrice});
};

exports.removeItemFromCart = function(request,response){
    var productname = request.body.productname;
    console.log("productQuantity"+request.body.productBuyQuantity);
    var productBuyQuantity = Number(request.body.productBuyQuantity);
    var prd_price = Number(request.body.prd_price);
    var cost;
    var date = new Date();
    cost=productBuyQuantity*prd_price;
    console.log("total Price "+cost);
    console.log("total Price d"+request.session.totalPrice);
    request.session.totalPrice=request.session.totalPrice-cost ;
    console.log("total Price aafd"+request.session.totalPrice);
    var msg_payload = { "emailId":request.session.emailId,"productname":productname, "cart":request.session.cart,"totalPrice":request.session.totalPrice };
	mq_client.make_request('removeItemFromCart_queue',msg_payload, function(err,results){
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("valid Login");
				request.session.cart=results.data;
				request.session.totalPrice=results.totalPrice;
				response.send({"statusCode":200,"itemsInCart":request.session.cart,"totalPrice":request.session.totalPrice});
			}
			else {    
				
				console.log("Invalid Login");
				res.send({"login":"Fail"});
			}
		}  
	});
};

exports.checkOut=function(request,response){
	response.send({"totalPrice":request.session.totalPrice});
};

exports.showCheckoutPage=function(request,response){
	response.render("checkOut",{firstName:request.session.firstName,"totalPrice": request.session.totalPrice});
};


exports.creditCardvalidation=function(request,response){
	var CreditCardNo = (request.body.CreditCardNo);
	var ExpirationDate = (request.body.ExpirationDate);
	var CvvNumber = (request.body.CvvNumber);
	var date = new Date();
	CreditCardNo=CreditCardNo.toString();
	CvvNumber = CvvNumber.toString();
	var Year="";
	var day="";
	var Month="";
	for(var i=0;i<4;i++){
		Year += ExpirationDate[i];
	}
	for(var j=5;j<7;j++){
	Month+=ExpirationDate[j];		
	}
	
	for(var k=8;k<10;k++){
		day+=ExpirationDate[k];
	}
	
	
	var d = new Date();
	var tday = d.getDate();
	var tmonth=d.getMonth()+1;
	var tyear=d.getYear();
	var msg_payload = { "CreditCardNo":CreditCardNo.length, "CvvNumber":CvvNumber.length, "day":day,"emailId":request.session.emailId };
	mq_client.make_request('creditCardvalidation_queue',msg_payload, function(err,results){
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 401){
				if(results.data=="inValidcard"){
					response.send({"result":"inValidcard"});
				}
				else if(results.data =="inValidcvv"){
					response.send({"result":"inValidcvv"});
				}
				else if(results.data == "inValiddate"){
					response.send({"result":"inValiddate"});
				}
			}
			else if(results.code==200) {    
				response.send({"result":"success"});
			}
		}  
	});
};

exports.eBayShowBidders = function(request,response){
	var sellerName = request.body.sellerName;
	//console.log("sellername"+sellerName);
	var productname = request.body.productname;
	var prdAvailableQuantity = request.body.prdAvailableQuantity;
	var productDesc = request.body.productDesc;
	var productId = request.body.productid;
	var seller_handle = request.body.seller_handle;
	var prd_price = request.body.prd_price;
	var productBuyQuantity = request.body.productBuyQuantity;
	var type="bid";
	
	var msg_payload = { "type":type, "productId":productId };
	mq_client.make_request('eBayShowBidders_queue',msg_payload, function(err,results){
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				response.send({"statusCode":"200","result":results.data});
			}
			else {    
				
				console.log("Invalid Login");
			}
		}  
	});

};

exports.buyProduct=function(request,response){
	var streetAddress=request.body.streetAddress;
  	var place=request.body.place;
  	var state=request.body.state;
  	var country=request.body.country;
  	var postalCode=request.body.postalCode;
  	var address;
  	var countAvailable = 0;
  	var productQuantity,i,k;
  	var flag = 0,flag1=0,flag2=0,updateProduct;
  	var date = new Date();
  	console.log("the country is:"+country);
  	console.log("the available product quantity is : "+request.session.cart[0].prdAvailableQuantity);
  	console.log("buy: "+request.session.cart[0].productId);
  	console.log("length:"+request.session.cart.length);
  	address=streetAddress.concat(", ",place,", ",state,", ",country,", ",postalCode);
	if(streetAddress==null && place==null && state==null && country==null && postalCode==null){
  		//
  		response.send({"result":"failure"});
  			
  	}
  	else{
  
  		
  		console.log("the address is:"+address);
  			var msg_payload = { "cart":request.session.cart,"buyer_uname":request.session.emailId, "address":address,"totalPrice": request.session.totalPrice,"type":"normal"};
  			mq_client.make_request('buyProduct_queue',msg_payload, function(err,results){
  				
  				console.log(results);
  				if(err){
  					throw err;
  				}
  				else 
  				{
  					if(results.code == 200){
  						console.log("valid Login");
  						request.session.cart=[];
  						flag1++;
  					}
  					else {    
  						console.log("Invalid Login");
  					}
  				}  
  			});
  			msg_payload = { "cart": request.session.cart};
  			mq_client.make_request('buyProduct1_queue',msg_payload, function(err,results){
  				
  				console.log(results);
  				if(err){
  					throw err;
  				}
  				else 
  				{
  					if(results.code == 200){
  						console.log("successfully updated data");
  					}
  					else {    
  						
  						console.log("Invalid Login");
  					}
  				}  
  			});
 			request.session.cart=[];
 			fs.appendFile('public/logs/userLogs.txt', '\n\tUser: '+request.session.emailId+' checked out all the items at :'+date+' and the button Id is checkOut\n',function(err){});
 			
 		}
	
 };

 exports.getCheckoutItems = function(request,response){
	response.send({"result":request.session.cart});
};

exports.postAdvertisementBid = function(request,response){
	var itemName = request.body.itemName;
	var itemDescription=request.body.itemDescription;
    var itemPrice=request.body.itemPrice;
    var quantity=request.body.Quantity;
    var sellDate = new Date();
    var bidTime = request.body.bidTime;
    var type ="bid";
    var prd_image;
    function addDays(theDate, days) {
        return new Date(theDate.getTime() + days*24*60*60*1000);
    }
    var newdate = addDays(new Date(),bidTime);
    
    if (itemName=="iphone 6S"){
		prd_image="./images/iPhone7.jpg";
	}
    else if (itemName=="Beats Headphone"){
    	prd_image="./images/Headphone.jpg";
    }
    else if (itemName=="Prom Dress"){
    	prd_image="./images/Dress.jpg";
    }
    else{
    	prd_image="./images/laptop.jpg";
    }
 
    var msg_payload = { "seller_handle": request.session.seller_handle, "s_username": request.session.emailId, "prd_name":itemName,"prd_desc":itemDescription, "prd_quantity":quantity,"prd_price":itemPrice,"prd_image":prd_image,"type":type,"bid_days":bidTime,"date_of_sale":new Date()};
	mq_client.make_request('postAdvertisementBid_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			
			if(results.code == 200){
				response.send({"result":"510"});
			}
			else {    
				
				console.log("Invalid Login");
			}
		}  
	});
};

exports.ebayBidCart = function(request, response){
    var sellerName = request.body.sellerName;
	//console.log("sellername"+sellerName);
	var productname = request.body.productname;
	var prdAvailableQuantity = request.body.prdAvailableQuantity;
	var productDesc = request.body.productDesc;
	var productId = request.body.productid;
	var seller_handle = request.body.seller_handle;
	var prd_price = request.body.prd_price;
	var productBuyQuantity = request.body.productBuyQuantity;
	var biddingPrice = request.body.biddingPrice;
	var quantity = prdAvailableQuantity - productBuyQuantity;
	var type = "bid";
	console.log("product id is:"+productId);
	var msg_payload = {"_id":productId,"emailId":request.session.emailId,"type":type,"biddingPrice":biddingPrice,"prd_price":prd_price,"prd_desc":productDesc,"productId":productId,"prd_name":productname,"prd_quantity":productBuyQuantity,"buyer_uname":request.session.emailId,"s_username":sellerName,"totalPrice":biddingPrice};
	mq_client.make_request('ebayBidCart_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("valid Login");
				
				response.send({"statusCode":200,"timer":"1 day left"});
			}
			else {    
				response.send({
                    "statusCode" : 402,
                    "error" : "Time Up! Sorry You Can't Bid Anymore, better Luck Next Time!"
                });
			}
		}  
	});
};