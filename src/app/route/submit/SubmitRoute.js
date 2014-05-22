App.SubmitRoute = Em.Route.extend({

	model: function() {
		return App.Task.create();
	},
	
	
	/**
	* This method creates all available empty options. The number of options depends on
	* how far away the due date is from today. An "option" (App.SuggestionOption)is
	* an array of dates with associated load (number of tasks on the same day mean "load").
	* Each "option" has a length of the provided duration. 
	*
	*      Due
	*       |
	* xxxoooooo = [1,2,3]
	* oxxxooooo = [2,3,4]
	* ooxxxoooo = [3,4,5]
	* oooxxxooo = [4,5,6]
	* ooooxxxoo = [5,6,7]
	*
	* You can see that we created 5 possible options.
	*
	* @returns {Array.<App.SuggestionOption>}
	*/
	createEmptyOptions: function(from, to, duration) {
		return this.createDateRange(from, to).map(function(date) {
			return App.SuggestionOption.create({
				content: d3.range(duration).map(function(i) { return App.DayLoad.create({
						date: date.clone().addDays(i),
						load: 0
					});
				})
			});
		});
	},
	
	createSuggestionOptionList: function(from, to, duration) {
		return App.SuggestionOptionList.create({
			content: this.createDateRange(from, to).map(function(date) {
				return App.SuggestionOption.create({
					content: d3.range(duration).map(function(i) { return App.DayLoad.create({
							date: date.clone().addDays(i),
							load: 0
						});
					})
				});
			})
		});
	},
	
	
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
	
	
	/**
	* This method will find the best suggestion for the provided group.
	* Please note that this method is recursive.
	*
	* 
	*
	* @param {Array} current A list of current tasks for a group.
	* @param {Date} due Due date of the new request.
	* @param {Date} duration Duration (in days) of the new request.
	* @param {Number} eliminate Index of the item to exclude in the currently assigned tasks. As this method is recursive this index will keep increasing.
	*
	* @returns {App.SuggestionOption}
	*/
	findSuggestionsForGroup: function(current, due, duration, eliminate) {
		var self = this,
			printDetails = self.get('printDetails'),
			today = Date.today(),
			// maximum number or tasks per day
			maxLoad = 3,
			// maximum number of days with maxLoad
			maxLoadTolerance = 2,
			
			options = self.createEmptyOptions(
			//options = self.createSuggestionOptionList(
				today.clone().addDays(1), // start search from tomorrow
				due ? due.clone().addDays(-duration) : today.clone().addDays(91), // if no due date provided we will search within the next 90 days
				duration || 1 // minimum 1 day (unit)
			);
		
		if (!Em.isNone(eliminate)) {
			// sort by score so the first replace option is a request with the lowest score
			groupRows = current.slice(0).sort(function(a, b) { return d3.ascending(a.score, b.score) || d3.descending(a.due, b.due); });
			if (printDetails) console.log('ELIMINATE --> ' + eliminate);
		}
		
		options.forEach(function(option) {
			// @param {App.SuggestionOption} option
			
			option.forEach(function(day) {
				// @param {App.DayLoad} day
			
				// firstly, let's increase this day's load for the new task
				day.increase();
				
				// now let's go through all the currently assigned tasks
				// and add to this day's load if the task scheduled for this day
				current.forEach(function(task, i) {
					// @param {App.Task} task
					// @param {Number} i
					
					// skip the index of the task we are trying to eliminate
					if (eliminate !== i) {
						if (task.isOnDate(day.get('date'))) {
							day.increase();
						}
					}
					
				});
			
			});
		
		});
		
		
		if (printDetails) {
			console.log('with overload, total: ' + options.length);
			self.printResult(options, printDetails);
		}
		
		
		// filter out options that have maxLoadTolerance or more days with maxLoad
		options = options.filter(function(option) {
			return option.filter(function(day) { return day.load >= maxLoad; }).length <= maxLoadTolerance;
		});
		
		if (printDetails) {
			//console.log('without overload, total: ' + options.length);
			//self.printResult(options, printDetails);
		}
		
		
		// if no options are found we are going to try to suggest a
		// request with less value to be replaced.
		if (options.length === 0) {
			
			eliminate = Em.isNone(eliminate) ? 0 : ++eliminate;
			
			if (eliminate < current.length) {
				return self.findSuggestionsForGroup(current, due, duration, eliminate);
			} else {
				return null;
			}
		} 
		
		else if (options.length > 0) {
		
			// sort on score (lower better) then speed (lower better)
			options.sort(function(a, b) { return d3.ascending(a.get('score'), b.get('score')) || d3.ascending(a.get('speed'), b.get('speed')); });
			
			var bestOption = options[0]; // return the best (first after sorting) option
			
			if (!Em.isNone(eliminate)) {
				bestOption.set('replace', current[eliminate])
			}
			
			return bestOption;
		}
	},
	
	
	
	
	
	
	
	
	actions: {
	
		getSuggestions: function(task) {
			var self = this,
				results = [],
				today = Date.today(),
				tasks = self.controllerFor('tasks'),
				tasksGroupedByAssignee = self.controllerFor('assignees'); //tasks.get('groupedByAssignee');
			
			tasksGroupedByAssignee.forEach(function(group) {
				var groupBestSuggestion = self.findSuggestionsForGroup(group.get('futureTasks'), task.get('dueDate'), task.get('duration'));
				
				if (groupBestSuggestion) {
					groupBestSuggestion.analyst = group.value;
					results.push(groupBestSuggestion);
				}
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
							d3.ascending(a.start, b.start));
				});
			
				self.set('suggestions', results);
				
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
	
	
	}
	
});
		