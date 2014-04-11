App.DetailedTimeRangeComponent = Em.Component.extend({
	
	tagName: 'svg',
	
	classNames: ['detailed-time-range'],
	
	didInsertElement: function() {
		var self = this;
		self.draw();
	},
	
	minRange: null,
	maxRange: null,
	
	redraw: function() {
		var self = this;
		self.$().empty();
		self.draw();
	},
	
	rangeObserver: function() {
		var self = this;
		self.redraw();
	}.observes('minRange', 'maxRange'),
	
	width: 540,
	
	draw: function() {
		var self = this,
			today = Date.today(),
			minRange = self.get('minRange'),
			maxRange = self.get('maxRange'),
			height = 20,
			width = self.get('width');
		
		
		var svg = d3.select(self.get('element'))
			.attr('width', width)
			.attr('height', height);
				
				
		var time = d3.time.scale()
			.domain([minRange, maxRange])
			.range([0, width]);
			
		var bg = svg.append('rect')
			.attr('class', 'bg')
			.attr('width', width)
			.attr('height', height);
			
		var current = svg.append('rect')
			.attr('class', 'current')
			.attr('width', time(minRange.clone().addWeeks(1)))
			.attr('height', height)
			.attr('x', time(d3.time.monday(today)));
			
		var detailedAxis = d3.svg.axis()
			.scale(time)
			.orient('bottom')
			.ticks(d3.time.monday)
			.tickSize(height)
			.tickFormat(function(d) { return d.toString('d MMM'); });
			
			
		var gDetailedAxis = svg.append('g')
			.attr('class', 'x axis detailed-axis')
			.call(detailedAxis);


		gDetailedAxis
			.selectAll('text')
				.attr('y', '5px')
				.attr('x', '5px')
				.style('text-anchor', null);
				
				
			
	}
	
});
