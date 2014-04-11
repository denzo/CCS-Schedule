Ember.Handlebars.registerBoundHelper('scheduleDate', function(value) {
	return value ? value.toString('ddd, d MMM') : null;
});

Ember.Handlebars.registerBoundHelper('humanDateHint', function(value) {
	return value ? App.Utils.humanDateHint(value) : null;
});

Ember.Handlebars.registerBoundHelper('shortDate', function(value) {
	return value ? value.toString('d MMM yyyy') : null;
});

Ember.Handlebars.registerBoundHelper('fullDate', function(value) {
	return value ? value.toString('dS of MMMM, yyyy') : null;
});

Ember.Handlebars.registerBoundHelper('fullDateWithWeekday', function(value) {
	return value ? value.toString('dddd, dS of MMMM yyyy') : null;
});

Ember.Handlebars.registerBoundHelper('year', function(value) {
	return value ? value.toString('yyyy') : null;
});

Ember.Handlebars.registerBoundHelper('fromNow', function(value) {
	return value ? moment(value).fromNow() : null;
});

Ember.Handlebars.registerBoundHelper('plurizeCampaign', function(value) {
	return value && value > 1 ? 'campaigns' : 'campaign';
});

Ember.Handlebars.registerBoundHelper('dollar', function(value) {
	return accounting.formatMoney(value);
});

Ember.Handlebars.registerBoundHelper('fullDollar', function(value) {
	return accounting.formatMoney(value, '$', 0);
});

Ember.Handlebars.registerBoundHelper('number', function(value) {
	return accounting.formatNumber(value, 2);
});

Ember.Handlebars.registerBoundHelper('integer', function(value) {
	return accounting.formatNumber(value);
});

Ember.Handlebars.registerBoundHelper('percent', function(value) {
	return accounting.formatMoney(Number(value * 100), {symbol:'%'});
});

Ember.Handlebars.registerBoundHelper('roi', function(value) {
	return accounting.formatMoney(Number(value * 100), '%', 0);
});

Ember.Handlebars.registerBoundHelper('shortestDate', function(value) {
	return value ? value.toString('d MMM') : null;
});

Ember.Handlebars.registerBoundHelper('join', function(value) {
	return value ? value.getEach('title').join(', ') : null;
});

Ember.Handlebars.registerBoundHelper('userName', function(user) {
	return App.Utils.getUserName(user);
});

Ember.Handlebars.registerBoundHelper('html', function(text) {
	return text ? new Handlebars.SafeString(text.replace(/\n/g, '</br>')) : null;
});

Ember.Handlebars.registerBoundHelper('humanBoolean', function(value) {
	return App.Utils.humanBoolean(value);
});

Ember.Handlebars.registerBoundHelper('capitalize', function(value) {
	return value ? value.capitalize() : null;
});

Ember.Handlebars.registerBoundHelper('toFixed', function(value) {
	return value && isFinite(value) ? value.toFixed(2) : 0;
});

Ember.Handlebars.registerBoundHelper('limit', function(value) {
	
	var limit = 100;
	
	if (value) {
		return value.length > limit ? (value.substring(0, limit) + '...') : value;
	} else {
		return null;
	}
});
