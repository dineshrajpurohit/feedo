/*************************

environment.js

Account setting and Subscirbe calls,

by- Dinesh Purohit 2013

*************************/


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
