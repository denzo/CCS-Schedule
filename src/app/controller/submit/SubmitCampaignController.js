App.SubmitCampaignController = Em.ObjectController.extend({

	needs: ['application', 'suggestions'],

	categories: Em.computed.alias('controllers.application.categories'),
	campaigns: Em.computed.alias('controllers.application.campaigns'),
	suggestions: Em.computed.alias('controllers.suggestions'),
	assignees: Em.computed.alias('controllers.assignees'),
	
	ninjas: Em.computed.alias('controllers.application.ninjas'),
	
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
		},
		
		helpMe: function() {
			console.log('App.SubmitCampaignController.actions.helpMe');
		}
	
	}

});