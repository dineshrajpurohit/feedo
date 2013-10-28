/***************************************************************
Client for Feedo - prototype
created by: Dinesh Purohit

To-DOs: 
- Please change the term companies to businesses
****************************************************************/

/**
Accounts setting

**/

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL' 
});

/**
All Jquery stuff
**/


/**
Meteor Mini-Pages
Please. Please.. PLease replace this by backbone routing
**/
function setCompany(context, page){
	var page_id = context.params._id;
	var company = Companies.findOne(page_id);
	if(company)
		Session.set("company", company);
	
	//This part is not working for some reason
	//else
	//	context.redirect(Meteor.unauthorizedPath());
	}

function authorizeUser(context, page){
	if(!Meteor.userId())
		context.redirect(Meteor.unauthorizedPath());
	}

/** 2:30am === bad_code **/
function checkIsAdmin(context, page){
	if(Meteor.userId()){
	  var user = Meteor.user(Meteor.userId());
	  if(user){
	   if(String(user.profile.role) != "admin")
			context.redirect(Meteor.unauthorizedPath());
		}
	}else
		context.redirect(Meteor.unauthorizedPath());
}

function checkShortlisted(userId, reviewId){
	if(userId && reviewId){
		return Shortlists.findOne({$and: [{review_id: reviewId}, {user_id: userId}]});
	}else
		return false;
}

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
	return Session.equals("nav-link", nav) ? "active" : "";
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


// Change this to Iron Routing instead
Meteor.pages({
	"/" : {to: "companies"},
	"/biz/:_id" : { to: "showBusiness", before: setCompany},
	"/biz/:_id/review" : {to: "writeReview", before: setCompany},
	"/admin" : {to: "adminDashboard", before: checkIsAdmin},
	"/dashboard" : {to: "userDashboard", before: authorizeUser},
	//Static pages
	"/401" : {to: 'unauthorized'},
	"/404" : {to: "notFound"},
	"/about" : {to: "about" },
	"/contact" : {to: "contact"},
	"*" : {to: "notFound"}
});

Template.layout.logged_in = function(){
	return Meteor.userId() ? true : false;
}

Template.layout.isAdmin = function(){
	var userId = Meteor.userId();
	if(userId){
		var user = Meteor.users.findOne({_id:userId});
		if(user)
			return (user.profile.role == "admin") ? true : false
	}
}

Template.companies.helpers({
	companies: function(){
		return Companies.find({}, {sort: {reviews_count: -1}});
	},
	latest_review: function(biz){
			var latest = Reviews.find({company_id: biz},{sort: {time: -1}, limit: 1}).fetch();
			return (latest.length > 0) ? latest[0].review : false;
			//return latest[0].review;
	},
	write_review: function(){
		return Session.equals("write_review", this._id);
	},
	error: function(){
		return Session.get("review_error");
	},
	write_error: function(){
		return	Session.get("write_error");
	}
});

// Helpers for show company .. 
Template.showBusiness.helpers({
	company: function(){
		return Session.get("company");
	},
	reviews: function(biz){
		return Reviews.find({company_id: biz},{sort: {time: -1}});

	},
	shortlisted: function(reviewId){
		var userId = Meteor.userId();
		if(userId && reviewId){
			return checkShortlisted(userId, reviewId);
		}else
			return false;
	}
});

Template.writeReview.helpers({
	company: function(){
		return Session.get("company");
	},
	error_review: function(){
		return Session.get("review_error");
	}
});

// Template helper for Admin Dashboard
Template.adminDashboard.helpers({
	create_biz_form : function(){
		return Session.get("create_biz_form_var");
	},
	biz_form_sucess : function(){
		return Session.get("biz_form_sucess");
	}
});

//Helper for user Dashboard
Template.userDashboard.helpers({
	'userShorlists' : function(){
		var shortlists = Shortlists.find({user_id: Meteor.userId()}).fetch();
		return shortlists.length;
	}
});

function printObjArr(obj){
	for(o in obj){
		console.log(o.toString());
	}
}
// Template event for Admin Dashboard
Template.adminDashboard.events({
	'click #create_biz' : function(event, t){
		Session.set("create_biz_form_var", true);
	},
	'click #cancel_create_biz' : function(events, t){
		Session.set("create_biz_form_var", false);
	},
	'submit' :function(event, t){
		event.preventDefault();

		//form data - Need a better way to do this
		var name = t.find("#bizName").value;
		var category = t.find("#bizCat").value;
		var street = t.find("#bizStreet").value;
		var city = t.find("#bizCity").value;
		var state = t.find("#bizState").value;
		var zipcode = t.find("#bizZip").value;
		var phone = t.find("#bizPhone").value;
		var website = t.find("#bizSite").value;

		var form = {
			name: name,
			category: category,
			address: { street: street, city: city, state: state, zipcode: zipcode},
			phone: phone,
			website: website
		}

		//client side validation of form data 
		// TODO

		Meteor.call("submitBiz", form,function(error,data){
			if(!error && data){
				Session.set("create_biz_form_var", false);
				Session.set("biz_form_sucess", true);				
			}
		});
	},
	'cancel #remove_biz_alert' : function(event, t){
		Session.set("biz_form_sucess", true);
	}
});

/**
 Temporary solution for navigation ** change it to better one
**/
Template.layout.events({
	"click .navs" : function(event, t){
		var page = String(event.target.id);
		Session.set("nav-link", page);
	}
});

Template.companies.events({
	'click .write-review' : function(event, t){
		if(Meteor.userId())
			Session.set("write_review", this._id);
		else {
			Validation.set_error("write_error", "Please Sign in to write a review");
		}
	},
	'click #remove_login_alert' : function(){
		Validation.clear("write_error"); 
	},
	'click #cancel-review' : function(event, t){
		Session.set("write_review", false);
		Validation.clear("review_error")
	},	
});

// Event from show Business template
Template.showBusiness.events({
	'click #checkShortlist': function(event, template){
		var reviewId = template.find("#checkShortlist").value;
		var userId = Meteor.userId();
		if(userId && reviewId){
			var isSlPresent = checkShortlisted(userId, reviewId);		
			if(!isSlPresent){
				Meteor.call("addReviewToShortlist", userId, reviewId, function(error, data){
					if(!error && data){
						//console.log("Added to shortlist");
					}
				});
			}
		}else{
			// change this to create a login model
			console.log("Please log in");
		}
	}
});

Template.writeReview.events({
	'submit' :function(event, t){
		event.preventDefault();	

		var form = {};
		$.each($("#submit-review").serializeArray(), function(){
			form[this.name] = this.value; 
		});

		form["company_id"] = this._id;
		form["user_id"] = Meteor.userId();
		form["time"] = Date.now();

		if(Meteor.userId() && this._id && Validation.valid_review(form["title"], form["review"])){
			Meteor.call("submitReview", form, this._id, Meteor.userId(), function(error, data){
				console.log();
				if(!error && data){
					Meteor.go("/biz/" + data);
				}
			});
		}
	},
	'click #cancel-review' : function(event, t){
		Validation.clear("review_error");
	}
});

Validation = {
	clear: function(err){
		return Session.set(err, undefined);
	},
	set_error: function(errorTag, message){
		return Session.set(errorTag, message);
	},
	valid_review: function(title, review){
		this.clear("review_error");
		if(!Meteor.userId()){
			this.set_error("review_error", "Please log in to write a review");
		}
		else if(title.length == 0){
			this.set_error("review_error", "Title cannot be empty");
		}else if(review.length == 0){
			this.set_error("review_error", "Please write a review");
		}else{
			return true;
		}
	}
};







