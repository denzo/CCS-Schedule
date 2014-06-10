App.SPAdapter = Ember.RESTAdapter.extend({
 
	webURL: "http://myteamspace.cba/sites/rbs/DDM",
	
	
	find: function(record, id) {
		var self = this,
			query = "<Query><Where><Eq><FieldRef Name='ID'/><Value Type='Number'>" + id + "</Value></Eq></Where></Query>",
			deferred = $.Deferred(),
			keys = record.constructor.getAttributes();
		
		$().SPServices({
			operation: "GetListItems",
			webURL: self.get('webURL'),
			listName: record.constructor.url,
			CAMLQuery: query,
			completefunc: function(response, status) {
				if (self._success(status)) {
					self.didFind(record, id, self.parse(response, record.constructor).get(0));
					deferred.resolve(record);
				} else {
					deferred.fail();
				} 
			}
		});
		
		return deferred.promise();
	},
	
	
	findMany: function(klass, records, ids) {
		var self = this,
            deferred = $.Deferred();

		// YES SharePoint's CAML is case sensitive (OMG!)
		var query = $('<Result><Query><Where>' + self._inClause(ids) + '</Where><Query/></Result>').html()
			.replace(/query/g, 'Query')
			.replace(/where/g, 'Where')
			.replace(/or/g, 'Or')
			.replace(/eq/g, 'Eq')
			.replace(/fieldref/g, 'FieldRef')
			.replace(/name/g, 'Name')
			.replace(/type/g, 'Type')
			.replace(/value/g, 'Value');
 
		$().SPServices({
			operation: "GetListItems",
			webURL: self.get('webURL'),
			listName: klass.url,
			CAMLQuery: query,
			completefunc: function(response, status) {
				if (self._success(status)) {
					self.didFindAll(klass, records, self.parse(response, klass));
					deferred.resolve(records);
				} else {
					deferred.fail();
				}
			}
		});
		
		return deferred.promise();
	},
	
	
	findAll: function(klass, records) {
		var self = this,
			deferred = $.Deferred();
		
		$().SPServices({
			operation: "GetListItems",
			webURL: self.get('webURL'),
			listName: klass.url,
			completefunc: function (response, status) {
				if (self._success(status)) {
					self.didFindAll(klass, records, self.parse(response, klass));
					deferred.resolve(records);
				} else {
					deferred.fail();
				}
			}
		});
		
		return deferred.promise();
	},

	
	saveRecord: function(record) {
		var self = this,
			deferred = $.Deferred();
		
		$().SPServices({
			operation: "UpdateListItems",
			webURL: self.get('webURL'),
			listName: record.constructor.url,
			batchCmd: "Update",
			ID: record.getPrimaryKey(),
			valuepairs: self.serialize(record),
			completefunc: function (response, status) {
				if (self._success(status)) {
					self.didSaveRecord(record, self.parse(response, record.constructor).get(0));
					deferred.resolve(record);
				} else {
					deferred.fail();
				}
			}
		});
		
		return deferred.promise();
	},
	
	
	createRecord: function(record) {
		var self = this,
			deferred = $.Deferred();
		
		$().SPServices({
			operation: "UpdateListItems",
			webURL: self.get('webURL'),
			listName: record.constructor.url,
			batchCmd: "New",
			valuepairs: self.serialize(record),
			completefunc: function (response, status)  {
				if (self._success(status)) {
					self.didCreateRecord(record, self.parse(response, record.constructor).get(0));
					deferred.resolve(record);
				} else {
					deferred.fail();
				}
			}
		});
		
		return deferred.promise();
	},

	
	deleteRecord: function(record) {
		var deferred = $.Deferred(),
			self = this;
		
		$().SPServices({
			operation: "UpdateListItems",
			batchCmd: "Delete",
			webURL: self.get('webURL'),
			listName: record.constructor.url,
			ID: record.getPrimaryKey(),
			completefunc: function (response, status) {
				if (self._success(status)) {
					self.didDeleteRecord(record, self.parse(response, record.constructor).get(0));
					deferred.resolve(record);
				} else {
					deferred.fail();
				}
			}
		});

		return deferred.promise();
	},

	
	/**
	* A method that will check that all the properties exist on the server.
	*
	* @param model looks like this App.Campaign for example
	*/
	check: function(Model) {
		var self = this,
			relationships = Model.getRelationships().map(function(item) { return Model.metaForProperty(item).options.key; }),
			attributes = Model.getAttributes(),
			allModelFields = relationships.concat(attributes),
			deferred = $.Deferred();
		
		$().SPServices({
			operation: "GetList",
			webURL: self.get('webURL'),
			listName: Model.url,
			completefunc: function(response, status) {
				if (self._success(status)) {
					
					var serverFields = $(response.responseText).find('Fields > Field').map(function() {
						
						return $(this).attr('StaticName');
						
					}).toArray();
					
					var missing = allModelFields.filter(function(item) {
					
						return serverFields.contains(self._capitalize(item)) === false;
					
					});
					
					if (missing.length) {
						console.log(Model, 'MISSING ON THE SERVER: ' + missing);
					} else {
						console.log(Model, 'ALL ATTRIBUTES ARE PRESENT ON THE SERVER.');
					}
					
					deferred.resolve();
				} else {
					deferred.fail();
				} 
			}
		});
		
		return deferred.promise();
		
	},
	
	
	// ------------------------------------------------------------
	//
	// Private methods
	//
	// ------------------------------------------------------------
	
	
	parse: function(data, klass) {
		var self = this,
			result = [],
			//$responseXML = $(data.responseText.replace(/:\w+/g, '')), // this is the old parser, it unfortunately cut of the hours and minutes from the time value
			$responseXML = $(data.responseText.replace(/<z:row/g, '<z')),
			$rows = $responseXML.find('z');
				
		if (Boolean($rows.size())) {
			$rows.each(function() {
				result.push(self.deserialize(this, klass));
			});
		}
		
		return result;
	},
	
	
	serialize: function(value) {
		var self = this,
			constructor = value.constructor, 
			keys = constructor.getAttributes(),
			relationships = constructor.getRelationships(),
			primaryKey = constructor.primaryKey,
			result = [],
			meta,
			metaOptions;
			
		relationships.forEach(function(relationship) {
			var data,
				relationshipKey;

			meta = constructor.metaForProperty(relationship);
			relationshipKey = meta.options.key || relationship;
		
			result.push([
				self._capitalize(relationshipKey),
				meta.kind === 'belongsTo' ? value.serializeBelongsTo(relationship, meta) || '' : value.serializeHasMany(relationship, meta).join()
			]);
	
		});
		
		keys.forEach(function(key, i, keys) {
			meta = constructor.metaForProperty(key);
			metaOptions = meta.options || {};
			
			if (key !== primaryKey && metaOptions.readOnly !== true && !Em.isEmpty(value.get(key))) {
				result.push([
					self._capitalize(key),
					meta.type && meta.type.serialize ? meta.type.serialize(value.get(key)) : value.get(key)
				]);
			}
		});
		
		return result;
	},
	
	deserialize: function(value, klass) {
		var self = this,
			attributes = klass.getAttributes(),
			relationships = klass.getRelationships(),
			result = {};
			
		attributes.forEach(function(key) {
			result[key] = $(value).attr('ows_' + self._capitalize(key));
		});
		
		var keyValue,
			meta,
			relationshipKey;

		relationships.forEach(function(relationship) {
			meta = klass.metaForProperty(relationship);
			relationshipKey = meta.options.key || relationship;
			
			keyValue = $(value).attr('ows_' + self._capitalize(relationshipKey));
			
			result[relationshipKey] = keyValue && meta.kind === 'hasMany'? keyValue.split(',') : keyValue;
		});

		return result;
	},
	
	
	_inClause: function(values) {
		var self = this,
			element = null,
			prev = null,
			result = $('<Where/>');
			
			function eqTag(field, type, value) {
				return '<Eq>' + 
						'<FieldRef Name="' + field + '" />' + 
						'<Value Type="' + type + '">' + value + '</Value>' +  
					'</Eq>';
			}
			
			values.forEach(function(value, index) {
				// last one
				if (index === values.length - 1) {
					element = eqTag('ID', 'Number', value);
				} else {
					element = $('<Or/>');
					element.append(eqTag('ID', 'Number', value));
				}
				
				if (prev === null) {
					result.prepend(element);
				} else {
					prev.prepend(element);
				}
				
				prev = element;
			});
			
			return result.html();
	},
	
	_capitalize: function(word) {
		return word.charAt(0).toUpperCase() + word.substr(1);
	},
	
	_success: function(status) {
		return status === "success";
	}
	
});

App.FakeAdapter = App.SPAdapter.extend({

	/**
	* Parses an XML string.
	*
	* @param data {String} a string representation of XML returned from SharePoint
	* @param klass {Ember.Model} class extending Ember.Model
	*
	* @returns {Array.<Ember.Model>} A collection of deserialized objects.
	*/
	parse: function(data, klass) {
		var self = this,
			result = [],
			$responseXML = $(data.replace(/<z:row/g, '<z')),
			$rows = $responseXML.find('z');
				
		if (Boolean($rows.size())) {
			$rows.each(function(){
				result.push(self.deserialize(this, klass));
			});
		}
		
		return result;
	},


	findAll: function(klass, records) {
		var self = this,
			deferred = $.Deferred();
			
		$.get(klass.fixture, function (response, status) {
			if (self._success(status)) {
				self.didFindAll(klass, records, self.parse(response, klass));
				deferred.resolve(records);
			} else {
				deferred.fail();
			}
		}, 'text').fail(function(error) {
		
			
		
		});
		
		return deferred.promise();
		
	},


	find: function(record, id) {
		var self = this,
			deferred = $.Deferred();
			
		$.get(record.constructor.fixture, function (response, status) {
			if (self._success(status)) {
				var $responseXML = $(response.replace(/<z:row/g, '<z').replace(/<rs:data/g, '<rs')), // with removed namespaces
					$result = $responseXML.find('z[ows_ID="' + id + '"]');
					
				// we remove all the results and replace them with the one that has the appropriate ID
				$responseXML.find('rs').empty().append($result);
				
				// this is simply a workaround to get the right string
				// http://stackoverflow.com/questions/6507293/convert-xml-to-string-with-jquery/15885505#15885505
				var amendedResponse = $('<div>').append($responseXML).html();
				
				self.didFind(record, id, self.parse(amendedResponse, record.constructor).get(0));
				deferred.resolve(record);
			} else {
				deferred.fail();
			}
		}, 'text');
		
		return deferred.promise();
	},
	
	
	findMany: function(klass, records, ids) {
		var self = this,
            deferred = $.Deferred();
            
		$.get(klass.fixture, function (response, status) {
			if (self._success(status)) {
				
				$responseXML = $(response.replace(/<z:row/g, '<z'));
				$rows = $responseXML.find('z').filter(ids.map(function(id) { return '[ows_ID="' + id + '"]'; }).join(','));
				//$rows = $responseXML.find('z').filter('z [ows_ID="' + id + '"]');
				
				self.didFindAll(klass, records, self.parse(response, klass));
				deferred.resolve(records);
			} else {
				deferred.fail();
			}
		}, 'text');
		
		return deferred.promise();
	},
	
	
	saveRecord: function(record) {
		var self = this,
			deferred = $.Deferred();
		
		// delay
		Em.run.later(self, function() {
			self.didSaveRecord(record, record);
			deferred.resolve(record);
		}, 1000);
		
		return deferred.promise();
	},
	
	
	createRecord: function(record) {
		var self = this,
			deferred = $.Deferred();
		
		// delay
		Em.run.later(self, function() {
			self.didCreateRecord(record, record._fake);
			delete record._fake;
			deferred.resolve(record);
		}, 10);
		
		return deferred.promise();
	},
	
	
	deleteRecord: function(record) {
		var deferred = $.Deferred(),
			self = this;
			
		// delay
		Em.run.later(self, function() {
			self.didDeleteRecord(record, record._fake);
			//self.didDeleteRecord(record, self.parse(response, record.constructor).get(0));
			deferred.resolve(record);
		}, 1000);
		
		return deferred.promise();
	}
	
});







// ----------------------------------------------------------------------------
//
// App.SharePointTypes
//
// ----------------------------------------------------------------------------


App.SharePointTypes = {

	Boolean: {
	
		serialize: function(value) {
			return Number(value);
		},
		
		deserialize: function(string) {
			return Boolean(Number(string));
		}
	
	},
	
	Date: {
	
		serialize: function(value) {
			return value.toString('yyyy-MM-dd');
		},
		
		deserialize: function(string) {
			return Date.parseExact(string, 'yyyy-MM-dd HH:mm:ss');
		}
	
	},
	
	User: {
	
		serialize: function(value) {
			
			return value;
			
			/*
			if (!Em.isEmpty(value)) {
				if (value.indexOf(';#') > -1) {
					return value.substring(0, value.indexOf(';#'));
				} else {
					return value;
				}
			} else {
				return null;
			}
			*/
		},
		
		deserialize: function(string) {
			return string; 
			
			/*
			if (!Em.isEmpty(string))
			{
				var nameArray = string.substr(string.lastIndexOf('#') + 1).split(', ');
				return nameArray[1] + ' ' + nameArray[0];
			}
			else
			{
				return null;			
			}
			*/
		}
	
	},
	
	FreeText: {
	
		serialize: function(value) {
			
			return value ? value
				.replace('<', '&lt;')
				.replace('>', '&gt;')
				.replace('&', '&amp;') : null;
			
		},
		
		deserialize: function(value) {

			return value? value
				.replace('&lt;', '<')
				.replace('&gt;', '>')
				.replace('&amp;', '&') : null;

		}
	
	}

};


Ember.Model.reopenClass({

	checkAll: function() {
		
		[
			App.Campaign, 
			App.Channel, 
			App.Preanalysis, 
			App.Outcome, 
			App.OutcomeCampaign
			
		].forEach(function(item) {
		
			item.checkFieldsOnServer();
		
		});
		
	},
	
	backupCSV: function() {
	
		var self = this,
			delimiter = '^',
			attributes = self.getAttributes(),
			relationships = self.getRelationships().map(function(item) { return self.metaForProperty(item).options.key; }),
			allModelFields = relationships.concat(attributes);
			
		var result = [allModelFields.join(delimiter)];
		
		self.find().forEach(function(campaign) {
		
			var row = [];
		
			allModelFields.forEach(function(field) {
			
				row.push(encodeURIComponent(campaign.get(field)));
			
			});
			
			result.push(row.join(delimiter));
		
		});
		
		var csvString = result.join("%0A");
		var a = document.createElement('a');
		a.href = 'data:attachment/csv,' + csvString;
		a.target = '_blank';
		a.download = 'myFile.csv';
		
		document.body.appendChild(a);
		a.click();
	
	},
	
	backupJSON: function() {
	
		var self = this,
			attributes = self.getAttributes(),
			relationships = self.getRelationships().map(function(item) { return self.metaForProperty(item).options.key; }),
			allModelFields = relationships.concat(attributes);
			
		var result = [];
		
		self.find().forEach(function(campaign) {
		
			var row = {};
		
			allModelFields.forEach(function(field) {
			
				row[field] = encodeURIComponent(campaign.get(field));
			
			});
			
			result.push(row);
		
		});
		
		var a = document.createElement('a');
		a.href = 'data:application/json,' + JSON.stringify(result);
		a.target = '_blank';
		a.download = 'myJSON.json';
		
		document.body.appendChild(a);
		a.click();
	
	},
	
	checkFieldsOnServer: function() {
		
		var self = this,
			attributes = self.getAttributes(),
			relationships = self.getRelationships().map(function(item) { return self.metaForProperty(item).options.key; }),
			allModelFields = relationships.concat(attributes);
		
		$().SPServices({
			operation: "GetList",
			webURL: self.adapter.get('webURL'),
			listName: self.url,
			completefunc: function(response, status) {
				if (status === 'success') {
					
					var serverFields = $(response.responseText).find('Fields > Field').map(function() {
						
						return $(this).attr('StaticName');
						
					}).toArray();
					
					var missing = allModelFields.filter(function(item) {
					
						return serverFields.contains(self.adapter._capitalize(item)) === false;
					
					});
					
					if (missing.length) {
						console.log(self, 'MISSING ON THE SERVER: ' + missing);
					} else {
						console.log(self, 'ALL ATTRIBUTES ARE PRESENT ON THE SERVER.');
					}
					
				} else {
					console.log(self, 'checkOnServer method did not complete successfully.');
				} 
			}
		});
		
	}

});


// ----------------------------------------------------------------------------
//
// App.Campaign
//
// ----------------------------------------------------------------------------


App.Campaign = Ember.Model.extend({


	/**
	* {Number} Object id in the system.
	*/
	ID: Em.attr(),
	
	
	/**
	* {Date} Created date and time.
	*/
	created: Em.attr(App.SharePointTypes.Date, {readOnly: true}),
	
	
	/**
	* {Date} Modified date and time.
	*/
	modified: Em.attr(App.SharePointTypes.Date, {readOnly: true}),
	
	
	/**
	* {String} Full name of a user who created the instance of campaign.
	*/
	author: Em.attr(App.SharePointTypes.User, {readOnly: true}),


	/**
	* {String} An id reference in the marketing database.
	*/
	marketingID: Em.attr(),
	
	
	/**
	* {String} Campaign name.
	*/
	title: Em.attr(),
	
	
	/**
	* {App.SharePointTypes.FreeText} Campaign description.
	*/
	description: Em.attr(App.SharePointTypes.FreeText),
	
	
	/**
	* {String} Product portfolio.
	*/
	portfolio: Em.attr(),
	
	
	/**
	* {String} Product name.
	*/
	product: Em.attr(),
	
	
	/**
	* {String} Campaign objective.
	*/
	objective: Em.attr(),
	
	
	/**
	* {Boolean} Is campaign of a test and learn nature.
	*/
	testAndLearn: Em.attr(App.SharePointTypes.Boolean),
	
	
	/**
	* {Date} Intended start date of the campaign.
	*/
	startDate: Em.attr(App.SharePointTypes.Date),
	
	
	/**
	* {Date} The promised delivery date.
	*/
	dueDate: Em.attr(App.SharePointTypes.Date),
	
	
	/**
	* {String} An assignee for campaign development.
	*/
	assignee: Em.attr(App.SharePointTypes.User),
	
	
	/**
	* {String} How often a campaign is executed.
	*/
	frequency: Em.attr(),
	
	
	/**
	* {String} A url for the latest version of the ODF.
	*/
	odf: Em.attr(),
	
	
	/**
	* {String} Stage the campaign is in.
	* See CampaignStage constant for details.
	*/
	stage: Em.attr(),
	
	
	/**
	* {App.Preanalysis}
	*/
	preanalysis: Em.belongsTo('App.Preanalysis', {key: 'preanalysis_id'}),

	
	/**
	* {Ember.HasManyArray.<App.Channel>} A collection of channels.
	*/
	channels: Em.hasMany('App.Channel', {key: 'channel_ids'}),

	
	/**
	* {Boolean} A flag indicating if the priority of the campaign was manually set.
	*/
	override: Em.attr(App.SharePointTypes.Boolean),
	
	
	/**
	* {Boolean} A flag indicating if a campaign is a change to a previously executed campaign.
	*/
	change: Em.attr(App.SharePointTypes.Boolean),
	
	
	/**
	* {Boolean} Description of the required change.
	*/
	changeDescription: Em.attr(App.SharePointTypes.FreeText),
	
	
	/**
	* {App.Campaign} Original campaign beeing changed.
	*/
	original: Em.belongsTo('App.Campaign', {key: 'original_id'}),
	
	
	// ------------------------------------------------------------------------
	//
	// Below are the computed properties (they are not stored in database)
	// 
	// ------------------------------------------------------------------------
	
	
	uplift: function() {
		var N = App.Utils.Number;
		
		return (N(this.get('preanalysis.targetResponse')) - N(this.get('preanalysis.controlResponse'))) / 100;
		
	}.property('preanalysis.targetResponse', 'preanalysis.controlResponse'),
	
	
	incrementalContribution: function() {
		var N = App.Utils.Number;
		
		return this.get('uplift') * N(this.get('preanalysis.totalCustomers')) * N(this.get('preanalysis.lifeTimeValue'));
		
	}.property('uplift', 'preanalysis.totalCustomers', 'preanalysis.lifeTimeValue'),
	
	
	netIncrementalContribution: function() {
		return this.get('incrementalContribution') - this.get('directCost');
	}.property('incrementalContribution', 'directCost'),
	
	
	netIncrementalContributionPerLead: function() {
		return App.Utils.Number(this.get('netIncrementalContribution') / this.get('preanalysis.totalCustomers'));
	}.property('netIncrementalContribution', 'preanalysis.totalCustomers'),
	
	
	ccsCost: function() {
		return 600 * App.Utils.Number(this.get('preanalysis.estimatedEffort'));
	}.property('preanalysis.estimatedEffort'),
	
	
	totalCost: function() {
		return this.get('ccsCost') + this.get('directCost');
	}.property('ccsCost', 'directCost'),
	
	
	totalLeads: function() {
		var result = 0,
			N = App.Utils.Number;
			
		this.get('channels').forEach(function(channel) {
			result += N(channel.get('leads'));
		});
		
		return result;
		
	}.property('channels.@each.leads'),
	
	
	directCost: function() {
		var result = 0,
			N = App.Utils.Number;
			
		this.get('channels').forEach(function(channel) {
			result += N(channel.get('costPerLead')) * N(channel.get('leads'));
			result += N(channel.get('offerCost'));
		});
		
		return result;
	}.property('channels.@each.leads', 'channels.@each.costPerLead', 'channels.@each.offerCost'),
	
	
	costPerLead: function() {
		var N = App.Utils.Number;
		return N(this.get('directCost') / this.get('totalLeads'));
	}.property('totalLeads', 'directCost'),
	
	
	roi: function() {
		return App.Utils.Number(this.get('netIncrementalContribution') / this.get('directCost'));
	}.property('netIncrementalContribution', 'directCost'),
	
	
	allChannels: function() {
		return this.get('channels').getEach('title').join('+');
	}.property('channels.@each.title'),
	
	roiPass: function() {
		return this.get('roi') >= 2; // 2 is 200%
	}.property('roi'),
	
	netIncrementalContributionPerLeadPass: function() {
		return this.get('netIncrementalContributionPerLead') >= 2;
	}.property('netIncrementalContributionPerLead'),
	
	pass: function() {
		return this.get('netIncrementalContributionPerLeadPass') && this.get('roiPass');
	}.property('netIncrementalContributionPerLeadPass', 'roiPass'),
	
	isPreanalysisComplete: function() {
		return this.get('preanalysis') && this.get('preanalysis.complete');
	}.property('preanalysis.complete'),
	
	
	/**
	* The score is applied in the following fashion.
	*
	* If a request has not been overridden and has pre-analysis completed that passes the hurdles
	* the calculated score will be returned.
	*
	* If a request has been overriden or has pre-analysis completed that doesn't pass the hurdles
	* the score of 2 will assigned for a business driver request and 1 for a non business driver.
	*
	* If a request has no pre-analysis it will be given score of 1 if it is a business driving
	* request and 0 if it is not.
	*/
	score: function() {
		return this.get('override') || (this.get('preanalysis.complete') && !this.get('pass')) ? (this.get('isBusinessDriver') ? 2 : 1) : (this.get('preanalysis.complete') ? this.get('calculatedScore') : (this.get('isBusinessDriver') ? 1 : 0));
	}.property('override', 'calculatedScore'),
	
	
	/**
	* The reverseStartDate is used in the rankings.
	* It is simply the startDate multiplied by -1 so the right order is maintained.
	*/
	reverseStartDate: function() {
		if (this.get('startDate')) {
			return this.get('startDate').getTime() * -1;
		} else {
			// if no startDate is set we take today's date and add 10 years to it
			// to make it rank last.
			return Date.today().add(10).years().getTime() * -1;
		}
	}.property('startDate'),
	
	
	isToPipeline: function() {
		return this.get('stage') === CampaignStage.TO_PIPELINE;
	}.property('stage'),
	
	
	hasPassedRequestedDate: function() {
		return Date.today().isAfter(this.get('startDate'));
	}.property('startDate'),
	
	hasPassedDueDate: function() {
		return Date.today().isAfter(this.get('dueDate'));
	}.property('startDate'),
	
	isDelayed: function() {
		return App.Utils.daysDiff(this.get('startDate'), this.get('dueDate')) > 0;
	}.property('startDate', 'dueDate'),
	
	isMandatory: function() {
		return ['Compliance/Contractual', 'Compliance', 'Contractual'].contains(this.get('objective'));
	}.property('objective'),
	
	isBusinessDriver: function() {
		return !['Service/Compliance/Contractual', 'Compliance/Contractual', 'Service', 'Compliance', 'Contractual'].contains(this.get('objective'));
	}.property('objective'),
	
	isPrioritized: function() {
		return ![CampaignStage.NEW, CampaignStage.PREANALYSIS, CampaignStage.PRIORITY].contains(this.get('stage'));
	}.property('stage')
	
});

App.Campaign.primaryKey = 'ID';
App.Campaign.url = '@environment@-campaign';
App.Campaign.fixture = 'data/fixtures/campaign.xml';
App.Campaign.adapter = '@environment@' === 'local' ? App.FakeAdapter.create() : App.SPAdapter.create();


// ----------------------------------------------------------------------------
//
// App.Channel
//
// ----------------------------------------------------------------------------


App.Channel = Em.Model.extend({

	ID: Em.attr(),
	
	/**
	* {String} Channel name.
	*/
	title: Em.attr(),
	
	/**
	* {Number} Total leads for the channel.
	*/
	leads: Em.attr(),
	
	/**
	* {Number} Cost per lead in dollars.
	*/
	costPerLead: Em.attr(),
	
	/**
	* {Number} A fixed additional cost irrespective of the number of leads.
	*/
	offerCost: Em.attr()

});

App.Channel.primaryKey = 'ID';
App.Channel.url = '@environment@-channel';
App.Channel.fixture = 'data/fixtures/channel.xml';
App.Channel.adapter = '@environment@' === 'local' ? App.FakeAdapter.create() : App.SPAdapter.create();


// ----------------------------------------------------------------------------
//
// App.Preanalysis
//
// ----------------------------------------------------------------------------


App.Preanalysis = Em.Model.extend({

	ID: Em.attr(),
	
	
	/**
	* {App.Campaign} A campaign for preanalysis.
	*/
	campaign: Em.belongsTo('App.Campaign', {key: 'campaign_id'}),
	
	
	/**
	* {String} An assignee for preanalysis.
	*/
	assignee: Em.attr(App.SharePointTypes.User),
	
	
	/**
	* {Date} The date the pre-analysis was assigned.
	*/
	created: Em.attr(App.SharePointTypes.Date, {readOnly: true}),
	
	
	/**
	* {Number} Total targeted number of customers.
	*/
	totalCustomers: Em.attr(),
	
	
	/**
	* {Number} Life time value.
	*/
	lifeTimeValue: Em.attr(),
	
	
	/**
	* {Number} Test group response rate in percentage (%).
	*/
	targetResponse: Em.attr(),
	
	
	/**
	* {Number} Control group response rate in percentage (%).
	*/
	controlResponse: Em.attr(),
	
	
	/**
	* {Number} An estimate for the development of the campaign. In days.
	*/
	estimatedEffort: Em.attr(),
	
	
	/**
	* {Boolean} A flag indicating if pre-analysis has been submitted.
	*/
	complete: Em.attr(App.SharePointTypes.Boolean),
	
	
	/**
	* {Date} A promised due date for completing the pre-analysis.
	*/
	dueDate: Em.attr(App.SharePointTypes.Date),
	
	
	// ------------------------------------------------------------------------
	//
	// Calculated
	//
	// ------------------------------------------------------------------------
	
	
	isOverdue: function() {
	
		return Date.today().isAfter(this.get('dueDate'));
	
	}.property('dueDate')
		
});

App.Preanalysis.primaryKey = 'ID';
App.Preanalysis.url = '@environment@-preanalysis';
App.Preanalysis.fixture = 'data/fixtures/preanalysis.xml';
App.Preanalysis.adapter = '@environment@' === 'local' ? App.FakeAdapter.create() : App.SPAdapter.create();







// ----------------------------------------------------------------------------
//
// App.Timeline
//
// ----------------------------------------------------------------------------


App.Timeline = Em.Model.extend({

	ID: Em.attr(),

	
	/**
	* {Date} Created date and time.
	*/
	created: Em.attr(App.SharePointTypes.Date, {readOnly: true}),
	
	
	/**
	* {String} Full name of a user.
	*/
	author: Em.attr(App.SharePointTypes.User, {readOnly: true}),
	
	
	/**
	* {String} A description of the event.
	*/
	description: Em.attr(),
	
	
	/**
	* {App.Campaign}} An instance of the original request.
	*/
	request: Em.belongsTo('App.Campaign', {key: 'request_id'}),
	
	
	/**
	* {String} Event type taken from a TimelineEvent constant
	*/
	event: Em.attr()
	
});

App.Timeline.primaryKey = 'ID';
App.Timeline.url = '@environment@-timeline';
App.Timeline.fixture = 'data/fixtures/timeline.xml';
App.Timeline.adapter = '@environment@' === 'local' ? App.FakeAdapter.create() : App.SPAdapter.create();




// ----------------------------------------------------------------------------
//
// App.Task
//
// ----------------------------------------------------------------------------


App.Task = Em.Model.extend({

	ID: Em.attr(),

	
	/**
	* {Date} Created date and time.
	*/
	created: Em.attr(App.SharePointTypes.Date, {readOnly: true}),
	
	
	/**
	* {String} Full name of a user who created the task.
	*/
	author: Em.attr(App.SharePointTypes.User, {readOnly: true}),
	
	
	/**
	* {App.Project} A project that the task belongs to.
	*/
	project: Em.belongsTo('App.Project', {key: 'project_id'}),
	
	
	/**
	* {App.Campaign} A campaign that the task belongs to.
	*/
	campaign: Em.belongsTo('App.Campaign', {key: 'campaign_id'}),
	
	
	/**
	* {String} Task type.
	*/
	category: Em.attr(),
	
	
	/**
	* {String} An assignee.
	*/
	assignee: Em.attr(App.SharePointTypes.User),
	
	
	/**
	* {Date} Intended start date of the task.
	*/
	start: Em.attr(App.SharePointTypes.Date),
	
	
	/**
	* {Date} Intended end date of the task.
	*/
	end: Em.attr(App.SharePointTypes.Date),
	
	
	/**
	* {Date} The requested due date.
	*/
	due: Em.attr(App.SharePointTypes.Date)
	
});

App.Task.primaryKey = 'ID';
App.Task.url = '@environment@-task';
App.Task.fixture = 'data/fixtures/task.xml';
App.Task.adapter = '@environment@' === 'local' ? App.FakeAdapter.create() : App.SPAdapter.create();


App.Task.reopenClass({
	
	_id: 0,
	
	createID: function() {
		App.Task._id += 1;
		return App.Task._id;
	}

});




// ----------------------------------------------------------------------------
//
// App.Project
//
// ----------------------------------------------------------------------------


App.Project = Em.Model.extend({

	ID: Em.attr(),

	
	/**
	* {Date} Created date and time.
	*/
	created: Em.attr(App.SharePointTypes.Date, {readOnly: true}),
	
	
	/**
	* {String} Full name of a user.
	*/
	author: Em.attr(App.SharePointTypes.User, {readOnly: true}),
	
	
	/**
	* {String} Campaign name.
	*/
	title: Em.attr(),
	
	
	/**
	* {App.SharePointTypes.FreeText} Campaign description.
	*/
	description: Em.attr(App.SharePointTypes.FreeText),
	
	
	/**
	* {Date} Requested project due date.
	*/
	dueDate: Em.attr(App.SharePointTypes.Date),
	
	
	/**
	* {Boolean} A flag indicating if a campaign is a change to a previously executed campaign.
	*/
	isCampaign: Em.attr(App.SharePointTypes.Boolean),
	
	
	/**
	* {App.Campaign}} An instance of the original request.
	*/
	campaign: Em.belongsTo('App.Campaign', {key: 'campaign_id'})

});

App.Project.primaryKey = 'ID';
App.Project.url = '@environment@-project';
App.Project.fixture = 'data/fixtures/project.xml';
App.Project.adapter = '@environment@' === 'local' ? App.FakeAdapter.create() : App.SPAdapter.create();






App.Suggestion = Em.Object.extend({

	/**
	* {App.Task}
	*/
	task: null,

	/**
	* {App.AssigneeController}
	*/
	assignee: null,
	
	/**
	* {App.SuggestionOption}
	*/
	option: null,
	
	
	/**
	* {Number} A total number of days pass the task's due date.
	*/
	delay: 0

});




App.SuggestionOption = Em.ArrayController.extend({
	
	/**
	* {Date} From date.
	*/
	from: function() {
		return this.get('firstObject.date');
	}.property('firstObject.date'),
	
	/**
	* {Number} Duration in days.
	*/
	duration: Em.computed.alias('length'),
	
	/**
	* {Array.<DayLoad>}
	*/
	content: [],
	
	totalLoad: function() {
		return this.reduce(function(previousValue, item) {
			return previousValue + item.get('load');
		}, 0);
	}.property('@each.load'),
	
	start: function() {
		return this.get('firstObject.date');
	}.property('firstObject.date'),

	end: function() {
		return this.get('lastObject.date');
	}.property('lastObject.date'),
	
	speed: function() {
		return App.Utils.daysDiff(Date.today(), this.get('start'));
	}.property('start'),
	
	score: function() {
		return this.get('speed') + this.get('totalLoad');
	}.property('speed', 'totalLoad'),
	
	/**
	* {App.Task} A task that is suggested to be replaced.
	*/
	replace: null,
	
	/**
	* @param {Number} maxLoad Maximum number or tasks per day.
	* @param {Number} maxLoadTolerance Maximum number of days with maxLoad.
	*/
	isSuccessful: function(maxLoad, maxLoadTolerance) {
		return this.filter(function(day) { return day.get('load') >= maxLoad; }).length <= maxLoadTolerance;
	}
});

App.DayLoad = Em.Object.extend({

	/**
	* {Date} Suggested start date
	*/
	date: null,
	
	
	/**
	* {Number} A number of tasks on the day (refer to 'date' property).
	*/
	load: 0,
	
	
	/**
	* A helper method that will increase the load by one
	*/
	increase: function() {
		var self = this,
			load = self.get('load') || 0;
			
		self.set('load', load + 1);
	}

});

App.Assignee = Em.Object.extend({

	/**
	* {String} Full name of the assignee
	*/
	name: null,
	
	
	/**
	* A list of portfolios that the assignee is available to work on.
	*
	* {Array.<String>}
	*/
	portfolios: null

});


App.Filter = Em.Object.extend({

	/**
	* {String} Group name
	*/
	group: null,
	
	
	/**
	* {String} Value
	*/
	value: null

});


















