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
Server Methods
**/
Meteor.methods({
	//Method to add companies to the databse
	submitBiz: function(biz){
		return insertBiz(biz);
	},
	submitReview: function(review, bizId){
		//TODO: Server side validation
		console.log("biz0 " + bizId);
		Reviews.insert(review);
		Companies.update({_id:bizId},{$inc: {review_count: 1}});
		return bizId;
	}
});