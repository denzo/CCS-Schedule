App.TaskReportsController = Em.ArrayController.extend({

	itemController: 'taskReport',
	
	addReport: function(reportName, reportProperty, reportPropertyValues) {
		var self = this;
		
		self.addObjects(
			reportPropertyValues.map(function(reportPropertyValue) {
				return Em.Object.create({
					reportProperty: reportProperty,
					reportPropertyValue: reportPropertyValue
				});
			})
		);
		
		Em.defineProperty(self, reportName, Ember.computed(function() {
			return self.filterBy('reportProperty', reportProperty);
		}).property('@each.reportProperty', 'length'));
		
		return self; // just for chaining
	},
	
});

App.TaskReportController = Em.ObjectController.extend({

	needs: ['application', 'tasks'],
	
	range: Em.computed.alias('controllers.tasks.range'),
	inRange: Em.computed.alias('controllers.tasks.inRange'),
	
	
	/*
	reportProperty: null,
	reportPropertyValue: null,
	*/
	
	init: function() {
		var self = this;
		
		self._super();
		
		// we dynamically define a property based on the provided
		// reportProperty and reportPropertyValue
		Em.defineProperty(self, 'tasks', Ember.computed(function() {
			return self.get('inRange').filterBy(this.get('reportProperty'), this.get('reportPropertyValue'));
		}).property('inRange.@each.' + self.get('reportProperty'), 'inRange.length'));
	},
	
	total: Em.computed.alias('tasks.length'),

	slots: function(tasks, from, to) {
		var self = this,
			tasks = self.get('tasks'),
			range = self.get('range'),
			from = range[0],
			to = range[1];
			
		return d3.sum(self.get('tasks').map(function(task) {
			
			return task.get('durationDates').reduce(function(previousValue, date) {
				return previousValue + Number(date.between(from, to));
			}, 0);
				
		}));
			
	}.property('tasks.length', 'range')


});


