App.ApplicationController = Em.ObjectController.extend({

	needs: ['tasks'],
	
	fakePool: null,


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
		//var all = ['Benjamin Zhan'],
		//var all = ['Benjamin Zhan', 'Vicki Wood', 'Deniss Alimovs'];
		
		return all;
	}.property(),
	
	
	
	types: function() {
		return ['Pre-analysis', 'Development', 'PIR', 'Misc'];
	}.property(),
	
	
	groups: function() {
		var self = this;
		
		return [
			{
				field: 'assignee',
				getter: function(d) { return d.get(this.field); },
				formatter: function(group) {
				
					var i = -1,
						from = self.get('from'),
						a = d3.range(56).map(function(d) { 
							return {
								date: from.clone().addDays(d),
								load: 0
							};
					});
					
					//console.log(group.value, '---------------------');
					a.forEach(function(d) {
					
						group.rows.forEach(function(row) {
							
							// console.log(d.date.toString('d MMM'), row.start.toString('d MMM'), row.end.toString('d MMM'), d.date.between(row.start, row.end));
							
							if (d.date.between(row.get('start'), row.get('end').clone().addDays(-1))) // note -1 day
								d.load++;
							
						});
					
					});
				
					//return group.value + '<span style="margin-left: 20px;font-size: 12px;">' + a.getEach('load').join(', ') + '</span>';
					return group.value + ' <span class="total">' + group.count + '</span>' + App.LoadRenderer.render(document.createElement('div'), a.getEach('load'), 560, 12);
					
				}
			},
			{
				field: 'campaign.portfolio',
				getter: function(d) {
					return d.get(this.field);
				}
			},
			{
				field: 'type',
				getter: function(d) { return d.get(this.field); }
			},
			{
				field: 'campaign.title',
				getter: function(d) { return d.get(this.field); }
			}
		]
	}.property(),
	
	
	
	groupItemMetadataProvider: null,





	printDetails: false,

	dataView: null,
	
	tasksObserver: function() {
		var self = this,
			tasks = self.get('tasks'),
			dataView = self.get('dataView');
		
		if (!dataView) return;
		
		dataView.beginUpdate();
        dataView.setItems(tasks);
        dataView.endUpdate();
	
	}.observes('tasks.length'),
	
	from: function() {
		var today = Date.today();
		return today.getDay() === 1 ? today.clone() : today.clone().moveToDayOfWeek(1, -1);
	}.property(),
	
	to: function() {
		var self = this,
			today = Date.today();
		return today.clone().moveToDayOfWeek(0).addWeeks(self.get('future'));
	}.property(),
	
	range: null,
	
	future: 7,
	
	request: null,
	
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
	
	/**
	* {Number} A total number of weeks within the range.
	*/
	duration: function() {
		var self = this;
		return Math.round((self.get('to').getTime() - self.get('from').getTime()) / 1000 / 60 / 60 / 24 / 7); 
	}.property('from', 'to'),
	
	
	
	
	
	
	
	printResult: function(options, print) {
		
		if (!print) return;
		
		var results = options.map(function(option) {
			var speed = App.Utils.daysDiff(today, option[0].date),
				load = d3.sum(option.getEach('load')),
				score = speed + load;
		
			return option[0].date.toString('dd MMM') + ' = ' + App.Utils.pad(speed, 2) + ' | ' + 
				option.getEach('load').join(',') + ' = ' + App.Utils.pad(load, 2) + ' | ' + 
				'Score: ' + App.Utils.pad(score, 2);
		
		});
		
		results.forEach(function(result) {
			console.log(result);
		});
	
	},
	
	createEmptySlots: function(from, to, portfolio) {
	
		return d3.range(App.Utils.daysDiff(from, to)).map(function(offset) {
		
			return {
				portfolio: portfolio,
				date: from.clone().addDays(offset),
				load: 0
			};
		
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
	
	
	
	
	portfolioTotals: function() {
		var self = this,
			from = self.get('from'),
			to = self.get('to'),
			all = self.get('dataView').getItems();
			
		return self.get('portfolios').map(function(portfolio) {
		
			var requestsOfType = all.filterBy('portfolio', portfolio);
		
			return {
				portfolio: portfolio,
				total: requestsOfType.length,
				slots: self.calculateUsedSlots(requestsOfType, from, to)
			}
		
		});
		
	}.property('to', 'from', 'tasks.length'),
	
	
	
	typeTotals: function() {
		var self = this,
			from = self.get('from'),
			to = self.get('to'),
			all = self.get('dataView').getItems();
			
		return self.get('types').map(function(type) {
		
			var requestsOfType = all.filterBy('type', type);
		
			return {
				type: type,
				total: requestsOfType.length,
				slots: self.calculateUsedSlots(requestsOfType, from, to)
			}
		
		});
		
	}.property('to', 'from'),
	
	
	suggestions: null,
	delayed: null,
	
	
	
	
	
	
	
	
	
	
	findDelayedSuggestion: function(newRequest, groups) {
		var self = this,
			results = [],
			originalDueDate = newRequest.get('due').clone();
				
		groups.forEach(function(group) {
			var groupSuggestion = null;
			
			while (!(groupSuggestion && groupSuggestion.replace === undefined)) {
				groupSuggestion = self.findSuggestionsForGroup(group.rows, newRequest.due, newRequest.duration);
				newRequest.get('due').addDays(1);
			}
			
			groupSuggestion.analyst = group.value;
			
			results.push(groupSuggestion);
			
			newRequest.set('due', originalDueDate.clone());
		});
		
		// sort by the sooner start date and get the first option
		var result = results.sort(function(a, b) { return d3.ascending(a.start, b.start); })[0];
		
		var newDue = result.start.clone().addDays(newRequest.duration);
		
		return {
			originalDue: originalDueDate,
			newDue: newDue, // mega important
			analyst: result.analyst,
			diff: App.Utils.daysDiff(originalDueDate, newDue),
			start: result.start
		};
	
	},
	
	
	
	
	
	
	actions: {
	
		addRequest: function(suggestion) {
			var self = this,
				newRequest = self.get('request');
			
			newRequest.analyst = suggestion.analyst;
			newRequest.start = suggestion.start;
			newRequest.end = newRequest.start.clone().addDays(newRequest.duration);
			
			self.addObject(newRequest);
			self.send('randomize');
		},
	
		addRequestWithDelay: function(suggestion) {
			var self = this,
				newRequest = self.get('request');
			
			newRequest.analyst = suggestion.analyst;
			newRequest.start = suggestion.start;
			newRequest.end = newRequest.start.clone().addDays(newRequest.duration);
			
			self.addObject(newRequest);
			self.send('randomize');
		},
		
		
		
		
		collapseAll: function() {
			this.get('dataView').collapseAllGroups();
		},
		
		expandAll: function() {
			this.get('dataView').expandAllGroups();
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
		},
		
		randomize: function() {
			var self = this,
				campaign = App.Random.select(self.campaigns(100)),
				requestId = self.get('content.length') + 1,
				created = Date.today(),
				type = App.Random.select(self.get('types')), 
				due = created.clone().addDays(App.Random.within(15, 20)),
				dueWeek = d3.time.monday(due.clone());
				
				
			self.set('request', Em.Object.create({
				id: requestId,
				type: type,
				title: campaign.title,
				portfolio: campaign.portfolio,
				objective: campaign.objective,
				created: created,
				due: due,
				dueWeek: dueWeek,
				duration: App.Random.within(5, 15),
				score: App.Random.within(100, 1000)
			}));
			
			self.set('suggestions', null);
			self.set('delayed', null);
			
		}
	
	}

});
