App.LaneRendererNew = {

	render: function(container, task, from, to) {
	
		var self = this,
			itemHeight = 9,
			maxWidth = 560, //$(container).width(),
			maxHeight = $(container).height(),
			now = from || Date.today(),
			top = 6;
			
		var range = App.Utils.weekdayRange(from, to);
		
		var svg = d3.select(container).append('svg')
			.attr('class', 'lane')
			.attr('width', maxWidth)
			.attr('height', maxHeight);
			
		var duration = svg.selectAll('rect .duration')
			.data(range);

		duration.enter().append('rect')
			.style('shape-rendering', 'crispEdges')
			.attr('x', function(d, i) { return i * maxWidth / range.length; })
			.attr('y', top)
			.attr('width', maxWidth / range.length)
			.attr('height', itemHeight)
			.attr('fill', function(d) { return task.isOnDate(d) ? '#ccccff' : '#ffffff'; })
			//.attr('opacity', 0.2)
			.attr('class', 'duration');

		duration.exit().remove();
	
	}
	
}