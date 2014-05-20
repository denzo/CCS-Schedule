App.SubmitCampaignView = Em.View.extend({


	campaignListObserver: function() {
		var self = this,
			searchable = self.get('controller.searchable');
		
		self.$('.campaign-search').typeahead({
			source: searchable.getEach('label'),
			updater: function(item) {
				self.get('controller').send('change', searchable.findBy('label', item).campaign);
			}
		});
	}.on('didInsertElement')
	


});