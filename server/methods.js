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
	console.log("points" + points);		
	Meteor.users.update({_id:userId}, {$inc: {"profile.user_points" : points}});
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
		Reviews.insert(review);

		//Add user points for a new review
		updateUserPoints(userId, "new_review");

		//update review count for the company
		Companies.update({_id:bizId},{$inc: {reviews_count: 1}});
		return bizId;
	}
});