App.DynamicSlickGridComponent = Em.View.extend({

	classNames: ['slick-grid'],
	
	/**
	* The range observer is required to rerender the displayed
	* swim lanes when the range changes.
	*/
	rangeObserver: function() {
		var self = this,
			grid = self.get('grid');
			 
		grid.invalidate();
	
	}.observes('range'),

	/**
	* {Slick.Grid} An instance of Slick Grid (slick.grid.js)
	*/
	grid: function() {
		var self = this;
		return self.$() ? new Slick.Grid(self.$(), self.get('dataView'), self.get('columns'), self.get('options')) : null;
	}.property('dataView', 'columns', 'options'),
	
	
	/**
	* {Object} An object containing Slick Grid options.
	* https://github.com/mleibman/SlickGrid/wiki/Grid-Options
	*/
	options: function() {
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
	
	
	width: 1140,
	height: 350,
	
	
	didInsertElement: function() {
		
		var self = this,
			dataView = self.get('dataView'),
			grid = self.get('grid');
		
		self.$().css({
			width: this.get('width'),
			height: this.get('height')
		});
		
		grid.registerPlugin(self.get('groupItemMetadataProvider'));
		grid.onSort.subscribe($.proxy(self, 'onSort'));
		
		dataView.onRowCountChanged.subscribe($.proxy(self, 'onRowCountChanged'));
        dataView.onRowsChanged.subscribe($.proxy(self, 'onRowsChanged'));
		
        grid.init();
        
        grid.autosizeColumns();
	},
    
	
	// ------------------------------------------------------------------------
	//
	// Event handlers
	//
	// ------------------------------------------------------------------------
	
	
	onSort: function (e, args) {
		var self = this,
			dataView = self.get('dataView');
	
		var analyst = function(a, b) {
			return a.analyst === b.analyst ? 0 : a.analyst > b.analyst;
		}
	
		var field = function(a, b) {
			return a[args.sortCol.field].isAfter(b[args.sortCol.field]) ? 1 : -1;
		}
		
		var comparer = function(a, b) {
			return analyst(a,b) || field(a,b);
		}
	
		dataView.sort(comparer, args.sortAsc);
	
	},
	
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
			
		grid.invalidate();
		//grid.invalidateRows(args.rows); // this does update the last row :(
        grid.render();
	},
	
	onRowCountChanged: function(e, args) {
		var self = this,
			grid = self.get('grid');
		
		grid.updateRowCount();
        grid.render();
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
			
		self.get('grid').render();
		
		/*
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
		*/
		
	}//.observes('columns.length')



});