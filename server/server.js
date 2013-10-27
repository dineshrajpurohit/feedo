/**
	Feedo
	by. Dinesh Purohit
	Server for with important function to insert and update Mongo DB
**/

Accounts.onCreateUser(function(option, user){
	var users = Meteor.users.find().fetch();
	var role = (users.length > 0) ? "user" : "admin";
	profile = { role: role};
	user.profile = profile;
	return user;
});

