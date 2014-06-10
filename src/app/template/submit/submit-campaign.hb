<script data-template-name="submit/campaign" type="text/x-handlebars">
	<div class="form-horizontal" style="background:rgba(0,255,0,0.1);padding:25px;">
		<h2>Add campaign task</h2>
		<div class="control-group">
			<label class="control-label">Campaign Search</label>
			<div class="controls">
				<input class="campaign-search" type="text" placeholder="Search by campaign name or id" autocomplete="off">
				<h4 style="margin-bottom: 0;">{{campaign.title}}</h4>
				{{#if campaign}}{{campaign.portfolio}}, {{campaign.product}}, {{campaign.objective}}{{/if}}
			</div>
		</div>
		<div class="control-group">
			<label class="control-label">Type</label>
			<div class="controls">
				{{view Ember.Select content=categories value=category}}
			</div>
		</div>
		<div class="control-group">
			<label class="control-label">Estimated effort</label>
			<div class="controls" style="padding-top: 5px;">
				{{duration}} <small class="muted" style="padding-left: 5px;">days</small>
				<div class="duration" style="width: 220px; margin-top: 5px;"></div>
			</div>
		</div>
		<div class="control-group">
			<label class="control-label">Due date</label>
			<div class="controls" style="padding-top: 5px;">
				{{shortDate due}}
				<div class="due" style="width: 220px; margin-top: 5px;"></div>
			</div>
		</div>
		
		<div class="form-actions">
			<button class="btn btn-primary btn-save" {{action "getSuggestions" this}}>Get suggestions</button>
		</div>
		
		{{#each suggestion in suggestions}}
			<button class="btn" {{action "applySuggestion" suggestion}}>{{suggestion.assignee}} {{shortestDate suggestion.option.start}} {{#if suggestion.delay}}<span style="color:red;">(delayed by {{suggestion.delay}} days)</span>{{/if}}</button>
		{{/each}}
	</form>
</script>
