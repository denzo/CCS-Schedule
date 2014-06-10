App.SubmitRoute = Em.Route.extend({

	model: function() {
		return App.Task.create({
			due: Date.today().addDays(20),
			duration: 10, // default
			created: Date.today()
		});
	},
	
	
	createOption: function(from, duration, tasks, exclude) {
		return App.SuggestionOption.create({
			content: App.Utils.weekdayRangeFromDuration(from, duration).map(function(date) { 
				return App.DayLoad.create({ date: date.clone() });
			})
		}).forEach(function(day) {
			// @param {App.DayLoad} day
		
			// firstly, let's increase this day's load for the new task
			day.increase();
			
			// now let's go through all the currently assigned tasks
			// and add to this day's load if the task scheduled for this day
			tasks.forEach(function(task) {
				// @param {App.TaskController} task
				
				if (task !== exclude && task.isOnDate(day.get('date'))) {
					day.increase();
				}
			});
		});
	},
	
	
	
	/**
	* Finds the soonest possible option to fit a new task.
	*
	* @param {Number} duration Number of days required for the new task.
	* @param {Array} currentTasks A list of tasks currently scheduled tasks.
	* @param {Number} maxLoad Maximum number or tasks per day.
	* @param {Number} maxLoadTolerance Maximum number of days with maxLoad.
	*
	* @returns {App.SuggestionOption}
	*/
	findOption: function(duration, currentTasks, maxLoad, maxLoadTolerance) {
		var self = this,
			today = Date.today(),
			option,
			from = 0,
			isSuccessful = false;
			
		while (!option) {
			option = self.findOptionForDueDate(today.clone().addDays(Number(duration)), Number(duration), currentTasks, maxLoad, maxLoadTolerance);
		}
		
		return option;
	},
	
	
	/**
	* Returns an option if it is successful for a specified due date.
	*
	* @param {Date} due Due date for the new task.
	* @param {Number} duration Number of days required for the new task.
	* @param {Array} currentTasks A list of tasks currently scheduled tasks.
	* @param {Number} maxLoad Maximum number or tasks per day.
	* @param {Number} maxLoadTolerance Maximum number of days with maxLoad.
	*
	* @returns {App.SuggestionOption}
	*/
	findOptionForDueDate: function(due, duration, currentTasks, maxLoad, maxLoadTolerance) {
		var self = this,
			option = self.createOption(due.clone().addDays(-duration), duration, currentTasks);
		
		return option.isSuccessful(maxLoad, maxLoadTolerance) ? option : null;
	},
	
	
	actions: {
	
		applySuggestion: function(suggestion) {
			var self = this,
				task = suggestion.get('task');
				
			task.set('assignee', suggestion.get('assignee'));
			task.set('start', suggestion.get('option.start'));
			task.set('end', suggestion.get('option.end'));
		
			self.send('addTask', task);
			
			self.transitionTo('index');
		},
		
		getSuggestions: function(task) {
			var self = this,
				delay = 0,
				maxLoad = 3,
				maxLoadTolerance = 2,
				option = null,
				result = [],
				due = task.get('due'),
				duration = task.get('duration') || 1,
				today = Date.today(),
				assignees = self.controllerFor('assignees').filter(function(assignee) {
					return assignee.get('portfolios').contains(task.get('campaign.portfolio'));
				});
			
			
			// check if the due date is even possible based on the duration
			if (duration > App.Utils.weekdayRange(today.clone().addDays(1), due).length) {
				alert('CANT DO!');
				return;
			}
			
			if (assignees.get('length') === 0) {
				alert('No one is able to do: ' + task.get('campaign'));
				return;
			}
			
			if (due) {
				while (result.length === 0) {
					assignees.forEach(function(assignee) {
					
						// TODO:
						// Beware that duration doesn't take into account the weekends
						option = self.findOptionForDueDate(due.clone().addDays(delay), duration, assignee.get('futureTasks'), maxLoad, maxLoadTolerance);
						
						if (option) {
							result.push(App.Suggestion.create({
								task: task,
								assignee: assignee.get('name'),
								option: option,
								delay: delay
							}));
						}	
					});
					delay += 1;
				}
				
				// 2) Provide a suggestion where a specified type of tasks can be replaced
			
			} 
			else if (!due) {
				assignees.forEach(function(assignee) {
					option = self.findOption(duration, assignee.get('futureTasks'), maxLoad, maxLoadTolerance);
					
					if (option) {
						result.push(App.Suggestion.create({
							task: task,
							assignee: assignee.get('name'),
							option: option
						}));
					}
				});
			}
			
			// sort on score (lower better) then speed (lower better)
			result.sort(function(a, b) { return d3.ascending(a.get('score'), b.get('score')) || d3.ascending(a.get('speed'), b.get('speed')); });
			
			self.controllerFor('suggestions').set('content', result);
		}
	
	
	}
	
});
		