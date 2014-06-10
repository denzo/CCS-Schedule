App.AssigneeController = Em.ObjectController.extend({

	needs: ['tasks'],
	
	allTasks: Em.computed.alias('controllers.tasks'),
	allTasksInRange: Em.computed.alias('controllers.tasks.inRange'),
	
	
	tasks: function() {
		return this.get('allTasks').filterBy('assignee', this.get('name'));
	}.property('name', 'allTasks.@each.assignee', 'allTasks.length'),
	
	
	tasksInRange: function() {
		return this.get('allTasksInRange').filterBy('assignee', this.get('name'));
	}.property('name', 'allTasksInRange.@each.assignee', 'allTasksInRange.length'),
	
	
	load: function(from, to) {
		var self = this,
			tasks = self.get('tasksInRange');
	
		return App.Utils.weekdayRange(from, to).map(function(date) { 
			return App.DayLoad.create({ date: date.clone() });
		}).map(function(day) {
			// @param {App.DayLoad} day
		
			// now let's go through all the currently assigned tasks
			// and add to this day's load if the task is scheduled for the day
			tasks.forEach(function(task) {
				// @param {App.Task} task
				
				if (task.isOnDate(day.get('date'))) {
					day.increase();
				}
			});
			
			return day;
			
		});
	},
	
	
	/**
	* A list of assigned tasks that are scheduled from today onwards.
	*/
	futureTasks: function() {
		var self = this,
			tasks = self.get('tasks'),
			today = Date.today();
		return tasks.filter(function(task) {
			return task.get('end').isAfter(today);
		});
	}.property('tasks.@each.start', 'tasks.@each.end')

});

