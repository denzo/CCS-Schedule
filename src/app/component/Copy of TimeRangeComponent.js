App.OldTimeRangeComponent = Em.Component.extend({
	
	tagName: 'svg',
	
	classNames: ['time-range'],
	
	didInsertElement: function() {
		var self = this;
		self.draw();
	},
	
	redraw: function() {
		var self = this;
		
		self.$().empty();
		self.draw();
	},
	
	margin: function() {
	
		return {
			top: this.get('marginTop') || 0,
			bottom: this.get('marginBottom') || 0,
			left: this.get('marginLeft') || 0,
			right: this.get('marginRight') || 0
		};
	
	}.property('marginTop', 'marginBottom', 'marginLeft', 'marginRight'),
	
	
	rangeObserver: function() {
		this.redraw();
	}.observes('range'),
	
	
	maxHeight: 50,
	future: 8,
	totalWeeks: 52,
	gapV: 1,
	gapH: 1,
	color: '#96AAd9',
	barWidth: 5,
	barHeight: 6,
	
	
	maxDate: function() {
		return Date.today().moveToDayOfWeek(0).addWeeks(this.get('future'));
	}.property('future'),
	
	minDate: function() {
		return this.get('maxDate').clone().moveToDayOfWeek(1, -1).addWeeks(-this.get('totalWeeks'));
	}.property('maxDate', 'totalWeeks'),
	

	draw: function() {
		var self = this,
			maxHeight = self.get('maxHeight'),
			future = self.get('future'),
			today = Date.today(),
			totalWeeks = self.get('totalWeeks'),
			maxDate = self.get('maxDate'),
			minDate = self.get('minDate'),
			margin = self.get('margin'),
			minRange = self.get('minRange') || self.get('maxDate').clone().moveToDayOfWeek(1, -1).addWeeks(-future),
			maxRange = self.get('maxRange') || maxDate,
			data = [], // self.populateWeeklySplit(self.createWeeklySplit(totalWeeks, future), self.get('requests')),
			request = {width: self.get('barWidth'), height: self.get('barHeight'), gapV: self.get('gapV'), gapH: self.get('gapH')},
			max = d3.max(data.getEach('requests.length')) || 0,
			maxChartHeight = Math.max(max * (request.height + request.gapV), 25),
			width = totalWeeks * (request.width + request.gapH),
			height = maxHeight - margin.top - margin.bottom,
			range = [minRange, maxRange];
		
		
		
		// TODO: explain the pixel perfect magic
		var time = d3.time.scale().domain([minDate, maxDate]).rangeRound([0, width]);
		var q = d3.scale.quantize().domain([0, width]).range(d3.range(0, width, (request.width + request.gapH)));
		function x(date) { return q(time(date)); }
		// END TODO
		
		
		
		var svg = d3.select(self.get('element'))
			.attr('width', width)
			.attr('height', height);
		
		
		var brush = d3.svg.brush()
			.x(q)
			.on('brush', brushed)
			.on('brushend', brushEnd);
		
		var gBrush = svg.append('g')
			.attr('class', 'brush')
			.call(brush);
		
		gBrush.selectAll('rect')
			.attr('height', maxChartHeight + margin.top);
		
		
		
		var chart = svg.append('g')
			.attr('class', 'chart')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		
		var overlayLeft = chart.append('rect')
			.attr('class', 'overlay left')
			.attr('height', maxChartHeight);

		var overlayRight = chart.append('rect')
			.attr('class', 'overlay right')
			.attr('height', maxChartHeight);

		var darkenLeft = chart.append('rect')
			.attr('class', 'darken left')
			.attr('height', maxChartHeight);

		var darkenRight = chart.append('rect')
			.attr('class', 'darken right')
			.attr('height', maxChartHeight);

		var leftHandle = chart.append('rect')
			.attr('class', 'left-handle')
			.attr('width', 1)
			.attr('height', maxChartHeight);

		var rightHandle = chart.append('rect')
			.attr('class', 'right-handle')
			.attr('width', 1)
			.attr('height', maxChartHeight);

		var brushLength = svg.append('rect')
			.attr('class', 'brush-length')
			.attr('height', 2);

		var axis = svg.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + (margin.top + maxChartHeight) + ')')
			.attr('class', 'x axis')
			.call(d3.svg.axis()
				.scale(time)
				.orient('bottom')
				.ticks(d3.time.month)
				.tickPadding(0)
				.tickSize(0)
				.tickFormat(function(d) { return d.toString('MMM'); })
			)
			.selectAll('text')
				.attr('y', '5px')
				.style('text-anchor', null);
				
		var current = svg.append('rect')
			.attr('class', 'current')
			.attr('width', request.width - request.gapH)
			.attr('height', maxChartHeight)
			.attr('x', x(today));
			

		position(range);
		gBrush.call(brush.extent([x(minRange), x(maxRange)]));
		
		function position(extent) {
		
			d3.select('.left-handle').attr('x', x(extent[0]) - 1);
			d3.select('.right-handle').attr('x', x(extent[1]) - 1);
			
			d3.selectAll('.left').attr('width', x(extent[0]));
			
			d3.selectAll('.right').attr('x', x(extent[1]));
			d3.selectAll('.right').attr('width', width - x(extent[1]));
			
			d3.selectAll('.brush-length').attr('x', x(extent[0]));
			d3.selectAll('.brush-length').attr('width', x(extent[1]) - x(extent[0]));
		
		}
		
		
		function round(extent) {
			return [
				q(extent[0]),
				q(extent[1])
			];
		}


		function brushEnd() {
		
			var rounded = round(brush.extent());
				convertedToDates = convertToDates(rounded);
				
			self.sendAction('changeEnd', convertedToDates);
		}
		
		
		function brushed() {
			var rounded = round(brush.extent());
				convertedToDates = convertToDates(rounded);
			
			// update brush
			d3.select(this).call(brush.extent(rounded));
			
			// update positions
			position(convertedToDates);
			
			// we need to convert the brush's extent into dates before sending 'change' action
			self.sendAction('change', convertedToDates);
		}
		
		
		function convertToDates(extent) {
			return [
				d3.time.monday.ceil(time.invert(extent[0])),
				d3.time.monday.ceil(time.invert(extent[1])).moveToDayOfWeek(0, -1)
			];
		}
	
	
	},
	
	
	createWeeklySplit: function(total, future) {
		var result = [],
			today = Date.today().getDay() === 1 ? Date.today() : Date.today().moveToDayOfWeek(1, -1), // move to last Monday
			i = -1;
			
		while (++i < total) {
			result.push({
				date: today.clone().addWeeks(future).addWeeks(i - total + 1),
				requests: []
			});
		}
		
		return result;
	},
	
	
	populateWeeklySplit: function(weeklySplit, requests) {
	
		requests.forEach(function(request) {
		
			var created = request.get('dueDate').getDay() === 1 ? 
				request.get('dueDate').clone().clearTime() : 
				request.get('dueDate').clone().clearTime().moveToDayOfWeek(1, -1);
		
			var week = weeklySplit.find(function(item) {
				return Date.equals(item.date, created);
			});
			
			if (week) week.requests.addObject(request);
		
		});
		
		return weeklySplit;
	}

});