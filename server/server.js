/**
	Feedo
	by. Dinesh Purohit
	Server for with important function to insert and update Mongo DB
**/

/**

Allow Deny rules for client

**/
function adminUser(userId){
	var admin = Meteor.users.findOne({"profile.role":"admin"});
	return (userId && admin && userId === admin._id);
}

Companies.allow({
	insert: function(userId, doc){
		return adminUser(userId);
	},
	update: function(userId, docs, fields, modifier){
		return _.all(docs, function(doc){
			return adminUser(userId);
		});		
	}
});

Reviews.allow({
	insert: function(userId, doc){
		console.log("User: " + userId + " Review " + doc.owner);
		return userId && doc.owner === userId;
	}
});

Shortlists.allow({
	insert: function(userId, doc){
		return userId && doc.user_id === userId;
	},
	remove: function(userId, doc){
		return _.all(docs, function(doc){
			return userId && doc.user_id === userId;
		});
	},
	update: function(userId, docs, fields, modifier){
		return _.all(docs, function(doc){
			return userId && doc.user_id === userId;
		});
	}
});

Shortlists.allow({
	insert: function(userId, doc){
		return userId && doc.user_id === userId;
	},
	remove: function(userId, doc){
		return _.all(docs, function(doc){
			return userId && doc.user_id === userId;
		});
	},
	update: function(userId, docs, fields, modifier){
		return _.all(docs, function(doc){
			return userId && doc.user_id === userId;
		});	
	}
});

/**

Publish users data along with email address

**/

// publish all users
Meteor.publish("allUsers", function(){
	return Meteor.users.find({});
})

//publish all companies
Meteor.publish("companies", function(){
	return Companies.find({});
})

//publish all reviews
Meteor.publish("reviews", function(){
	return Reviews.find({});
})

//publish all shortlists
Meteor.publish("shortlists", function(){
	return Shortlists.find({});
})

//publish all approved (dont know why data do not load when supplied user_id)
Meteor.publish("approved", function(){
	return Approved.find();
})

// Publish the user points log to the users loggedin
Meteor.publish("userpoints", function(){
	return Userpoints.find();
});

/**

When user is forst created

**/
Accounts.onCreateUser(function(option, user){
	var users = Meteor.users.find().fetch();
	// Add user role
	var role = (users.length > 0) ? "user" : "admin";

	// Add initial point to user when they create account 
	// For now we giving 20 points to user when they create a new account
	var points = 20;

	profile = { role: role, user_points: points, created_on: Date.now(), last_login: Date.now(), login_times: 1};
	user.profile = profile;
	return user;
});

