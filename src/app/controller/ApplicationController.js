App.ApplicationController = Em.ArrayController.extend({

	dataView: null,
	
	contentObserver: function() {
		var self = this,
			model = self.get('content'),
			dataView = self.get('dataView');
		
		if (!dataView) return;
		
		dataView.beginUpdate();
        dataView.setItems(model);
        dataView.endUpdate();
	
	}.observes('length'),
	
	range: null,
	from: null,
	to: null,
	future: 7,
	
	portfolios: null,
	
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
			field: 'title',
			cssClass: 'indent'
		},
		{
			name: 'Portfolio',
			id: 'portfolio',
			field: 'portfolio'
		},
		{
			name: 'Type', 
			id: 'type',
			field: 'type'
		},
		{
			name: 'Start',
			id: 'start',
			field: 'start',
			formatter: function(row, cell, value, column, data) {
				return data[column.field].toString('d MMM');
			},
		},
		{
			name: 'End',
			id: 'end',
			field: 'end',
			formatter: function(row, cell, value, column, data) {
				return data[column.field].toString('d MMM');
			}
		},
		{
			name: 'Due',
			id: 'due',
			field: 'due',
			formatter: function(row, cell, value, column, data) {
				return data[column.field].toString('d MMM');
			}
		},
		{
			name: 'Score',
			id: 'score',
			field: 'score'
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
				
				App.LaneRenderer.render(cell, data, self.get('from'), (self.get('future') + 1) * 7);
			}
		}
		];
	}.property(),
	
	
	
	
	
	
	
	
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
	
	createEmptyOptions: function(totalDays, newRequestDuration) {
		
		var today = Date.today();
	
		return d3.range(totalDays).map(function(offset) {
		
			offset = today.clone().addDays(offset);
		
			return d3.range(newRequestDuration).map(function(d) { 
				return {
					date: offset.clone().addDays(d),
					load: 0
				};
			})
		
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
	
	
	createDateRange: function(from, to) {
	
		return d3.range(App.Utils.daysDiff(from, to)).map(function(offset) {
		
			return from.clone().addDays(offset);
		
		});
	
	},
	
	
	getSuggestionsForGroup: function(group, newRequest, eliminate) {
		var self = this,
			printDetails = false,
			today = Date.today(),
			totalDays = App.Utils.daysDiff(Date.today(), newRequest.due.clone().addDays(-newRequest.duration)),
			options = self.createEmptyOptions(totalDays, newRequest.duration),
			groupRows = group.rows; 
		
		
		if (!Em.isNone(eliminate)) {
		
			if (printDetails) {
				console.log('ELIMINATE --> ' + eliminate);
			}
			
			// sort by score so the first replace option is a request with the lowest score
			groupRows = groupRows.slice(0).sort(function(a, b) { return d3.ascending(a.score, b.score) || d3.descending(a.due, b.due); });
		
		}
		
		
		options.forEach(function(option) {
		
			option.forEach(function(day) {
			
				// this is a load for the new request
				day.load++;
				
				groupRows.forEach(function(row, i) {
					
					if (eliminate !== i) {
					
						if (day.date.between(row.start, row.end.clone().addDays(-1))) // note -1 day
							day.load++;
							
					}
					
				});
			
			});
		
		});
		
		
		if (printDetails) {
			console.log('-----------------------------');
			console.log('with overload, total: ' + options.length);
		}
		
		self.printResult(options, printDetails);
		
		
		// ----------------------------------------------------------------
		//
		// without overload
		//
		// ----------------------------------------------------------------
		
		
		options = options.filter(function(option) {
		
			return option.filter(function(day) { return day.load > 2; }).length < 3;	
		
		});
		
		if (printDetails) {
			console.log('-----------------------------');
			console.log('without overload, total: ' + options.length);
		}
		
		self.printResult(options, printDetails);
		
		
		// ----------------------------------------------------------------
		//
		// if no options are found we are going to try to suggest a
		// request with less value to be replaced.
		//
		// ----------------------------------------------------------------
		
		
		if (options.length === 0) {
			
			eliminate = Em.isNone(eliminate) ? 0 : ++eliminate;
			
			if (eliminate < group.rows.length) {
		
				return self.getSuggestionsForGroup(group, newRequest, eliminate);
				
			} else {
			
				return null;
			
			}
		
		} else {
		
			var results = options.map(function(option) {
				var speed = App.Utils.daysDiff(today, option[0].date),
					load = d3.sum(option.getEach('load')),
					score = speed + load;
			
				return {
				
					analyst: group.value,
					option: option,
					speed: speed,
					load: load,
					score: speed + load,
					replace: groupRows[eliminate]
				
				}
			
			}).sort(function(a, b) { return d3.ascending(a.score, b.score) || d3.ascending(a.speed, b.speed); });
		
			return results[0];
			
		}
			
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
		
	}.property('to', 'from', 'length'),
	
	
	
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
	
	
	campaigns: function(total) {
	
		var self = this,
			i = -1,
			total = total || 100,
			result = [];
			
		while (++i < total) {
		
			result.push({
			
				title: '1000' + App.Utils.pad(i, 2),
				portfolio: App.Random.select(self.get('portfolios')),
				objective: App.Random.select(self.get('objectives'))
			
			});
		
		}
		
		return result;
	
	},
	
	
	
	
	
	
	
	findDelayedSuggestion: function(newRequest, groups) {
		var self = this,
			results = [],
			originalDueDate = newRequest.get('due').clone();
		
				
		groups.forEach(function(group) {
			
			var groupSuggestion = null;
			
			while (!(groupSuggestion && groupSuggestion.replace === undefined)) {
				groupSuggestion = self.getSuggestionsForGroup(group, newRequest);
				newRequest.get('due').addDays(1);
			}
			
			results.push(groupSuggestion);
			
			newRequest.set('due', originalDueDate.clone());
		});
		
		// sort by the sooner start date
		var result = results.sort(function(a, b) { return d3.ascending(a.option[0].date, b.option[0].date); }).shift();
		
		var newDue = result.option[0].date.clone().addDays(newRequest.duration);
		
		return {
			originalDue: originalDueDate,
			newDue: newDue, // mega important
			analyst: result.analyst,
			diff: App.Utils.daysDiff(originalDueDate, newDue),
			start: result.option[0].date,
			option: result.option
		};
	
	},
	
	
	
	
	
	
	actions: {
	
		addRequest: function(suggestion) {
			var self = this,
				newRequest = self.get('request');
			
			newRequest.analyst = suggestion.analyst;
			newRequest.start = suggestion.option[0].date;
			newRequest.end = newRequest.start.clone().addDays(newRequest.duration);
			
			self.addObject(newRequest);
			self.send('randomize');
		
		},
	
		addRequestWithDelay: function(suggestion) {
			var self = this,
				newRequest = self.get('request');
			
			newRequest.analyst = suggestion.analyst;
			newRequest.start = suggestion.option[0].date;
			newRequest.end = newRequest.start.clone().addDays(newRequest.duration);
			
			self.addObject(newRequest);
			self.send('randomize');
		
		},
	
		
		getSuggestions: function(newRequest) {
			var self = this,
				today = Date.today(),
				groups = self.get('dataView').getGroups();
			
			
			var results = [];
			
			groups.forEach(function(group) {
				console.log('-----------------------------');
				console.debug('Looking through: ' + group.value);
				console.log('-----------------------------');
			
				results.push(self.getSuggestionsForGroup(group, newRequest));
			
			});
			
			// remove all the nulls
			results = results.compact();
			
			if (results.length) {
			
				console.log('-----------------------------');
				console.info('SUGGESTIONS');
				console.log('-----------------------------');
			
				// sort the results - no replacement, lower score, sooner start
				results.sort(function(a,b) {
					return d3.ascending(Boolean(a.replace), Boolean(b.replace)) || 
						(Boolean(a.replace) ?
							d3.ascending(a.replace.score, b.replace.score) :
							d3.ascending(a.option[0].date, b.option[0].date));
				});
			
				results.forEach(function(result) {
					
					/* Result object:
					
					analyst: group.value,
					option: option,
					speed: speed,
					load: load,
					score: speed + load,
					replace: group.rows[eliminate]
					
					*/
					
					self.set('suggestions', results);
					
					
					console.debug(
						'Analyst: ' + result.analyst,
						' | Best start date: ' + result.option[0].date.toString('dd MMM'),
						result.replace ? (' | Replace: ' + result.replace.title) : '',
						result.replace ? (' | Score: ' + result.replace.score) : '');
					console.log('-----------------------------');
				});
				
				
				// if all the results suggest a replacement we will find a suggestion
				// where we move the due date to later
				if (results.getEach('replace').compact().length === results.length) {
				
					self.set('delayed', self.findDelayedSuggestion(newRequest, groups));
				
				}
			
			} else if (results.length === 0) {
			
				console.debug('-----------------------------');
				console.warn('SORRY, CAN\'T DO! It will have to be delayed.');
				
				self.set('delayed', self.findDelayedSuggestion(newRequest, groups));
			
			}
			
		
		},
		
		
		collapseAll: function() {
			this.get('dataView').collapseAllGroups();
		},
		
		expandAll: function() {
			this.get('dataView').expandAllGroups();
		},
		
		groupBy: function(columns) {
			var self = this,
				dataView = self.get('dataView');
				
			
				 
			dataView.setGrouping(columns.split(',').map(function(column) { return {getter: column}; }));
			
			var dueWeek = function(a, b) {
				return d3.ascending(d3.time.monday(a.end), d3.time.monday(b.end));
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
		
		
		groupByAnalyst: function() {
		
			var self = this,
				dataView = self.get('dataView');
				
			dataView.setGrouping({
				getter: 'analyst',
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
							
							if (d.date.between(row.start, row.end.clone().addDays(-1))) // note -1 day
								d.load++;
							
						});
					
					});
				
					//return group.value + '<span style="margin-left: 20px;font-size: 12px;">' + a.getEach('load').join(', ') + '</span>';
					return group.value + ' <span class="total">' + group.count + '</span>' + App.LoadRenderer.render(document.createElement('div'), a.getEach('load'), 560, 12);
					
				}
			});
			
			var analyst = function(a, b) {
				return  d3.ascending(a.analyst, b.analyst);
			}
		
			var start = function(a, b) {
				return d3.ascending(a.start, b.start);
			}
			
			var score = function(a, b) {
				return d3.descending(a.score, b.score);
			}
			
			var comparer = function(a, b) {
				return analyst(a,b) || start(a,b) || score(a,b);
			}
		
			dataView.sort(comparer);
		
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
