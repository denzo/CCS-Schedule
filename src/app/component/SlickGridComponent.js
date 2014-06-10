App.SlickGridComponent = Em.View.extend({

	/**
	* {Slick.Grid} An instance of Slick Grid (slick.grid.js)
	*/
	grid: null,
	
	
	/**
	* {Object} An object containing Slick Grid options.
	* https://github.com/mleibman/SlickGrid/wiki/Grid-Options
	*/
	options: function() {
		var rowHeight = this.get('rowHeight');
		
		return {
			forceFitColumns: true,
			explicitInitialization: true,
			enableCellNavigation: false,
			enableColumnReorder: false,
			enableAsyncPostRender: true,
			asyncPostRenderDelay: 0
		};
		
	}.property(),
	
	
	/**
	* {Array.<Object>} An array containing column definitions.
	* https://github.com/mleibman/SlickGrid/wiki/Column-Options
	*
	* This should be provided to the component from the outside.
	*/
	columns: null,
	
	
	/**
	* {DataView} An instance of the DataView displayed with SlickGrid
	* https://github.com/mleibman/SlickGrid/wiki/DataView
	*/
	dataView: null,
	
	
	/**
	* {Number} An integer representing a total number of results.
	*/
	total: null,
	
	
	width: 1140,
	height: 550,
	
	
	didInsertElement: function() {
		
		var self = this,
			data = self.get('data'),
			groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider(),
			dataView = new Slick.Data.DataView({groupItemMetadataProvider: groupItemMetadataProvider, inlineFilters: true}),
			grid = new Slick.Grid(self.$(), dataView, self.get('columns'), self.get('options'));
		
		self.set('grid', grid);
		self.set('dataView', dataView);
		
		self.$().css({
			width: this.get('width'),
			height: this.get('height')
		});
		
		grid.registerPlugin(groupItemMetadataProvider);
		
		dataView.setGrouping([{getter: 'analyst'}]);
		
		dataView.onRowCountChanged.subscribe($.proxy(self, 'onRowCountChanged'));
        dataView.onRowsChanged.subscribe($.proxy(self, 'onRowsChanged'));
        
        dataView.beginUpdate();
        dataView.setItems(data);
        //dataView.setFilter($.proxy(self, 'filterFunction'));
        dataView.endUpdate();
        
        grid.init();
        
        grid.autosizeColumns();
	},
	
	filterFunction: function(item) {
        var self = this,
			columns = self.get('grid').getColumns(),
			value = true;

		columns.forEach(function(column) {
			var filterValues = column.filterValues;
			
			if (filterValues && filterValues.length > 0) {
                value = value & filterValues.contains(item.get(column.field));
            }
		});
		
        return value;
    },
    
	
	// ------------------------------------------------------------------------
	//
	// Event handlers
	//
	// ------------------------------------------------------------------------
	
	
	onCommand: function (e, args) {
        var self = this,
			dataView = self.get('dataView'),
			comparer;
        
        if (args.column.type === 'number') {
			
			comparer = function (a, b) {
				return App.Utils.Number(parseFloat(a.get(args.column.field))) > App.Utils.Number(parseFloat(b.get(args.column.field))) ? 1 : -1;
			};
			
        } else if (args.column.type === 'date') {
			
			comparer = function (a, b) {

				var one =  a.get(args.column.field);
				var two = b.get(args.column.field);

				if (one && one instanceof Date && two && two instanceof Date) {
					return one.isAfter(two) ? 1 : -1;
				} else if (one && one instanceof Date) {
					return 1;
				} else if (two && two instanceof Date) {
					return -1;
				}
			};
        
        } else {
        
			comparer = function (a, b) {
				return a.get(args.column.field) > b.get(args.column.field) ? 1 : -1;
			};
			
        }
        
        switch (args.command) {
            case "sort-asc":
                dataView.sort(comparer, true);
                break;
            case "sort-desc":
                dataView.sort(comparer, false);
                break;
        }
    },
        
	onFilterApplied: function () {
        var self = this,
			dataView = self.get('dataView');
        
        dataView.refresh();

		self.set('total', dataView.getLength());
	},
	
	onRowsChanged: function(e, args) {
		var self = this,
			grid = self.get('grid');
			
		grid.invalidateRows(args.rows);
        grid.render();
	},
	
	onRowCountChanged: function(e, args) {
		var self = this,
			grid = self.get('grid');
		
		if (grid) {
			grid.updateRowCount();
        	grid.render();
        }
        
        self.set('total', self.get('dataView').getLength());
	},
	
	heightChangeHandler: function() {
		this.$().css('height', this.get('height') + this.$('.slick-header').outerHeight(true));
		this.get('grid').resizeCanvas();
	}.observes('height'),
	
	columnChangeHandler: function() {
		
		var self = this,
			grid = self.get('grid'),
			columnOrder = self.get('columnOrder'), 
			newColumns = self.get('columns');
		
		if (newColumns.length > columnOrder.length) {
			var addedColumns = newColumns.filter(function(column) {
				return !columnOrder.contains(column.id);
			});
			
			self.get('grid').setColumns(
				columnOrder.map(function(id) {
					return newColumns.findBy('id', id);
				}).concat(addedColumns)
			);
			
		} else if (newColumns.length < columnOrder.length) {
		
			var newColumnIds = newColumns.getEach('id');
		
			columnOrder.forEach(function(id) {
				if (!newColumnIds.contains(id)) {
					columnOrder.removeObject(id);
				}
			});
			
			self.get('grid').setColumns(
				columnOrder.map(function(id) {
					return newColumns.findBy('id', id);
				})
			);
			
		}
		
		self.get('grid').render();
		self.get('grid').autosizeColumns();
		
	}.observes('columns.length')



});