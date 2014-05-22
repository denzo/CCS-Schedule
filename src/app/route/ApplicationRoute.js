App.ApplicationRoute = Em.Route.extend({

	afterModel: function(params) {
		var self = this,
			appController = self.controllerFor('application');
		
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
			
			
			console.time('createFakeTasks');
			self.controllerFor('tasks').addObjects(self.fake(100));
			console.timeEnd('createFakeTasks');
			
			
			var assigneesController = self.controllerFor('assignees');
			
			appController.get('analysts').forEach(function(analyst) {
			
				assigneesController.addObject(App.AssigneeController.create({
					assignee: analyst,
					all: self.controllerFor('tasks')
				}));
			
			});
			
			appController.set('fakePool', self.fake(10));
			
		});
	},
	
	
	setupController: function(controller, model) {
		this._super(controller, model);
		
		var self = this,
			today = Date.today(),
			from = controller.get('from'),
			to = today.clone().moveToDayOfWeek(0).addWeeks(7);
		
		
		
		
		
		var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider(),
			dataView = new Slick.Data.DataView({groupItemMetadataProvider: groupItemMetadataProvider});
			
		controller.set('dataView', dataView);
		controller.set('groupItemMetadataProvider', groupItemMetadataProvider);
		
		dataView.setGrouping([controller.get('groups').findBy('field', 'assignee')]);
		dataView.beginUpdate();
        dataView.setItems(controller.get('tasks.content'));
		dataView.setFilter(function(item, args) {
			if (!args) return true;
			
			if (args.range) {
				var range = args.range,
				from = range[0],
				to = range[1];
				
				if (!item.start.between(from, to) && !item.end.between(from, to)) {
					return false;
				}
			}
			
			return true;
		});
        dataView.endUpdate();
        
		var analyst = function(a, b) {
			return d3.ascending(a.analyst, b.analyst);
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
		
		//controller.set('range', [from, to]);
		
	},
	
	dataViewFilterFunction: function(item, args) {
		var range = args.range,
			from = range[0],
			to = range[1];
			
		return item.end.between(from, to);
	},
	
	
	fake: function(total) {
		var self = this,
			controller = self.controllerFor('application'),
			i = -1,
			now = Date.today(),
			campaigns = controller.get('campaigns'),
			analysts = controller.get('analysts'),
			types = controller.get('types'),
			result = [];
			
		while (++i < total) {
			var campaign = App.Random.select(campaigns.get('content')),
				created = now.clone().addDays(App.Random.within(-30, 0)),
				start = created.clone().addDays(App.Random.within(0, 30)),
				end = start.clone().addDays(App.Random.within(5, 20)),
				due = end.clone().addDays(App.Random.within(1, 15)),
				dueWeek = due.clone().getDay() === 1 ? due.clone() : due.clone().moveToDayOfWeek(1, -1);
			
			result.push(App.Task.create({
				id: i,
				type: App.Random.select(types),
				campaign: campaign,
				assignee: App.Random.select(analysts),
				created: created,
				start: start,
				end: end,
				due: due,
				dueWeek: dueWeek,
				score: App.Random.within(100, 1000)
			}));
		}
		return result;
	},
	
	
	actions: {
	
		addFake: function() {
			var self = this;
			
			self.controllerFor('tasks').addObject(self.controllerFor('application').get('fakePool').shiftObject());
		},
	
		restart: function(total) {
			var self = this;
			
			//self.set('controller.content', self.fake(App.Utils.Number(total) || 10));
			
		}
	
	}
	
	
	

});