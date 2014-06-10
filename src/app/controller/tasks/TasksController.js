App.TasksController = Em.ArrayController.extend({

	itemController: 'task',
	
	needs: ['application', 'filters'],
	
	sortProperties: ['start'],
	
	assignees: Em.computed.mapBy('groupedByAssignee', 'assignee'),
	
	range: Em.computed.alias('controllers.application.range'),
	
	filters: Em.computed.alias('controllers.filters.selected'),
	
	selectedGroupListObserver: function() {
		console.log('selectedGroupListObserver');
		var self = this,
			dataView = self.get('dataView'),
			appController = self.get('controllers.application'),
			groups = appController.get('groups'),
			selectedGroupList = appController.get('selectedGroupList');
		
		dataView.setGrouping(selectedGroupList.map(function(group) { return groups.findBy('field', group); }));
		dataView.refresh();
	
	}.observes('controllers.application.selectedGroupList.length').on('init'),
	
	
	selectedFiltersObserver: function() {
	
		console.log('App.TasksController.selectedFiltersObserver');
	
	}.observes('controllers.filters.selected.length').on('init'),

	
	inRangeObserver: function() {
		Em.run.once(this, 'setItems');
	}.observes('inRange').on('init'),
	
	setItems: function() {
		console.log('setItems');
		var self = this,
			dataView = self.get('dataView');
		
		dataView.setItems(self.get('inRange'));
		dataView.refresh();
	},
	
	
	/**
	* {Array.<TaskController>} A list of tasks within the displayed range.
	*/
	inRange: function() {
		var self = this,
			filters = self.get('controllers.filters.selected'),
			selectedUniqDimensions = self.get('controllers.filters.selectedUniqDimensions'),
			range = self.get('range'),
			from = range[0],
			to = range[1];
		
		
			
		return self.filter(function(task) {
			var result = task.isWithin(from, to);
			
			if (result) {
				selectedUniqDimensions.forEach(function(dimension) {
					if (!filters.filterBy('dimension', dimension).getEach('value').contains(task.get(dimension))) {
						result = false;
					}
				});
			}
			
			
			/*
			if (result) {
				filters.forEach(function(filter) {
					if (task.get(filter.get('dimension')) !== filter.get('value')) {
						result = false;
					} else {
						result = true;
					}
				})
			}
			*/
			
			return result;
		});
	
	}.property('controllers.filters.selected.length', 'range', 'length', '@each.start', '@each.end'),
	
	
	/*
	
	THIS DOESN'T WORK
	
	When
	range = self.get('controllers.application.range')
	
	Instead of 
	range = self.get('range')
	
	Weird as I would assume that the body of the method
	should not affect the execution of binding.
	
	I would assume for it to trigger regardless as it is
	watching the change of 'range' property on this object
	which is an alias for the range on the ApplicationController
	
	
	inRange: function() {
		var self = this,
			range = self.get('controllers.application.range'),
			from = range[0],
			to = range[1];
			
		return self.filter(function(task) {
			return task.isWithin(from, to);
		});
	
	}.property('range', 'length', '@each.start', '@each.end'),
	*/
	
	
	
	
	/**
	* An object used to display the tasks in SlickGrid.
	*/
	dataView: function() {
		var self = this;
		return new Slick.Data.DataView({groupItemMetadataProvider: self.get('groupItemMetadataProvider')});
	}.property().readOnly(),
	
	
	/**
	* Something for the dataView :)
	*/
	groupItemMetadataProvider: function() {
		return new Slick.Data.GroupItemMetadataProvider();
	}.property().readOnly(),
	
	
	
	
	categoryTotals: function() {
		var self = this,
			from = self.get('from'),
			to = self.get('to'),
			all = self.get('dataView').getItems();
			
		return self.get('categories').map(function(category) {
		
			var requestsOfType = all.filterBy('category', category);
		
			return {
				category: category,
				total: requestsOfType.length,
				slots: self.calculateUsedSlots(requestsOfType, from, to)
			}
		
		});
		
	}.property('range', 'length'),
	
	
	
	/*
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
	*/
	
});
	