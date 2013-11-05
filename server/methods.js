/**
File: methods.js
 File contains helper methods and methods to insert and update data inside database

 By- Dinesh Purohit

**/


/**
Helper Methods
**/
// Get client IP
function getClientIp(){
	var app = typeof WebApp != 'undefined' ? WebApp.connectHandlers : __meteor_bootstrap__.app;
	app.use(function(req, res, next) {
	  console.log(req.headers);
	  return req.headers["host"];	
	  });
}

// Method to add Businesses in the company
//Please validate
function insertBiz(company){
	//server side validation
	//TODO
	Companies.insert(company);
	return true;
}

// Function to add userpoints
function updatePointsLog(userId, status, points,message){
		return Userpoints.insert({user_id: userId, status: status, points: points, message: message, added_on: Date.now()});
	}


/**
User Points: 
New Review : 10 points
**/
function updateUserPoints(userId, reason){
	var points = 0, status="", message="";
	switch(reason){
		case "new_review":
			points = 20;
			status = "+";
			message = "- for creating a new review";
			break;
		case "approve_review":
			points = 10;
			status = "+";
			message = "- for approving a review";
			break;
		case "review_approved":
			points = 20;
			status = "+";
			message = "- your review got approved";
			break;		
		default:
			points = 0;
			break;
	}
	var updateLog = updatePointsLog(userId, status, points, message);
	var updatePoints = Meteor.users.update({_id:userId}, {$inc: {"profile.user_points" : points}});
	return updateLog && updatePoints;
}

/**
Server Methods
**/
Meteor.methods({
	//Method to add companies to the databse
	submitBiz: function(biz){
		return insertBiz(biz);
	},
	submitReview: function(review, bizId){
		//TODO: Server side validation		
		var review = Reviews.insert(review);

		//Add user points for a new review
		var pointUpdated = updateUserPoints(this.userId, "new_review");

		//update review count for the company
		var companiesUpdated = Companies.update({_id:bizId},{$inc: {reviews_count: 1}});
		
		if(review && pointUpdated && companiesUpdated)
			return bizId;
		else
			return false;
		
	},
	addReviewToShortlist: function(reviewId, bizId){
		//add to shortlist db
		if(Shortlists.insert({user_id:this.userId, company_id: bizId, review_id: reviewId}))
			return true;
		else
			return false;
	},
	updateUserLastLogin: function(){
		return Meteor.users.update({_id: this.userId}, {$set: {"profile.last_login": Date.now()}});
	},
	deleteShorlist: function(sid){
		return Shortlists.remove({_id:sid});
	},
	addApprovedlist: function(review){
		//add time to approved collection
		review.approved_time = Date.now();

		// Whose review is this
		var reviewer = Reviews.findOne({_id: review.review_id}, {fields: {user_id: 1}});
		
		//give points to user
		var pointUpdated = updateUserPoints(this.userId, "approve_review");
		var logUpdated = updateUserPoints(reviewer.user_id, "review_approved");
		var addApprove =  Approved.insert(review);
		if(pointUpdated && addApprove){
			Shortlists.remove({_id:review._id})
			return true;
		}
		else
			return false;
	},
	updateUserData: function(name, location, gravatar, website, about){
		return Meteor.users.update({_id:this.userId}, 
				{$set: {"profile.real_name": name,
						"profile.location" : location,
						"profile.gravatar_email": gravatar,
				    	"profile.website": website,
				    	"profile.about_me": about
				}});
	},
	addCreateuserPoints: function(){
		return Userpoints.insert({user_id: this.userId, status: "+", points: 20, message: "- for creating a new account", added_on: Date.now()});
	}
});









