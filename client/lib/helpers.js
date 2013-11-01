/**

Common helper functions for the clients to use

Dinesh Purohit 2013

**/

/**

If we wish to print the object array - just for debugging

**/

printObjArr = function(obj){
	for(o in obj){
		console.log(o.toString());
	}
}


/**

Animated Success Message Helper

**/

//change this to normal function when you have time
fadeOutAndRemove = function(item){
	$(item).delay(1000).fadeOut("fast", function(){
		$(this).remove();
	})
}

globalSuccessMessage = function(message){
	Session.set("successMessage", message);
	window.setTimeout(function(){
		fadeOutAndRemove(".success-message");	
	}, 900);
	window.setTimeout(function(){
		Session.set("successMessage", false);
	},2000);
}

/**

Animated Error Message Helper

**/
globalErrorMessage = function(message){
	Session.set("errorMessage", message);
	window.setTimeout(function(){
		fadeOutAndRemove(".error-message");	
	}, 900);
	window.setTimeout(function(){
		Session.set("errorMessage", false);
	},2000);
}
