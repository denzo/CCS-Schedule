App.IndexController = Em.ArrayController.extend({

	needs: ['application', 'assignees', 'tasks', 'taskReports', 'filters'],

	printDetails: false,

	range: Em.computed.alias('controllers.application.range'),
	from: Em.computed.alias('controllers.application.from'),
	to: Em.computed.alias('controllers.application.to'),
	future: Em.computed.alias('controllers.application.future'),
	duration: Em.computed.alias('controllers.application.duration'),
	groups: Em.computed.alias('controllers.application.groups'),
	assignees: Em.computed.alias('controllers.assignees'),
	
	categoryTotals: Em.computed.alias('controllers.application.categoryTotals'),
	portfolioTotals: Em.computed.alias('controllers.application.portfolioTotals'),
	rangeTasks: Em.computed.alias('controllers.application.rangeTasks'),
	
	groupItemMetadataProvider: Em.computed.alias('controllers.application.groupItemMetadataProvider'),
	
	tasks: Em.computed.alias('controllers.tasks'),
	taskReports: Em.computed.alias('controllers.taskReports'),
	
	
	request: null,
	
	
	/**
	* {String} A label that plurarizes a work 'week'.
	*/
	durationsLabel: function() {
		var self = this;
		return self.get('duration') > 1 ? 'weeks' : 'week';
	}.property('duration'),
	
	
	columns: function() {
		var self = this;
		
		return [
		{
			name: 'Title',
			id: 'title',
			width: 200,
			field: 'campaign.title',
			cssClass: 'indent',
			formatter: function(row, cell, value, column, data) {
				return '<a href="#/task/' + data.get('id') + '">' + data.get('campaign.title') + '</a>';
			},
		},
		{
			name: 'Portfolio',
			id: 'portfolio',
			width: 75,
			field: 'campaign.portfolio'
		},
		{
			name: 'Category', 
			id: 'category',
			width: 75,
			field: 'category'
		},
		{
			name: 'Start',
			id: 'start',
			field: 'start',
			width: 50,
			formatter: function(row, cell, value, column, data) {
				return data.get(column.field).toString('d MMM');
			},
		},
		{
			name: 'End',
			id: 'end',
			field: 'end',
			width: 50,
			formatter: function(row, cell, value, column, data) {
				return data.get(column.field).toString('d MMM');
			}
		},
		{
			name: 'Due',
			id: 'due',
			field: 'due',
			width: 50,
			formatter: function(row, cell, value, column, data) {
				return data.get(column.field).toString('d MMM');
			}
		},
		{
			headerCssClass: 'lane-header',
			name: '', //App.LaneHeaderRenderer.render(self.get('from'), (self.get('future') + 1) * 7, self),
			id: 'vis',
			width: 560,
			field: 'vis',
			formatter: function(row, cell, value, column, data) {
				return '';
			},
			asyncPostRender: function(cell, row, data, column) {
				
				//App.LaneRenderer.render(cell, data, self.get('from'), (self.get('future') + 1) * 7);
				App.LaneRendererNew.render(cell, data, self.get('from'), self.get('to'));
			}
		}
		];
	}.property(),
	
	
	/**
	* Creates an Array of dates for the specified range.
	*
	* @param {Date} from A from date for the range.
	* @param {Date} to A to date for the range
	*
	* @returns {Array.<Date>} An array of dates for the specified range. 
	*/
	createDateRange: function(from, to) {
		return d3.range(App.Utils.daysDiff(from, to)).map(function(offset) {
			return from.clone().addDays(offset);
		});
	},
	
	
	calculateUsedSlots: function(requests, from, to) {
		var self = this,
			range = self.createDateRange(from, to);
			
		return d3.sum(requests.map(function(request) {
		
			return d3.sum(range.map(function(date) {
				return Number(date.between(request.start, request.end));
			}));
		
		}));
	},
	
	actions: {
	
		collapseAll: function() {
			this.get('tasks.dataView').collapseAllGroups();
		},
		
		expandAll: function() {
			this.get('tasks.dataView').expandAllGroups();
		},
		
		groupBy: function(fields) {
			var self = this,
				dataView = self.get('dataView'),
				groups = self.get('groups');
				 
			
			self.set('controllers.application.selectedGroupList', fields.split(','));
			
			return;
			dataView.setGrouping(fields.split(',').map(function(field) { return groups.findBy('field', field); }));
			
			var dueWeek = function(a, b) {
				return d3.ascending(d3.time.monday(a.end), d3.time.monday(b.end));
			}
			
			var score = function(a, b) {
				return d3.descending(Number(a.score), Number(b.score));
			}
			
			var comparer = function(a, b) {
				return score(a,b);
			}
			
			var group = groups.findBy('field', fields);
			
			if (group && group.sort) {
				dataView.sort(group.sort());
			}
			
			dataView.refresh();
		},
		
		
		
		
		
		groupByPortfolioDueDate: function() {
			var self = this,
				dataView = self.get('dataView');
			
			dataView.setGrouping([
			{
				getter: 'portfolio'
			},
			{
				getter: 'dueWeek',
				formatter: function(column) {
					return d3.time.monday(column.value).toString('ddd, d MMM') + ' - ' + d3.time.sunday.ceil(column.value).toString('ddd, d MMM'); 
				}
			}]);
			
			var dueWeek = function(a, b) {
				return d3.ascending(d3.time.monday(a.due), d3.time.monday(b.due));
			}
			
			var score = function(a, b) {
				return d3.descending(Number(a.score), Number(b.score));
			}
			
			var comparer = function(a, b) {
				return score(a,b);
			}
		
			dataView.sort(comparer);
			
			dataView.refresh();
		},
		
		
		updateTimeRange: function(range) {
			var self = this;
			self.set('range', range);
		},
		
		updateFromTo: function(range) {
			var self = this;
			
			//console.log(range[0].toString('d MMM'), range[1].toString('d MMM')); 
			
			self.set('from', range[0]);
			self.set('to', range[1]);
		}
		
		
	
	}

});
