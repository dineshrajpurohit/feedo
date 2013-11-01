/*******************************************************
 File: Models.js 

- Creating collections for the db to use
- Helper functions for clients to use

 Dinesh Purohit - 2013

********************************************************/

// Companies which will be displayed
Companies = new Meteor.Collection("companies");
Reviews = new Meteor.Collection("reviews");
Shortlists = new Meteor.Collection("shortlists");
Approved = new Meteor.Collection("approved");

function printObjArr(obj){
	for(o in obj){
		console.log(o.toString());
	}
}

