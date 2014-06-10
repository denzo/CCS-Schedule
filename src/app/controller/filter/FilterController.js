App.FiltersController = Em.ArrayController.extend({

	itemController: 'filter',
	
	selected: Em.computed.filterBy('@this', 'selected', true),
	
	selectedDimensions: Em.computed.mapBy('selected', 'dimension'),
	
	selectedUniqDimensions: Em.computed.uniq('selectedDimensions'),
	
	
	selectFilter: function(value) {
		var self = this;
		
		self.findBy('value', value).set('selected', true);
	},
	
	deselectFilter: function(value) {
		var self = this;
		
		self.findBy('value', value).set('selected', false);
	},
	
	addFilter: function(group, dimension, values) {
		var self = this;
		self.addObjects(values.map(function(value) { return {group:group, dimension: dimension, value:value}; }));
		return self; // just for chaining
	},
	
});

App.FilterController = Em.ObjectController.extend({

	
	selected: false
	
	
});


