App.MultiFilterComponent = Em.Component.extend({

	options: null,
	selected: null,

	
	optionsObserver: function() {
		Em.run.once(this, 'setupFilters');
	}.observes('options').on('init'),
	
	
	selectedObserver: function() {
		Em.run.once(this, 'setupFilters');
	}.observes('selected').on('init'),
	
	
	setupFilters:  function() {
		var self = this,
			options = self.get('options.content'),
			values = self.get('selected').getEach('value');
		
		var selectize = self.$('.filter').selectize({
			optgroupValueField: 'group',
			labelField: 'value',
			valueField: 'value',
			searchField: ['value'],
			options: options,
			items: values,
			openOnFocus: false,
			onItemAdd: function(value, $item) {
				this.close();
				self.sendAction('itemAdded', value);
			},
			onItemRemove: function(value) {
				var selectize = this;
				Em.run.next(self, function() { selectize.close(); });
				self.sendAction('itemRemoved', value);
			},
			render: {
				/*
				item: function(item, escape) {
					return '<div>' +
						(item.name ? '<span class="name">' + escape(item.name) + '</span>' : '') +
						(item.email ? '<span class="email">' + escape(item.email) + '</span>' : '') +
					'</div>';
				},
				*/
				option: function(item, escape) {
					var label = item.name || item.email;
					var caption = item.name ? item.email : null;
					return '<div>' + item.value + '<br><small class="muted">' + item.group + '</small></div>'; 
				}
			}
		});
		
	}

});
