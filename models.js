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

function adminUser(userId){
	var admin = Meteor.users.findOne({"profile.role":"admin"});
	return (userId && admin && userId === admin._id);
}

Companies.allow({
	insert: function(userId, doc){
		return adminUser(userId);
	},
	update: function(userId, docs, fields, modifier){
		return adminUser(userId);
	}
});

Reviews.allow({
	insert: function(userId, review){
		console.log("User: " + userId + " Review " + review.owner);
		return userId && review.owner === userId;
	}
});

