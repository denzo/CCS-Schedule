App.TaskController = Em.ObjectController.extend({

	/**
	* Determines if a task is for an existing project.
	*
	* If the creation date of the task is after the project's due date
	* this means the task is for an existing project.
	*/
	isForExistingProject: function() {
		return this.get('created').isAfter(
			this.get('project.isCampaign') ? 
				this.get('project.campaign.dueDate') : 
				this.get('project.dueDate'));
	
	}.property('project.dueDate', 'project.isCampaign', 'project.campaign.dueDate'),
	
	
	/**
	*
	*/
	duration: function() {
		var self = this,
			start = self.get('start'),
			end = self.get('end');
			
		if (start && end) {
			return App.Utils.daysDiff(start, end);
		} else {
			return null;
		}
	}.property('start', 'end'),
	
	
	durationDates: function() {
		var self = this,
			result = [],
			start = self.get('start'),
			end = self.get('end');
			
		if (start && end && !end.isBefore(start)) {
			var counter = 1,
				date = start.clone();
				
			while (!date.equals(end)) {
				result.push(date.clone());
				date.addDays(1);
			}
			
			return result;
		} else {
			return 0;
		}
	
	}.property('start', 'end'),
	
	
	isOnDate: function(date) {
		return this.get('durationDates').find(function(item) {
			return item.equals(date);
		});
	}

});


