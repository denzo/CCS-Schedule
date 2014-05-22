App.AssigneeController = Em.ObjectController.extend({

	all: null,
	
	assignee: null,
	
	tasks: function() {
		return this.get('all').filterBy('assignee', this.get('assignee'));
	}.property('assignee', 'all.@each.assignee'),
	
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

