App.ApplicationRoute = Em.Route.extend({

	afterModel: function(params) {
		var self = this,
			appController = self.controllerFor('application'),
			assigneesController = self.controllerFor('assignees');
		
		return Em.RSVP.all([
			App.Campaign.fetch(),
			App.Preanalysis.fetch(),
			App.Channel.fetch()
		]).then(function(results) {
			return new Ember.RSVP.Promise(function(resolve, reject) {
				d3.csv('data/ltv_matrix.csv', function(csv) {
					resolve(csv.map(function(item) {
						return {
							portfolio: item.Portfolio,
							product: item.Product,
							objectives: Em.keys(item).without('Portfolio').without('Product').filter(function(objective) { return item[objective] !== 'na'; })
						};
					}));
				});
			});
		}).then(function(products) {
			// set the loaded products
			appController.set('products', products);
			
			// set the loaded campaigns
			appController.set('campaigns', App.Campaign.find());
			
			// populate assignees controller
			appController.get('analysts').forEach(function(analyst) {
			
				assigneesController.addObject(App.Assignee.create({
					name: analyst,
					portfolios: [App.Random.select(products.getEach('portfolio'))]
				}));
				
			});
			
			return Em.RSVP.all(self.fake(100).map(function(task) { return task.save(); }));
			
		}).then(function(tasks) {
		
			self.controllerFor('tasks').set('content', tasks);
			
			self.controllerFor('taskReports')
				.addReport('category', 'category', appController.get('categories'))
				.addReport('objective', 'campaign.objective', appController.get('objectives'))
				.addReport('portfolio', 'campaign.portfolio', appController.get('portfolios'));
			
		});
	},
	
	
	setupController: function(controller, model) {
		this._super(controller, model);
		
		var self = this;
		
		self.controllerFor('filters')
			.addFilter('Portfolio', 'campaign.portfolio', controller.get('portfolios'))
			.addFilter('Objective', 'campaign.objective', controller.get('objectives'))
			.addFilter('Analyst', 'assignee', controller.get('analysts'))
			.addFilter('Category', 'category', controller.get('categories'));
		
	},
	
	
	fake: function(total) {
		var self = this,
			controller = self.controllerFor('application'),
			i = -1,
			now = Date.today(),
			campaigns = controller.get('campaigns'),
			analysts = controller.get('analysts'),
			categories = controller.get('categories'),
			result = [];
			
		while (++i < total) {
			var campaign = App.Random.select(campaigns.get('content')),
				created = now.clone().addDays(App.Random.within(-120, 0)),
				start = created.clone().addDays(App.Random.within(0, 30)),
				end = start.clone().addDays(App.Random.within(5, 25)),
				due = end.clone().addDays(App.Random.within(1, 15)),
				dueWeek = due.clone().getDay() === 1 ? due.clone() : due.clone().moveToDayOfWeek(1, -1);
			
			result.push(App.Task.create({
				_fake: {
					ID: App.Task.createID(),
					category: App.Random.select(categories),
					campaign_id: campaign.get('ID'),
					assignee: App.Random.select(analysts),
					created: created.toString('yyyy-MM-dd HH:mm:ss'),
					start: start.toString('yyyy-MM-dd HH:mm:ss'),
					end: end.toString('yyyy-MM-dd HH:mm:ss'),
					due: due.toString('yyyy-MM-dd HH:mm:ss')
				}
			}));
		}
		return result;
	},
	
	
	actions: {
	
		selectFilter: function(value) {
			var self = this;
			
			self.controllerFor('filters').selectFilter(value);
		},
		
		deselectFilter: function(value) {
			var self = this;
			
			self.controllerFor('filters').deselectFilter(value);
		},
	
		addTask: function(task) {
			var self = this;
			
			task._fake = {
				ID: App.Task.createID(),
				category: task.get('category'),
				campaign_id: task.get('campaign.ID'),
				assignee: task.get('assignee'),
				created: task.get('created').toString('yyyy-MM-dd HH:mm:ss'),
				start: task.get('start').toString('yyyy-MM-dd HH:mm:ss'),
				end: task.get('end').toString('yyyy-MM-dd HH:mm:ss'),
				due: task.get('due').toString('yyyy-MM-dd HH:mm:ss')
			};
			
			task.save().then(function() {
				self.controllerFor('tasks').addObject(task);
			});
		},
		
		updateTask: function(task) {
			var self = this;
			
			task.set('end', task.get('end').clone().addDays(10));
			
			task.save().then(function() {
				
			});
		},
		
		/**
		* @param {App.Task} task
		*/
		removeTask: function(task) {
			var self = this,
				tasks = self.controllerFor('tasks');
			
			task.deleteRecord().then(function() {
				tasks.removeObject(tasks.findBy('ID', task.get('ID')));
				self.transitionTo('index');
			});
			
		},
		
		restart: function(total) {
			var self = this;
			
			//self.set('controller.content', self.fake(App.Utils.Number(total) || 10));
			
		}
	
	}
	
	
	

});