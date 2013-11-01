/**
	Feedo
	by. Dinesh Purohit
	Server for with important function to insert and update Mongo DB
**/

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

//publish all approved
Meteor.publish("approved", function(){
	return Approved.find({});
})

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

