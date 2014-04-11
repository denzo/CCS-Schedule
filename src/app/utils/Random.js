App.Random = Em.Object.extend({

});

App.Random.reopenClass({

	within: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
    },

	select: function(collection) {
		return collection[App.Random.within(0, collection.length - 1)];
	}


});