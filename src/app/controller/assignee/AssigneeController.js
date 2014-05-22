App.AssigneeController = Em.ObjectController.extend({

	all: null,
	
	assignee: null,
	
	tasks: function() {
		return Em.ArrayController.create({
			content: this.get('all').filterBy('assignee', this.get('assignee')),
			itemController: 'task'
		});
	}.property('assignee', 'all.@each.assignee')

});

