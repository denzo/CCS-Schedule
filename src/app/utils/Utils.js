App.Utils = Em.Object.extend();

App.Utils.reopenClass({

	/**
	* Username comes from the server like so '52524;#Zhan, Benjamin'
	* this method will exclude the id so it can be displayed like so 'Zhan, Benjamin'
	*/
	getUserName: function(user) {
		return user ? user.substr(user.lastIndexOf('#') + 1) : null;
	},
	
	getUserId: function(user) {
		return user ? user.substr(0, user.lastIndexOf(';#')) : null;
	},
	
	getUserFirstName: function(user) {
		return user ? App.Utils.getUserName(user).split(', ')[1] : null;
	},
	
	getHumanUserName: function(user) {
		var splitUserName = App.Utils.getUserName(user).split(', ');
		return splitUserName ? (splitUserName[1] + ' ' + splitUserName[0]) : null;
	},
	
	/**
	* This method will create a required user string to store
	* correctly on the server.
	* 
	* @param userobject must contain 'displayname' and 'userinfoid'
	*/
	userString: function(userobject) {
		return userobject.userinfoid + ';#' + userobject.displayname;
	},
	
	Number: function(value) {
	
		if (isFinite(value)) {
			return Number(value);
		} else {
			return 0;
		}
		
	},
	
	/**
	* Adds leading zeros to a number
	* https://gist.github.com/aemkei/1180489
	*/
	pad: function(a, b) {
		return(1e15 + a + '').slice(-b);
	},
	
	random: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    humanBoolean: function(value) {
		return value ? 'Yes' : 'No';
    },
    
    csvDate: function(value) {
		return (value && value instanceof Date) ? value.toString('d-MMM-yyyy') : null;
    },
    
    /**
    * date2 is later than date1
    */
    daysDiff: function(date1, date2) {
		if (date1 instanceof Date !== true || date2 instanceof Date !== true) return 0;
    
		var millisecondsPerDay = 1000 * 60 * 60 * 24;
		var millisBetween = date2.getTime() - date1.getTime();
		var days = millisBetween / millisecondsPerDay;
		
		// Round down.
		return days < 0 ? 0 : Math.floor(days);
    },
    
    humanDateHint: function(date) {
	
		if (!date) return;
	
		var today = Date.today();
		
		var week = date.getWeek() - today.getWeek();
		var human;
		
		var prefix = '';
		var postfix = '';
		
		//future
		if (week === 0) {
		
			prefix = 'This';
			postfix = '';
			
		} else if (week === 1) {
		
			prefix = 'Next';
			postfix = '';
		
		} else if (week > 1) {
		
			postfix = 'in ' + week + ' weeks';
		
		}
		
		
		if (week >= 0) {
			return (prefix ? (prefix + ' ') : '') + date.toString('dddd') + (postfix ? (' ' + postfix) : '');
		} else {
			return moment(date).fromNow();
		}
	
	}

});