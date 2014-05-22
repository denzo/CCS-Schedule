App.SubmitCampaignController = Em.ObjectController.extend({

	needs: ['application'],

	categories: ['pre-analysis', 'development', 'reporting', 'PIR', 'Other'],
	
	campaigns: Em.computed.alias('controllers.application.campaigns'),
	
	searchable: function() {
	
		return this.get('campaigns').filterBy('change', false).map(function(campaign) {
			return {
				label: campaign.get('title') + (campaign.get('marketingID.length') ? (' ' + campaign.get('marketingID')) : ''),
				campaign: campaign
			};
		});
	
	}.property('campaigns.@each.title', 'campaigns.@each.marketingID'),
	
	actions: {
	
		change: function(campaign) {
			this.set('campaign', campaign);
		}
	
	}

});