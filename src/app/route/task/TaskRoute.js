App.TaskRoute = Em.Route.extend({

	model: function(params) {
		return App.Task.find(params.ID);
	}
	
});
		