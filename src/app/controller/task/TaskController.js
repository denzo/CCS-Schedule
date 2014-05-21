App.TaskController = Em.ArrayController.extend({

	/**
	* Determines if a task is for an existing project.
	*
	* If the creation date of the task is after the project's due date
	* this means the task is for an existing project.
	*/
	isForExistingProject: function() {
		return this.get('created').isAfter(
			this.get('project.isCampaign') ? 
				this.get('project.campaign.dueDate') : 
				this.get('project.dueDate'));
	
	}.property('project.dueDate', 'project.isCampaign', 'project.campaign.dueDate')

});