App.TasksController = Em.ArrayController.extend({

	content: [],
	
	itemController: 'task',
	
	assignees: Em.computed.mapBy('groupedByAssignee', 'assignee'),
	
	addObject: function(task) {
		var self = this,
			assignees = self.get('assignees');
			
		self._super(task);
		
		if (assignees.contains(task.get('assignee'))) {
			self.addTaskToAssignee(task.get('assignee'), task);
		} else {
			self.addAssignee(task.get('assignee'));
			self.addTaskToAssignee(task.get('assignee'), task);
		}
	},
	
	removeObject: function(task) {
		var self = this,
			assignees = self.get('assignees');
			
		self._super(task);
		
		if (assignees.contains(task.get('assignee'))) {
			self.removeTaskFromAssignee(task.get('assignee'), task);
		}
	},
	
	addTaskToAssignee: function(assignee, task) {
		this.get('groupedByAssignee')
			.findBy('assignee', assignee)
			.get('tasks')
			.addObject(task);
	},
	
	removeTaskFromAssignee: function(assignee, task) {
		this.get('groupedByAssignee')
			.findBy('assignee', assignee)
			.get('tasks')
			.removeObject(task);
	},
	
	addAssignee: function(assignee) {
		return this.get('groupedByAssignee').addObject(Em.Object.create({
			assignee: assignee,
			tasks: Em.ArrayController.create()
		}));
	},
	
	groupedByAssignee: Em.ArrayController.create()
	
});
	