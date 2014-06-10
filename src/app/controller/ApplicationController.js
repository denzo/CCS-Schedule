App.ApplicationController = Em.ObjectController.extend({

	needs: ['tasks', 'assignees'],
	
	
	currentFilters: null,
	
	
	/**
	* {Array.<String> A list of currently selected groups.
	* the order within the array will specify the grouping order.
	*/
	selectedGroupList: function() {
		return ['assignee'];
	}.property(),
	
	
	/**
	* {Array.<App.Task>} A list of all tasks.
	*/
	tasks: Em.computed.alias('controllers.tasks'),

	
	/**
	* {Array.<App.Campaign>} A list of all campaigns.
	*/
	campaigns: null,


	/**
	* {Array.<Object>} A list of all available products.
	* 
	* Object > {portfolio:value, product:value, objectives:{Array.<String>}}
	*/
	products: null,
	
	
	/**
	* {Array.<String>} A list of all available portfolios.
	* It is a dynamic list extracting all available portfolios from the product list.
	*/
	portfolios: function() {
	
		return this.get('products')
			.getEach('portfolio')
			.uniq()
			.sort();
	
	}.property('products.length'),
	
	
	/**
	* {Array.<String>} A list of all available objectives.
	* It is a dynamic list extracting all available objectives from the product list.
	*/
	objectives: function() {
		return d3.merge(
			this.get('products')
				.getEach('objectives')
			)
			.uniq()
			.sort();
	}.property('products.length'),
	
	
	/**
	* {Array.<String>} A list of all available analysts.
	*/
	analysts: function() {
		var all = ['Benjamin Zhan', 'Vicki Wood', 'Deniss Alimovs', 'Nancy Macolino', 'Maurice Ky', 'Lilly Truong', 'Gustavo Lummertz', 'Andrew Down', 'Helen Chau', 'Deepti Bellavi', 'Peter Gebhardt', 'Louis Tranquille', 'Ying Guang'];
		return all;
	}.property(),
	
	categories: ['pre-analysis', 'development', 'reporting', 'PIR', 'Other'],
	
	groups: function() {
		var self = this;
		
		return [
			{
				field: 'assignee',
				getter: function(d) { return d.get(this.field); },
				comparer: function(a, b) { return d3.ascending(a.value, b.value); },
				formatter: function(group) {
				
					var from = self.get('from'),
						to = self.get('to');
					
					return group.value + 
						' <span class="total">' + group.count + '</span>' + 
						App.LoadRenderer.render(
							document.createElement('div'), 
							self.get('controllers.assignees')
								.findBy('name', group.value)
								.load(from, to)
								.getEach('load'),
							560,
							12);
				},
				sort: function(a, b) { return d3.ascending(a.get('end'), b.get('end')); }
			},
			{
				field: 'campaign.portfolio',
				getter: function(d) { return d.get(this.field); },
				comparer: function(a, b) { return d3.ascending(a.value, b.value); },
				formatter: function(group) { return group.value + ' <span class="total">' + group.count + '</span>'; },
				sort: function(a, b) { return d3.ascending(a.get('start'), b.get('start')); }
			},
			{
				field: 'category',
				getter: function(d) { return d.get(this.field); },
				comparer: function(a, b) { return d3.ascending(a.value.toLowerCase(), b.value.toLowerCase()); },
				formatter: function(group) { return group.value + ' <span class="total">' + group.count + '</span>'; },
				sort: function(a, b) { return d3.ascending(a.get('start'), b.get('start')); }
			},
			{
				field: 'monthStart',
				getter: function(d) { return d.get(this.field); },
				comparer: function(a, b) { return d3.ascending(a.value, b.value); },
				formatter: function(group) { return group.value.toString('MMMM yyyy') + ' <span class="total">' + group.count + '</span>'; },
				sort: function(a, b) { return d3.ascending(a.get('start'), b.get('start')); }
			},
			{
				field: 'monthEnd',
				getter: function(d) { return d.get(this.field); },
				comparer: function(a, b) { return d3.ascending(a.value, b.value); },
				formatter: function(group) { return group.value.toString('MMMM yyyy') + ' <span class="total">' + group.count + '</span>'; },
				sort: function(a, b) { return d3.ascending(a.get('end'), b.get('end')); }
			},
			{
				field: 'weekStart',
				getter: function(d) { return d.get(this.field); },
				comparer: function(a, b) { return d3.ascending(a.value, b.value); },
				formatter: function(group) { return group.value.toString('d MMM yyyy') + ' <span class="total">' + group.count + '</span>'; },
				sort: function(a, b) { return d3.ascending(a.get('start'), b.get('start')); }
			},
			{
				field: 'weekEnd',
				getter: function(d) { return d.get(this.field); },
				comparer: function(a, b) { return d3.ascending(a.value, b.value); },
				formatter: function(group) { return group.value.toString('d MMM yyyy') + ' <span class="total">' + group.count + '</span>'; },
				sort: function(a, b) {return d3.ascending(a.get('end'), b.get('end'));
				}
			},
			{
				field: 'campaign.title',
				getter: function(d) { return d.get(this.field); },
				comparer: function(a, b) { return d3.ascending(a.value, b.value); },
				formatter: function(group) { return group.value + ' <span class="total">' + group.count + '</span>'; }
			}
		]
	}.property(),
	
	groupItemMetadataProvider: null,

	dataView: null,
	
	
	
	from: function() {
		var today = Date.today();
		return today.getDay() === 1 ? today.clone() : today.clone().moveToDayOfWeek(1, -1);
	}.property(),
	
	to: function() {
		var self = this,
			today = Date.today();
		return today.clone().moveToDayOfWeek(0).addWeeks(self.get('future'));
	}.property(),
	
	range: function() {
		return [this.get('from'), this.get('to')];
	}.property(),
	
	future: 7,
	
	
	/*
	rangeObserver: function() {
		var self = this,
			dataView = self.get('dataView'),
			range = self.get('range'),
			from = range[0],
			to = range[1];
		
		dataView.setFilterArgs({
			range: range
		});
		
		dataView.refresh();
		//dataView.sort();
		
		
		self.set('from', from);
		self.set('to', to);
	
	}.observes('range'),
	*/
	
	/*
	tasksObserver: function() {
		var self = this,
			tasks = self.get('tasks'),
			dataView = self.get('dataView');
		
		if (!dataView) return;
		
		dataView.beginUpdate();
        dataView.setItems(tasks.map(function(task) { return task; }));
        dataView.endUpdate();
	
	}.observes('tasks.length'),
	*/
	
	
	/**
	* {Number} A total number of weeks within the range.
	*/
	duration: function() {
		var self = this;
		return Math.round((self.get('to').getTime() - self.get('from').getTime()) / 1000 / 60 / 60 / 24 / 7); 
	}.property('from', 'to'),
	
	
	
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
	
	calculateUsedSlots: function(tasks, from, to) {
		var self = this,
			range = self.createDateRange(from, to);
			
		return d3.sum(tasks.map(function(task) {
		
			return d3.sum(range.map(function(date) {
				return Number(date.between(task.get('start'), task.get('end')));
			}));
		
		}));
	},
	
	
	
	/*
	portfolioTotals: function() {
		var self = this,
			from = self.get('from'),
			to = self.get('to'),
			all = self.get('dataView').getItems();
			
		return self.get('portfolios').map(function(portfolio) {
		
			var requestsOfType = all.filterBy('campaign.portfolio', portfolio);
		
			return {
				portfolio: portfolio,
				total: requestsOfType.length,
				slots: self.calculateUsedSlots(requestsOfType, from, to)
			}
		
		});
		
	}.property('range', 'tasks.length'),
	*/
	
	/*
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
		
	}.property('range', 'tasks.length'),
	*/
	
	

	
});
