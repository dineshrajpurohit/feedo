/**
	Feedo
	by. Dinesh Purohit
	Server for with important function to insert and update Mongo DB
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

