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


// Change this to Iron Routing instead
Meteor.pages({
	"/" : {to: "companies", nav: "home"},
	"/biz/:_id" : { to: "showBusiness", before: setCompany, nav: "home"},
	"/biz/:_id/review" : {to: "writeReview", before: setCompany, nav: "home"},
	"/admin" : {to: "adminDashboard", before: checkIsAdmin, nav: "admin"},
	"/dashboard" : {to: "shortlists", before: authorizeUser, nav: "dashboard"},
	//Static pages
	"/401" : {to: 'unauthorized'},
	"/404" : {to: "notFound"},
	"/about" : {to: "about", nav: "about" },
	"/contact" : {to: "contact", nav: "contact"},
	"/login": {to: "loginPage", nav: "login"},
	"/signup": {to: "signupPage", nav: "signup"},
	"/password": {to: "forgotPasswordPage"},

	// Dashboard routing
	"/dashboard/shortlists" : {to: "shortlists", before: authorizeUser, nav: "dashboard"},
	"/dashboard/approved" : {to: "approved", before: authorizeUser, nav: "approved"},
	"/dashboard/profile" : {to: "profile", before: authorizeUser, nav: "profile"},
	"/dashboard/reviews" : {to: "reviews", before: authorizeUser, nav: "reviews"},
	"/dashboard/statistics" : {to: "statistics", before: authorizeUser, nav: "statistics"},

	"*" : {to: "notFound"},

});