<script data-template-name="task/edit" type="text/x-handlebars">
	<div>
		Effort: {{input value=duration}}
	</div>
	<button class="btn btn-primary btn-save" {{action "updateTask" this}}>Save</button>
</script>
