App.TaskController = Em.ObjectController.extend({

	init: function() {
		var self = this;
		
		self._super();
		
		// tasks are displayed using SlickGrid
		// it's data provider requires each iteam to have a unique id
		// currently it is done here in POJO way
		self.id = self.get('ID');
	},

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
	
	
	monthStart: function() {
		return this.get('start').clone().moveToFirstDayOfMonth();
	}.property('start'),
	
	monthEnd: function() {
		return this.get('end').clone().moveToFirstDayOfMonth();
	}.property('end'),
	
	weekStart: function() {
		return d3.time.monday(this.get('start'));
	}.property('start'),
	
	weekEnd: function() {
		return d3.time.monday(this.get('end'));
	}.property('end'),
	
	
	/**
	* The duration only includes work days.
	*/
	duration: function() {
		return this.get('durationDates.length');
	}.property('durationDates').readOnly(),
	
	/**
	* The duration only includes work days.
	*/
	durationDates: function() {
		var self = this,
			result = [],
			start = self.get('start'),
			end = self.get('end');
			
		if (start && end && !end.isBefore(start)) {
			var date = start.clone();
				
			while (!date.isAfter(end)) {
				if (date.getDay() !== 6 && date.getDay() !== 0) { // exclude Sat and Sun
					result.push(date.clone());
				}
				date.addDays(1);
			}
			
		}
		
		return result;
	
	}.property('start', 'end'),
	
	isWithin: function(from, to) {
		return this.get('start').between(from, to) || this.get('end').between(from, to);
	},
	
	isOnDate: function(date) {
		return this.get('durationDates').find(function(item) {
			return item.equals(date);
		});
	}

});


