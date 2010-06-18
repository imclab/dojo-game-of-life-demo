dojo.provide("telliott.games.conway.views.GfxView");


dojo.require("dojo.colors");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.gfx");

dojo.require("telliott.games.conway.views.DefaultControls");

dojo.declare("telliott.games.conway.views.GfxView", [dijit.layout.ContentPane, telliott.games.conway.views.DefaultControls], {

    // Statics
    CELL_SIZE_EXTRA_SMALL: 0,
    CELL_SIZE_SMALL: 1,
    CELL_SIZE_MEDIUM: 2,
    CELL_SIZE_LARGE: 3,
    CELL_SIZE_EXTRA_LARGE: 4,
    
    _cellSizes: [],
    
    // Instance Vars

    // The id of the game controller we wish to represent
    _controllerId: null,
    _controller: null,
    _currentSize: null,
	
	// Width and height in cells
    _width: null,
    _height: null,
	
	// Width and height in pixels
	_surfaceWidth: null,
	_surfaceHeight: null,
	
    _containerNode: null,
	_surface: null,
    
    _containedWidgets: null,
    
    _container: null,
    
    constructor: function(/* property bag */ props) {
           if (!(props.controllerId && props.controller && props.gridWidth && props.gridHeight)) {
            throw new Error("You must provide an ID for a GameOfLife Controller and grid height and width. Aborting!");
        }
        
        this._controllerId = props.controllerId;
        this._controller = props.controller;
        this._width = props.gridWidth;
        this._height = props.gridHeight;
        this._containedWidgets = [];
		this._cellSizes = [this.CELL_SIZE_EXTRA_SMALL, this.CELL_SIZE_SMALL, this.CELL_SIZE_MEDIUM, this.CELL_SIZE_LARGE, this.CELL_SIZE_EXTRA_LARGE ];
        
        // TODO: Set size based on grid and viewport size?
        this._currentSize = this.CELL_SIZE_MEDIUM;
		
		this._surfaceWidth = this._width * this._getCellSize(this._currentSize);
		this._surfaceHeight = this._height * this._getCellSize(this._currentSize);
    },
    
    postCreate: function() {
        this.inherited(arguments);
        
        this._createLayout();
                
        // Subscribe to updates from the controller
        dojo.subscribe(this._controllerId + "-reset-board", dojo.hitch(this, function(/* 2D Cell array */ all_cells) {
            this._setupDisplay(all_cells);
        }));
        dojo.subscribe(this._controllerId + "-step-diff", dojo.hitch(this, function(/* 1D Cell array */ cells) {
            this._updateDisplay(cells);
        }));
        dojo.subscribe(this._controllerId + "-game-ended", dojo.hitch(this, function() {
            this._controller.pause();
            dojo.attr(this._startBtn, "label", "Start");
            dojo.attr(this._startBtn, "playing", false);
            new dijit.Dialog({
                title: "Game Over!",
                content: "The game has reached a steady state. Reset or modify the board, and then hit Start to play again :)",
                style: "width:500px;"
            }).show();
        }));
        dojo.subscribe(this._controllerId + "-interval", this, function(/* int */ interval) {
            var index = dojo.indexOf(this._controller.speeds, interval);
            if (index >= 0) {
                this._speedSlider.attr("value", index);
            }
            else {
                log.error("Unknown value for speed slider: " + index);
            }
        });
        dojo.subscribe(this._controllerId + "-pause", this, function() {
            this._startBtn.setPaused(false);
        });
        dojo.subscribe(this._controllerId + "-play", this, function() {
            this._startBtn.setPlaying(false);
        });
    },
	
	_createGrid: function(/* boolean */ createSurfaceContainer) {
        // Surface for the game board
        if (createSurfaceContainer || !dojo.byId(this.id+"_gameBoard")) {
            dojo.create("div", { id: this.id+"_gameBoard"}, this.domNode);
			dojo.addClass(this.id+"_gameBoard", "gameBoard");      
        }

        this._surface = dojox.gfx.createSurface(this.id + "_gameBoard", this._surfaceWidth, this._surfaceHeight)
        this._surface.whenLoaded(dojo.hitch(this, function() {
			var stroke = {style: "Solid", width: 0.5, color: "#678197"};
			var background = this._surface.createRect({x: 0, y: 0, width: this._surfaceWidth, height: this._surfaceHeight}).setFill("white").setStroke(stroke);
			
			var cellSize = this._getCellSize(this._currentSize);
			for(var i = 1; i < this._width; i++) {
                this._surface.createLine({x1: cellSize*i, y1: 0, x2: cellSize*i, y2: this._surfaceWidth}).setStroke(stroke);                
            }
			for(var i = 1; i < this._height; i++) {
				this._surface.createLine({x1: 0, y1: cellSize*i, x2: this._surfaceWidth, y2: cellSize*i}).setStroke(stroke);				
			}
		}));
        
    },
	
	// Redraw the grid with the new size
	_updateCellSize: function(/* int */ newSize) {
		
	},
	
	// Return size (in pixals) depending on the cell size set
    _getCellSize: function(/* int */ size) {
		if (size >= 0 && size < this._cellSizes.length) {
            switch(size) {
                case this.CELL_SIZE_EXTRA_SMALL:
                    return 4;
                case this.CELL_SIZE_SMALL:
                    return 8;
                case this.CELL_SIZE_LARGE:
                    return 16;
                case this.CELL_SIZE_EXTRA_LARGE:
                    return 20
                case this._CELL_SIZE_MEDIUM:
                    // Fall through
                default:
                    // Shouldn't be possible, but just in case
                    return 12;
            }
        }
        return null;
	},
	
	_setupDisplay: function(all_cells) {
        // If the grid is a different size, bin the old one and start over
		if (all_cells.length !== this._width || all_cells[0].length !== this._height) {
            this._width = all_cells.length;
            this._height = all_cells[0].length;
            dojo.empty(this.id+"_gameBoard");
            this._createGrid(false);
        }
        
		var alive = [];
		// Remove all cells
		
        // Update state for all cells in the all_cells array to alive
		
		// Update the display
        this._updateDisplay(alive);
    },
	
	_updateDisplay: function(cells) {
        for (var i = 0; i < cells.length; i++) {
            var coords = cells[i].getLocation();
            if (coords) {
                var id = "gameCell_" + coords.x + "_" + coords.y;
                dojo.toggleClass(id, "alive");
            }
        }
    }

});