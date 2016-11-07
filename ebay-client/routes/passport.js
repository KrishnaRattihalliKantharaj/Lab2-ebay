/**

 */
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require('./mongo');
var mongoURL = "mongodb://localhost:27017/ebayuser";
var encryption = require('./encryption');
var mq_client = require('../rpc/client');


module.exports = function(passport) {
    passport.use('ebayLogin', new LocalStrategy(function(username, password, done) {
    	password =encryption.saltHashPassword(password);
    	/*mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var loginCollection = mongo.collection('users');*/
	
			process.nextTick(function(){
               /* loginCollection.findOne({emailId:username,password:password}, function(error, user) {

                    if(error) {
                        return done(error);
                    }

                    if(!user) {
                        return done(null, false);
                    }

                    if(user.password != password) {
                        done(null, false);
                    }

                   // connection.close();
                    console.log(user.emailId);
                    done(null, user);
                });*/
				var msg_payload = { "emailId": username, "password": password };
				console.log("In POST Request = UserName:"+ username+" "+password);
				mq_client.make_request('login_queue',msg_payload, function(err,results){
					
					console.log(results);
					if(err){
						throw err;
					}
					else 
					{
						if(results.data!=""){
						if(results.code == 200){
							console.log("valid Login");
							var user=results.data;
							console.log("user"+user[0].emailId);
		                    done(null, user);
							//res.send({"login":"Success"});
						}
						}
						else{
						if(results.code == 200){ 
							console.log("skdfljds");
							return done(null, false);
							
						}
						}
						
					}  
				});
				
            });
       // });
    }));
};


