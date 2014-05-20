App.IndexRoute = Em.Route.extend({

	model: function() {
		var self = this;
	
		return App.Campaign.fetch().then(function() {
			return self.fake(5);
		});
	},
	
	setupController: function(controller, model) {
		this._super(controller, model);
		
		var self = this;
		
		var groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider(),
			dataView = new Slick.Data.DataView({groupItemMetadataProvider: groupItemMetadataProvider});
			
		dataView.setGrouping([{getter: 'analyst'}]);
		dataView.beginUpdate();
        dataView.setItems(model);
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
		
		today = Date.today(),
		from = today.getDay() === 1 ? today.clone() : today.clone().moveToDayOfWeek(1, -1),
		to = today.clone().moveToDayOfWeek(0).addWeeks(7);
		
		controller.set('dataView', dataView);
		controller.set('groupItemMetadataProvider', groupItemMetadataProvider);
		
		controller.set('range', [from, to]);
		
		controller.set('portfolios', self.get('portfolios'));
		controller.set('types', self.get('types'));
		controller.set('objectives', self.get('objectives'));
		
		
		controller.set('campaignList', App.Campaign.find());
		
		
	},
	
	dataViewFilterFunction: function(item, args) {
		var range = args.range,
			from = range[0],
			to = range[1];
			
		return item.end.between(from, to);
	},
	
	
	portfolios: function() {
		return ['Credit Cards', 'Home Loans', 'Forex', 'Personal Loans', 'Business'];
	}.property(),
	
	
	objectives: function() {
		return ['Acquisition', 'Compliance', 'Service', 'Retention', 'Usage'];
	}.property(),
	
	
	types: function() {
		return ['Pre-analysis', 'Development', 'PIR', 'Misc'];
	}.property(),
	
	
	
	
	campaigns: function(total) {
	
		var self = this,
			i = -1,
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
	
	analysts: function() {
		var all = ['Benjamin Zhan', 'Vicki Wood', 'Deniss Alimovs', 'Nancy Macolino', 'Maurice Ky', 'Lilly Truong', 'Gustavo Lummertz', 'Andrew Down', 'Helen Chau', 'Deepti Bellavi', 'Peter Gebhardt', 'Louis Tranquille', 'Ying Guang'];
		//var all = ['Benjamin Zhan'],
		//var all = ['Benjamin Zhan', 'Vicki Wood', 'Deniss Alimovs'];
		
		return all;
	}.property(),


	fake: function(total) {
		var self = this,
			i = -1,
			now = Date.today(),
			campaigns = self.campaigns(50),
			analysts = self.get('analysts'),
			types = self.get('types'),
			result = [];
			
		while (++i < total) {
			var campaign = App.Random.select(campaigns),
				created = now.clone().addDays(App.Random.within(-30, 0)),
				start = created.clone().addDays(App.Random.within(0, 30)),
				end = start.clone().addDays(App.Random.within(5, 20)),
				due = end.clone().addDays(App.Random.within(1, 15)),
				dueWeek = due.clone().getDay() === 1 ? due.clone() : due.clone().moveToDayOfWeek(1, -1);
			
			result.push(Em.Object.create({
				id: i,
				type: App.Random.select(types),
				title: campaign.title,
				portfolio: campaign.portfolio,
				objective: campaign.objective,
				analyst: App.Random.select(analysts),
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
	
		restart: function(total) {
			var self = this;
			
			self.set('controller.content', self.fake(App.Utils.Number(total) || 10));
			
		}
	
	}
	
	
	

});