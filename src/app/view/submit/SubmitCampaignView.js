App.SubmitCampaignView = Em.View.extend({

	didInsertElement: function() {
		var self = this;
		
		self.$('.duration').slider({
			min: 1,
			max: 90,
			value: self.get('controller.duration'),
			slide: function(event, ui) {
				self.set('controller.duration', ui.value);
			}
		});
		
		self.$('.due').slider({
			min: 1,
			max: 90,
			value: App.Utils.daysDiff(Date.today(), self.get('controller.due')),
			slide: function(event, ui) {
				self.set('controller.due', Date.today().addDays(ui.value));
			}
		});
	
	},
	
	
	




	campaignListObserver: function() {
		var self = this,
			searchable = self.get('controller.searchable');
		
		self.$('.campaign-search').typeahead({
			source: searchable.getEach('label'),
			updater: function(item) {
				self.get('controller').send('change', searchable.findBy('label', item).campaign);
			}
		});
	}.on('didInsertElement'),
	
	actions: {
	
		helpMeZZZ: function() {
			console.log('SubmitCampaignView.helpMe');
		}
	
	}

});