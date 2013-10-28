/**
File: methods.js
 File contains helper methods and methods to insert and update data inside database

 By- Dinesh Purohit

**/


/**
Helper Methods
**/

// Method to add Businesses in the company
//Please validate
function insertBiz(company){
	//server side validation
	//TODO
	Companies.insert(company);
	return true;
}


/**
User Points: 
New Review : 10 points
**/
function updateUserPoints(userId, reason){
	var points = 0;
	switch(reason){
		case "new_review":
			points = 10;
			break;
		default:
			points = 0;
			break;
	}
	return Meteor.users.update({_id:userId}, {$inc: {"profile.user_points" : points}});
}

/**
Server Methods
**/
Meteor.methods({
	//Method to add companies to the databse
	submitBiz: function(biz){
		return insertBiz(biz);
	},
	submitReview: function(review, bizId, userId){
		//TODO: Server side validation
		var review = Reviews.insert(review);

		//Add user points for a new review
		var pointUpdated = updateUserPoints(userId, "new_review");

		//update review count for the company
		var companiesUpdated = Companies.update({_id:bizId},{$inc: {reviews_count: 1}});
		
		if(review && pointUpdated && companiesUpdated)
			return bizId;
		else
			return false;
	},
	addReviewToShortlist: function(userId, reviewId, bizId){
		//add to shortlist db
		if(Shortlists.insert({user_id:userId, company_id: bizId, review_id: reviewId}))
			return true;
		else
			return false;
	}
});









