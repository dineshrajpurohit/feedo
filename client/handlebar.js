/**
Meteor Handlebar helpers
**/
Handlebars.registerHelper("formatDate", function(datetime){
	if(moment){
		return moment(datetime).format("MM/DD/YYYY");
	}else{
		return datetime;
	}
});

Handlebars.registerHelper("navClassFor", function(nav, options){
	var n = Meteor.router.nav();
	if(n == "profile" || n == "approved" || n == "reviews" || n == "statistics"){
		Session.set("activateDashboard", "active");
	}else{
		Session.set("activateDashboard", "");
	}
	return Meteor.router.navEquals(nav) ? "active" : "";
});

// creating handlebar helper for count since it will be called by many templates
Handlebars.registerHelper("get_reviews_count", function(biz){
	var latest = Reviews.find({company_id: biz}).fetch();
	return latest.length; 
});

Handlebars.registerHelper("review_user", function(user_id){
	var userInfo = Meteor.users.findOne({_id: user_id},{fields: {username: 1}});
	return userInfo.username;
	//return (userInfo.username != undefined) ? userInfo.username : "";
});

// Handlebar to get user points
Handlebars.registerHelper("getUserPoints", function(user_id){
	var userInfo = Meteor.users.findOne({_id: user_id},{fields: {profile: 1}});
	return userInfo.profile.user_points;
});

