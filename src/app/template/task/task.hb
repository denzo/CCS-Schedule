<script data-template-name="task" type="text/x-handlebars">
	<div class="content-top">
		<h3>{{category}} for {{campaign.title}}</h3>
		{{link-to 'Edit' 'task.edit' this class="btn"}}
		<button class="btn btn-danger" {{action "removeTask" this}}>Delete</button>
		<hr>
	</div>
	<div class="content campaign">
		{{outlet}}
	</div>
</script>
