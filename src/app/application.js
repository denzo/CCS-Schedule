App = Em.Application.create();

App.deferReadiness();

App.Router.map(function() {

	this.resource('submit', function() {
		this.route('campaign');
		this.route('project');
	});
	
});
