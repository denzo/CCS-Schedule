App.LoadRenderer = {

	render: function(container, data, width, height) {
	
		var self = this,
			itemHeight = 9,
			maxWidth = width,
			maxHeight = height,
			dayWidth = width / data.length,
			now = Date.today();
		
		var svg = d3.select(container).append('svg')
			.attr('class', 'load-vis')
			.attr('width', maxWidth)
			.attr('height', maxHeight);
			
		var x = d3.scale.identity()
			.domain([0, maxWidth])
			.range([0, maxWidth]);
			
		var day = svg.selectAll('rec .day')
			.data(data);
			
		day.enter().append('rect')
			.attr('class', function(d) {
				if (d === 0) {
					return 'day zero';
				}
				else if (d === 1) {
					return 'day one';
				}
				else if (d === 2) {
					return 'day two';
				}
				else if (d > 2) {
					return 'day three';
				}
			})
			.attr('x', function(d, i) { return x(i * dayWidth); })
			.attr('width', dayWidth)
			.attr('height', maxHeight);

		day.exit().remove();
		
		return $(container).html();
		
	}
	
}