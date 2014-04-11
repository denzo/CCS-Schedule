App.SwimLaneComponent = Em.Component.extend({

	tagName: 'svg',

	didInsertElement: function() {
		this.draw();
	},
	
	
	draw: function() {
		var self = this,
			data = self.get('data'),
			itemHeight = 10,
			maxWidth = 900,
			now = Date.today(),
			maxHeight = 200;
		
		var svg = d3.select(self.get('element'))
			.attr('width', maxWidth)
			.attr('height', maxHeight);
			
		var x = d3.time.scale()
			.domain([now, now.clone().addDays(90)])
			.range([0, maxWidth]);
			
		var items = svg.selectAll('rect')
			.data(data)
			.attr('x', function(d) { return x(d.start); })
			.attr('width', function(d) { return x(d.end) - x(d.start); });

		items.enter().append('rect')
			.attr('x', function(d) { return x(d.start); })
			.attr('width', function(d) { return x(d.end) - x(d.start); })
			.attr('height', itemHeight)
			.attr('fill', 'blue')
			.attr('opacity', 0.2)
			.attr('class', 'item');

		items.exit().remove();
		
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

});
