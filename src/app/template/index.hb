<script data-template-name="index" type="text/x-handlebars">
	{{link-to 'Add task' 'submit' class="btn btn-primary"}}
	<button class="btn btn-primary btn-save" {{action addFake}}>Add fake</button>
	<div>
	{{#each assignee in assignees}}
		{{assignee.assignee}} ({{tasks.length}}) | 
	{{/each}}
	</div>
	<h1>CCS Schedule {{scheduleDate from}} &mdash; {{scheduleDate to}} ({{duration}} {{durationsLabel}})</h1>
	<div>
		<div class="interface">
			<button {{action 'collapseAll'}}>Collapse all</button>
			<button {{action 'expandAll'}}>Expand all</button>
		</div>
		<div class="interface">
			Group by: 
			<button {{action 'groupBy' 'assignee'}}>Analyst</button>
			<button {{action 'groupBy' 'campaign.portfolio'}}>Portfolio</button>
			<button {{action 'groupBy' 'campaign.title'}}>Campaign</button>
			<button {{action 'groupBy' 'type'}}>Type</button>
		</div>
		<div style="padding: 10px;margin-top:-15px;display:inline-block;">{{#each typeTotals}}{{type}}: {{slots}}, {{/each}}</div>
	</div>
	<br>
	<div style="width: 1140px;position:relative;height:32px;">
		<div style="display:inline-block;right:29px;position:absolute;">
			<div>{{time-range change="updateFromTo" changeEnd="updateTimeRange" barWidth=9 future=future minRange=from maxRange=to}}</div>
			<div>{{detailed-time-range minRange=from maxRange=to}}</div>
		</div>
	</div>
	{{dynamic-slick-grid dataView=dataView columns=columns groupItemMetadataProvider=groupItemMetadataProvider range=range}}
	<div style="padding:15px;border:1px solid orange;display:inline-block;">
	{{#if request}}{{request.title}} {{request.portfolio}} (due on {{shortDate request.due}}, estimate {{request.duration}} days, score {{request.score}}){{/if}}
	<button {{action 'randomize'}}>Randomize</button> <button {{action 'getSuggestions' request}}>Get suggestions</button>
	{{#if suggestions.length}}
		{{#each suggestions}}
			<li><button {{action 'addRequest' this}}>Select</button>
				{{analyst}} - {{shortDate start}}
				{{#if replace}}
					<small style="color:red;">Replace: {{replace.title}}</small>
				{{/if}}
			</li>
		{{/each}}
	{{/if}}
	{{#if delayed}}
		<hr>
		<div style="color:orange;font-weight:bold;">
		{{#with delayed}}
			Proposed due date: {{shortDate newDue}} (delayed by {{diff}} days) > {{analyst}} - {{shortDate start}}
			{{#if replace}}
				<small style="color:red;">Replace: {{replace.title}})</small>
			{{/if}}
			<button {{action 'addRequestWithDelay' this}}>Select</button>
		{{/with}}
		</div>
	{{/if}}
	</div>
	
	<div style="padding-top:25px;">{{input value=total}} <button {{action 'restart' total}}>Restart</button></div>
</script>

<!-- 
	<button {{action 'groupBy' 'dueWeek'}}>Due week</button>
	<button {{action 'groupByPortfolioDueDate'}}>Portfolio then due week</button>
-->
