/***************************************************************
Client for Feedo - prototype
created by: Dinesh Purohit

To-DOs: 

****************************************************************/

/**
Accounts setting

**/

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL' 
});

/**
Subscribe to collections
**/
Meteor.subscribe("allUsers");
Meteor.subscribe("companies");
Meteor.subscribe("reviews");
Meteor.subscribe("shortlists");
Meteor.subscribe("approved");

/**
All Jquery stuff
**/

/**

General helper functions

**/



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

function printObjArr(obj){
	for(o in obj){
		console.log(o.toString());
	}
}


function fadeOutAndRemove(item){
	$(item).delay(1000).fadeOut("fast", function(){
		$(this).remove();
	})
}

/**

Helpers and events for Navigation template

**/

Template.navigation.logged_in = function(){
	return Meteor.userId() ? true : false;
}

Template.navigation.isAdmin = function(){
	var userId = Meteor.userId();
	if(userId){
		var user = Meteor.users.findOne({_id:userId});
		if(user)
			return (user.profile.role == "admin") ? true : false
	}
}

Template.navigation.dashboardActive = function(){
	return Session.get("activateDashboard");
}

Template.navigation.events({
	'click #logOutButton' : function(events, template){
		if(Meteor.userId()){
			Meteor.call("updateUserLastLogin", Meteor.userId(), function(error, result){
				if(!error && result){
					Meteor.logout();
					Meteor.go("/");
				}
			});
		}
	}
});
/**

Helpers and Event for Companies template

**/

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

/**

Helpers and events for Show Business Template

**/

function checkShortlisted(userId, reviewId, bizId){
	if(userId && reviewId && bizId){
		return Shortlists.findOne({$and: [{review_id: reviewId}, {user_id: userId}]});
	}else
		return false;
}

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
		var bizId = (Session.get("company"))._id;
		if(userId && reviewId && bizId){
			return checkShortlisted(userId, reviewId, bizId);
		}else
			return false;
	},
	userGravatar: function(userId){
		var email = Meteor.users.findOne({_id:userId}).emails[0].address;
		var hash = CryptoJS.MD5(email).toString();
		return hash;
	}

});

// Event from show Business template
Template.showBusiness.events({
	'click .checkShortlist': function(event, template){
		var reviewId = this._id;
		var reviewBy = this.user_id;
		var userId = Meteor.userId();
		var bizId = this.company_id;
		if(userId && reviewId && bizId){
			// if user is same as reviewer
			if(userId == reviewBy){
				var content = "<div class='message-error'>You cannot shortlist your own review</div>";
				$(content).hide().appendTo("#" + reviewId).fadeIn(500);
				fadeOutAndRemove(".message-error");			
				return false;
			}

			var isSlPresent = checkShortlisted(userId, reviewId, bizId);		
			if(!isSlPresent){
				Meteor.call("addReviewToShortlist", userId, reviewId, bizId, function(error, data){
					if(!error && data){
						//console.log("Added to shortlist");
					}
				});
			}
		}else{
			// change this to create a login modal
			var loginTemplate = Meteor.render(function(){
				return Template.loginModal();
			});
			if(loginTemplate){
				$("#login").html(loginTemplate);
				$("#signup-form").hide();
				$("#askSignIn").hide();
				$("#loginModal").modal();
			}
		}
	},
	'mouseover .whatIsShortlist' : function(event, template){
		$(".whatIsShortlist").popover({trigger: "hover",title: "Shortlisting explained!!", content: "If you wish togo through a review later you can shortlist it now. Once you finished shortlisting all the desired reviews you can go to the dashboard and accept any comment you like.", html: true});
	}

});


/**

Helpers and Events for Write Review template

**/

Template.writeReview.helpers({
	company: function(){
		return Session.get("company");
	},
	error_review: function(){
		return Session.get("review_error");
	}
});

Template.writeReview.events({
	'submit' :function(event, template){
		event.preventDefault();	

		var title = template.find("#review-title").value;
		var review = template.find("#review-review").value;
		var userId = Meteor.userId();

		if(title && review){
			if(userId && this._id){
				var form = {title: title, review: review, company_id: this._id, user_id: userId, time: Date.now()};
				Meteor.call("submitReview", form, this._id, Meteor.userId(), function(error, data){
					if(!error && data){
						Meteor.go("/biz/" + data);
					}
				});
			}else{
				// change this to create a login modal
				var loginTemplate = Meteor.render(function(){
					return Template.loginModal();
				});
				if(loginTemplate){
					$("#login").html(loginTemplate);
					$("#signup-form").hide();
					$("#askSignIn").hide();
					$("#loginModal").modal();
				}
			}
		}else{
			//error messages
			console.log("Validation");
		}
	},
	'click #cancel-review' : function(event, t){
		Validation.clear("review_error");
	}
});

/**

Helpers and events for Admin Dashboard Template

**/

// Template helper for Admin Dashboard
Template.adminDashboard.helpers({
	create_biz_form : function(){
		return Session.get("create_biz_form_var");
	},
	biz_form_sucess : function(){
		return Session.get("biz_form_sucess");
	}
});

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

Helper and events for login Modal template

**/

Template.loginModal.events({
	'click #modalSignupButton' : function(event, template){
		$("#login-form").hide();
		$("#signup-form").show();
		$("#askSignIn").show();
		$("#askSignUp").hide();
	},
	'click #modalSigninButton' : function(event, template){
		$("#signup-form").hide();
		$("#login-form").show();
		$("#askSignIn").hide();
		$("#askSignUp").show();
	}
});


/**

Login page helpers

**/
Template.loginPage.helpers({
	loginError : function(){
		return Session.get("loginError");
	}
});

/**

Login events

**/
var userValidation = function(error, reason){
	switch(error){
		//user trying to submit a blank username
		case 400:
			Session.set("loginError", "Username/Email/Password cannot be empty");
			break;
		// my custom errors
		case 702:
			Session.set("loginError", "Password should be atleast 6 characters long");
			break;
		case 700:
			Session.set("loginError", "Username should be atleast 4 characters long");
			break;
		case 701:
			Session.set("loginError", "Email is of invalid format");	
			break;
		case 703: 
			Session.set("loginError", "Password and Confirm does not match");
			break;	
		case 403:
			Session.set("loginError", reason);
			break;
	}
}

Template.signInTemplate.events({
	'click #loginButton' : function(events, template){
		event.preventDefault();
		if(!Meteor.userId()){
			var usernameEmail = template.find("#loginUsernameEmail").value;
			var password = template.find("#loginPassword").value;

			Meteor.loginWithPassword(usernameEmail, password, function(error){
				if(error){
					userValidation(error.error, error.reason);
					$("#loginPassword").val("");
				}else{
					// increment user login times
					$("#loginModal").modal("hide");
					Meteor.go("/");
				}
			});
		}
	}
});

/**

Signup template helpers and events

**/

Template.signupPage.helpers({
	loginError : function(){
		return Session.get("loginError");
	}
});

Template.signUpTemplate.events({
	'click #signUpButton' : function(events, template){
		event.preventDefault();
		if(!Meteor.userId()){
			var options = {};
			options.username = template.find("#signupUsername").value;
			options.email = template.find("#signupEmail").value;
			options.password = template.find("#signupPassword").value;
			var confirm = template.find("#password_confirmation").value;
			//validations
			if(options.username.length < 5) {
				userValidation(700, "");
				return false;
			}
			if(options.email == "" || options.email.indexOf("@") === -1){
				userValidation(701, "");
				return false;
			}
			if(options.password <6){
				userValidation(702, "");
				return false;
			}
			if(options.password !== confirm){
				userValidation(703, "");
				return false;
			}

			Accounts.createUser(options, function(error){
				if(error){
					userValidation(error.error, error.reason);
				}else{
					$("#loginModal").modal("hide");

					// welcome modal
					var welcomeTemplate = Meteor.render(function(){
						return Template.welcome();
					});
					if(welcomeTemplate){
						$("#others").html(welcomeTemplate);
						window.setTimeout(function(){
							$("#welcomeModal").modal("show");
						}, 500);
						
					}
				}
			});
		}
	}
});


/**

Forgot Password Template

**/

Template.forgotPasswordPage.helpers({
	loginError : function(){
		return Session.get("loginError");
	},
		successMessage : function(){
		return Session.get("successMessage");
	}
});

Template.forgotPasswordPage.events({
	'click #forgotPassButton' : function(events, template){
		event.preventDefault();
		var email = template.find("#forgotEmail").value;
		if(email == "" || email.indexOf("@") === -1){
				userValidation(701, "");
				return false;
			}
		Accounts.forgotPassword({email: email}, function(error){
			if(error){
				userValidation(error.error, error.reason);
			}else{
				Session.set("loginError", false);
				Session.set("successMessage", "Link to reset the password is sent to the email " + email);
			}
		});
	}
});


/**

Change Password Template

**/
Template.changePasswordPage.helpers({
	loginError : function(){
		return Session.get("loginError");
	},
		successMessage : function(){
		return Session.get("successMessage");
	}
});

Template.changePasswordPage.events({
	'click #changePassButton' : function(events, template){
		events.preventDefault();
		var oldPass = template.find("#oldPassword").value;
		var newPass = template.find("#newPassword").value;
		if(newPass.length<6){
			userValidation(702, "");
			return false;
		}
		Accounts.changePassword(oldPass, newPass, function(error){
			if(error){
				userValidation(error.error, error.reason);
			}else{
				Session.set("loginError", false);
				Session.set("successMessage", "Password Changed Successfully");
			}
		});
	}
});


/**

Helpers and events for User Dashboard template

**/

/**

Template events and helpers for shortlist

**/

function getShortlistCompanies(sl){
	// There is a better way to do this
	var shortlists = [];
	var shortlist = {}
	var index = null;
	for(var i=0; i< sl.length; i++){
		var sid = sl[i]["_id"];
		var c = sl[i]["company_id"];
		var r = sl[i]["review_id"];
		var revs = Reviews.findOne({_id:r})
		var cname = Companies.findOne({_id: c}).name;
		var rtitle = revs.title;
		var rbody = revs.review;
		var ruser = Meteor.users.findOne({_id:revs.user_id});
		shortlist = {_id:sid, biz: cname, title: rtitle, review: rbody, reviewer: ruser.username}
		shortlists.push(shortlist);	
		// var result = $.grep(companies, function(biz, loc){ console.; return biz.cid == c}
	}
	return shortlists;
}

//Helper for user Dashboard
Template.shortlists.helpers({
	'userShortlists' : function(){
		var shortlists = Shortlists.find({user_id: Meteor.userId()}).fetch();
		return shortlists.length;
	},
	'shortlists' : function(){
		var shortlists = Shortlists.find({user_id: Meteor.userId()}).fetch();
		// find a better way to do this
		var s = getShortlistCompanies(shortlists);
		var col1 =[], col2 = [];
		for(var i=0; i<(s.length); i++){
			if(i > (s.length)/2){
				col2.push(s[i]);
			}else
				col1.push(s[i])
		}
		return [col1, col2];
	},
	shortlistSuccess: function(){
		return Session.get("shortlistSuccess");
	},
	shortlistError: function(){
		return Session.get("shortlistError");
	},
	shortlistMessage: function(){
		return Session.get("shortlistMessage");
	}
});

Template.shortlists.events({
	'mouseover .column': function(events, template){
		$( ".column" ).sortable({
      		connectWith: ".column"
    	});
	},
	'click .approveButton' : function(events, template){
		var review = Shortlists.findOne({_id:this._id});
		if(review.user_id == Meteor.userId()){

			//check if the review was already approved - if so display error
			var findReview = Approved.findOne({review_id:review.review_id});
			if(findReview){
				Session.set("shortlistError", true);
				Session.set("shortlistMessage", "This review has already been approved by you. You can delete it from your shortlists");	
				window.setTimeout(function(){
					fadeOutAndRemove(".shortlist-error");	
				}, 700);
				window.setTimeout(function(){
					Session.set("shortlistError", false);
					Session.set("shortlistMessage", "");
				},2000);
				return false;
			}

			Meteor.call("addApprovedlist",review,Meteor.userId(), function(error, result){
				if(!error && result){
					Session.set("shortlistSuccess", true);
					Session.set("shortlistMessage", "Review has been approved. You got 10 points");
					window.setTimeout(function(){
						fadeOutAndRemove(".shortlist-success");	
					}, 700);
					window.setTimeout(function(){
						Session.set("shortlistSuccess", false);
					},2000);

				}else{
					//Will never happen - just to be on safer side
					Session.set("shortlistError", true);
					Session.set("shortlistMessage", "Something went wrong in approving the review. Please try again.");	
					window.setTimeout(function(){
						fadeOutAndRemove(".shortlist-error");	
					}, 700);
					window.setTimeout(function(){
						Session.set("shortlistError", false);
						Session.set("shortlistMessage", "");
					},2000);
				}
			});			
		}

	},
	'click .deleteButton': function(events, template){
		// check you have the authority to delete this shortlist
		var review = Shortlists.findOne({_id:this._id});
		if(review.user_id == Meteor.userId()){
			Meteor.call("deleteShorlist",this._id, function(error, result){
				if(!error && result){
					Session.set("shortlistSuccess", true);
					Session.set("shortlistMessage", "Review deleted succesfully from your shorlists");
					window.setTimeout(function(){
						fadeOutAndRemove(".shortlist-error");	
					}, 700);
					window.setTimeout(function(){
						Session.set("shortlistSuccess", false);
						Session.set("shortlistMessage", "");
					},2000);

				}else{
					//Will never happen - just to be on safer side
					Session.set("shortlistError", true);	
					Session.set("shortlistMessage", "Something went wrong in deleting the review from shortlist. Please try again.");
					window.setTimeout(function(){
						fadeOutAndRemove(".shortlist-error");	
					}, 700);
					window.setTimeout(function(){
						Session.set("shortlistError", false);
						Session.set("shortlistMessage", "");
					},2000);
				}
			});
		}
	}
});

/**

Halpers and events for user Approved board
**/

//Helper for user Dashboard
function getApprovedReviews(al){
	// There is a better way to do this
	var aprrovedList = [];
	var approved = {}
	for(var i=0; i< sl.length; i++){
		var sid = al[i]["_id"];
		var c = al[i]["company_id"];
		var r = al[i]["review_id"];
		var approved_time = al[i]["approved_time"]
		var revs = Reviews.findOne({_id:r})
		var cname = Companies.findOne({_id: c}).name;
		var rtitle = revs.title;
		var rbody = revs.review;
		var ruser = Meteor.users.findOne({_id:revs.user_id});
		approved = {_id:sid, biz: cname, title: rtitle, review: rbody, reviewer: ruser.username, approved_time: approved_time}
		aprrovedList.push(approved);	
	}
	return aprrovedList;
}

Template.approved.helpers({
	'userApprovedlists' : function(){
		var approvedList = Approved.find({user_id: Meteor.userId()}).fetch();
		return approvedList.length;
	},
	'approvedlist' : function(){
		var approved = Approved.find({user_id: Meteor.userId()}).fetch();
		// find a better way to do this
		return getShortlistCompanies(approved);
	}	
});


/**

Helpers and events for user reviews

**/
Template.reviews.helpers({
	totalUserReviews: function(){
		var reviews = Reviews.find({user_id: Meteor.userId()}).fetch();
		return reviews.length
	},
	userReviews: function(){
		var reviews = Reviews.find({user_id: Meteor.userId()}).fetch();
		for(var r=0; r<(reviews.length);r++){
			var company = Companies.findOne({_id:reviews[r]["company_id"]}).name;
			reviews[r].biz = company
		}
		return reviews.reverse();
	}
});

/**

Helpers and events for private User profile

**/
Template.profile.helpers({
	profileData: function(){
		if(Meteor.userId()){
			return Meteor.user();
		}
	}
});

/**

Helpers and events for public User profile

**/
Template.userProfile.rendered = function(){
	$("#statistics-tabs a:first").tab('show');
	$("#statistics-tabs a").click(function(e){
		e.preventDefault();
		$(this).tab("show");
	});
}

Template.userProfile.helpers({
	profileData: function(){
		return Session.get("userProfile");
	},
	userReviews: function(){
		var user = Session.get("userProfile");
		var userId = user._id;
		if(userId){
			return Reviews.find({user_id:userId},{limit: 10, sort: {time: -1}}).fetch();
		}
	},
	userGravatar: function(){
		var user = Session.get("userProfile")
		Meteor.call("md5Data", user._id, function(error, result){
			if(!error){
				//console.log(result + error);
				Session.set("gravatar", result);
			}
		});
		return Session.get("gravatar");
	}
});




