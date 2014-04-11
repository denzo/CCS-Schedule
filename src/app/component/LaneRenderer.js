App.LaneRenderer = {

	render: function(container, data, from, totalDays) {
	
		var self = this,
			itemHeight = 9,
			maxWidth = $(container).width(),
			maxHeight = $(container).height(),
			now = from || Date.today(),
			top = 6;
		
		var svg = d3.select(container).append('svg')
			.attr('class', 'lane')
			.attr('width', maxWidth)
			.attr('height', maxHeight);
			
		var x = d3.time.scale()
			.domain([now, now.clone().addDays(totalDays)])
			.range([0, maxWidth]);
			
		var axis = svg.append('g')
			//.attr('transform', 'translate(' + 0 + ',' + 5 + ')')
			.attr('class', 'x axis')
			.call(d3.svg.axis()
				.scale(x)
				.orient('bottom')
				.ticks(d3.time.monday)
				.tickPadding(5)
				.tickSize(maxHeight)
				.tickFormat(function(d) { return d.toString('d MMM'); })
			)
			.selectAll('text')
				.attr('y', '5px')
				.attr('opacity', '0')
				.style('text-anchor', null);
			
		var due = svg.selectAll('line .due')
			.data([data]);

		due.enter().append('line')
			.style('stroke-dasharray', ('2, 2'))
			.style('stroke', '#999')
			.style('stroke-width', 1)
			.style('shape-rendering', 'crispEdges')
			.attr('x1', function(d) { return x(d.created); })
			.attr('x2', function(d) { return x(d.due); })
			.attr('y1', itemHeight / 2 + top)
			.attr('y2', itemHeight / 2 + top)
			.attr('height', itemHeight)
			.attr('fill', 'white')
			.attr('class', 'due');

		due.exit().remove();
		
		var duration = svg.selectAll('rect .duration')
			.data([data]);

		duration.enter().append('rect')
			.style('shape-rendering', 'crispEdges')
			.attr('x', function(d) { return x(d.start); })
			.attr('y', top)
			.attr('width', function(d) { return x(d.end) - x(d.start); })
			.attr('height', itemHeight)
			.attr('fill', function(d) {
				return '#ccccff';
				if (d.type === 'Development') {
					return '#b2ffb2';
				} else {
					return '#ccccff';
				}
			})
			//.attr('opacity', 0.2)
			.attr('class', 'duration');

		duration.exit().remove();
		
		
		var offset = 0;
		
		var drag = d3.behavior.drag()
			.on('dragstart', function() {
				var dragTarget = d3.select(this);
				offset = d3.event.sourceEvent.clientX - dragTarget.attr('x');
			})
			.on('drag', function() {
				var dragTarget = d3.select(this);
				dragTarget.attr('x', d3.event.x - offset);
			})
			.on('dragend', function() {
				//alert('boom');
			});
		
		d3.selectAll('.item').call(drag);	
	
	}
	
}