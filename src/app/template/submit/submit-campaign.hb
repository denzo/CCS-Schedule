<script data-template-name="submit/campaign" type="text/x-handlebars">
	<div class="form-horizontal" style="background:rgba(0,255,0,0.1);padding:25px;">
		<h2>Add campaign task</h2>
		<div class="control-group">
			<label class="control-label">Campaign Search</label>
			<div class="controls">
				<input class="campaign-search" type="text" placeholder="Search by campaign name or id" autocomplete="off">
			</div>
		</div>
		<div class="control-group">
			<div class="controls">
				<h4>{{selectedCampaign.title}}</h4>
			</div>
		</div>
		<div class="control-group">
			<label class="control-label">Type</label>
			<div class="controls">
				{{view Ember.Select contentBinding="campaignTaskTypes" valueBinding="type"}}
			</div>
		</div>
		<div class="control-group">
			<label class="control-label">Estimated effort</label>
			<div class="controls">
				{{input value=duration}}
				<small class="muted" style="padding-left: 5px;">days</small>
			</div>
		</div>
		<div class="control-group">
			<label class="control-label">Due date</label>
			<div class="controls">
				<input id="start-date-display" {{bind-attr value=view.formattedStartDate}} type="text"/>
			</div>
		</div>
		
		<div class="form-actions">
			<button class="btn btn-primary btn-save" {{action findAssignee this}}>Find assignee</button>
		</div>
	</form>
</script>
