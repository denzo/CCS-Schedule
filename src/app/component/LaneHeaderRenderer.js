App.LaneHeaderRenderer = {

	render: function(from, totalDays, listener) {
	
		var self = this,
			itemHeight = 9,
			container = document.createElement("div"),
			maxWidth = 560,
			maxHeight = 30,
			now = from || Date.today();
		
		var svg = d3.select(container).append('svg')
			.attr('class', 'lane')
			.attr('width', maxWidth)
			.attr('height', maxHeight);
			
		var x = d3.time.scale()
			.domain([now, now.clone().addDays(totalDays)])
			.range([0, maxWidth]);
			
		var axis = svg.append('g')
			.attr('class', 'x axis')
			.call(d3.svg.axis()
				.scale(x)
				.orient('bottom')
				.ticks(d3.time.monday)
				.tickPadding(10)
				.tickSize(maxHeight)
				.tickFormat(function(d) { return d.toString('d MMM'); })
			)
			.selectAll('text')
				.attr('y', '5px')
				.attr('x', '5px')
				.style('text-anchor', null);
				
		return $(container).html();
	
	}
	
}