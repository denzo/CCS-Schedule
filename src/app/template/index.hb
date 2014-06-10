<script data-template-name="index" type="text/x-handlebars">
	<h1>CCS Schedule {{scheduleDate from}} &mdash; {{scheduleDate to}} ({{duration}} {{durationsLabel}}) <small class="muted">{{tasks.inRange.length}}</small></h1>
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
			<button {{action 'groupBy' 'category'}}>Category</button>
			<!--
			<button {{action 'groupBy' 'monthStart'}}>Started in month</button>
			<button {{action 'groupBy' 'monthEnd'}}>Ended in month</button>
			<button {{action 'groupBy' 'weekStart'}}>Started in week</button>
			<button {{action 'groupBy' 'weekEnd'}}>Ended in week</button>
			-->
		</div>
	</div>
	<br>
	<div style="width: 1140px;position:relative;height:32px;">
		<div style="display:inline-block;left:532px;position:absolute;">
			<div>{{time-range change="updateFromTo" changeEnd="updateTimeRange" barWidth=9 future=future minRange=from maxRange=to}}</div>
			<div>{{detailed-time-range minRange=from maxRange=to}}</div>
		</div>
	</div>
	{{multi-filter options=controllers.filters selected=controllers.filters.selected itemAdded="selectFilter" itemRemoved="deselectFilter"}}
	{{dynamic-slick-grid dataView=tasks.dataView columns=columns groupItemMetadataProvider=tasks.groupItemMetadataProvider range=range}}
	<hr>
	<div style="padding: 10px;margin-top:-15px;"><b>Split by analyst: </b>{{#each assignee in assignees}} {{assignee.name}}: {{assignee.tasksInRange.length}}, {{/each}}</div>
	<div style="padding: 10px;margin-top:-15px;"><b>Split by category: </b>{{#each taskReport in taskReports.category}}{{taskReport.reportPropertyValue}}: {{taskReport.total}} ({{taskReport.slots}}), {{/each}}</div>
	<div style="padding: 10px;margin-top:-15px;"><b>Split by portfolio: </b>{{#each taskReport in taskReports.portfolio}}{{taskReport.reportPropertyValue}}: {{taskReport.total}} ({{taskReport.slots}}), {{/each}}</div>
	<div style="padding: 10px;margin-top:-15px;"><b>Split by objective: </b>{{#each taskReport in taskReports.objective}}{{taskReport.reportPropertyValue}}: {{taskReport.total}} ({{taskReport.slots}}), {{/each}}</div>
</script>

<!-- 
	<button {{action 'groupBy' 'dueWeek'}}>Due week</button>
	<button {{action 'groupByPortfolioDueDate'}}>Portfolio then due week</button>
	
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
-->
