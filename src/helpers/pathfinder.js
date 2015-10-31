var PathFinder = cc.Class.extend({
    
    map: null,
    openSteps: null,
    closedSteps: null,
    
    setMap: function(map) {
        this.map = map;
    },
    
    findRoute: function(start, end) {
        var route = [];
        var endTile = this.map.tileAt(end);
        if ( ! endTile.isWalkable()) {
            return route;
        }
        
        start = this.map.tileAt(start).getPosition();
        end = endTile.getPosition();
        
        //console.log("Start " + new ShortestPathStep(start).description());
        //console.log("End " + new ShortestPathStep(end).description());

        this.openSteps = [];
        this.closedSteps = [];
        var endStep =  new ShortestPathStep(end);
        var curStep = start;
        this.insertInOpenSteps(new ShortestPathStep(start));
        
        do {
            curStep = this.openSteps.shift();
            //console.log('Analyze ' + curStep.description());
            this.closedSteps.push(curStep);
            if (curStep.isEqualTo(endStep)) {
                //console.log('Found end step');
                break;
            }
            
            var adjSteps = this.findWalkableAdjacentTileCoords(this.map.tileAt(curStep.position));
            //console.log("\t" + adjSteps.length + " adjSteps found: ");
            for (var iDx in adjSteps) {
                var step = new ShortestPathStep(adjSteps[iDx]);
                //console.log("\t\t" + step.description());
                if (this.inClosedSteps(step)) {
                    //console.log("\t\t\tin closed steps");
                    continue;
                }
                
                var moveCost = this.getMoveCost(curStep, step);
                var index = this.getOpenStepIndex(step);
                if (index == -1) {
                    step.parent = curStep;
                    step.gScore = curStep.gScore + moveCost;
                    step.hScore = this.computeHScore(step.position, end);
                    //console.log("\t\t\tnew open step: " + step.description());
                    this.insertInOpenSteps(step);
                } else {
                    step = this.openSteps[index];
                    
                    if ((curStep.gScore + moveCost) < step.gScore) {
                        step.gScore = curStep.gScore + moveCost;
                        this.openSteps.splice(index, 1);
                        //console.log("\t\t\texisting open step, updated gScore: " + step.description());
                        this.insertInOpenSteps(step);
                    } else {
                        //console.log("\t\t\texisting open step, do nothing");
                    }
                }
            }
        } while(this.openSteps.length > 0);
        
        step = this.closedSteps.pop();
        do {
            if (step.parent) {
                route.push(step.position);
            }
            step = step.parent;
        } while(step != null);
        
        this.closedSteps = null;
        this.openStep = null;
        
        return route;
    },
    
    insertInOpenSteps: function(step) {
        var fScore = step.fScore();
        var count = this.openSteps.length;
        var iDx = 0;
        for (; iDx < count; iDx++) {
            if (fScore <= this.openSteps[iDx].fScore()) {
                break;
            }
        }
        this.openSteps.splice(iDx, 0, step);
    },

    inClosedSteps: function(step) {
        for (var iDx = 0; iDx < this.closedSteps.length; iDx++) {
            if (step.isEqualTo(this.closedSteps[iDx])) {
                return true;
            }
        }
        return false;
    },

    getOpenStepIndex: function(step) {
        for (var iDx = 0; iDx < this.openSteps.length; iDx++) {
            if (step.isEqualTo(this.openSteps[iDx])) {
                return iDx;
            }
        }
        return -1;
    },
    
    computeHScore: function(fromPos, toPos) {
        var fromCoord = this.map.toTileCoord(fromPos);
        var toCoord = this.map.toTileCoord(toPos);
        return Math.abs(toCoord.x - fromCoord.x) + Math.abs(toCoord.y - fromCoord.y);
    },
    
    getMoveCost: function(from, to) {
        // Is it a diagonal move?
        if (PathFinder.isDiagonalStep(from.position, to.position)) {
            //sqrt(a^2 + b^2) = 1.4, where a and b = 1
            return 1.4;
        }
        return 1;
    },
    
    findWalkableAdjacentTileCoords: function(tile) {
        var coords = [];
        
        // top
        var adjTile = this.map.tileAt(cc.p(tile.getPosition().x, tile.getPosition().y + tile.getHeight()));
        if (adjTile && adjTile.isWalkable()) {
            coords.push(adjTile.getPosition());
        }
        // right
        adjTile = this.map.tileAt(cc.p(tile.getPosition().x + tile.getWidth(), tile.getPosition().y));
        if (adjTile && adjTile.isWalkable()) {
            coords.push(adjTile.getPosition());
        }
        // bottom
        adjTile = this.map.tileAt(cc.p(tile.getPosition().x, tile.getPosition().y - tile.getHeight()));
        if (adjTile && adjTile.isWalkable()) {
            coords.push(adjTile.getPosition());
        }
        // left
        adjTile = this.map.tileAt(cc.p(tile.getPosition().x - tile.getWidth(), tile.getPosition().y));
        if (adjTile && adjTile.isWalkable()) {
            coords.push(adjTile.getPosition());
        }
        // top right
        var adjTile = this.map.tileAt(cc.p(tile.getPosition().x + tile.getWidth(), tile.getPosition().y + tile.getHeight()));
        if (adjTile && adjTile.isWalkable()) {
            coords.push(adjTile.getPosition());
        }
        // top left
        adjTile = this.map.tileAt(cc.p(tile.getPosition().x - tile.getWidth(), tile.getPosition().y + tile.getHeight()));
        if (adjTile && adjTile.isWalkable()) {
            coords.push(adjTile.getPosition());
        }
        // bottom right
        adjTile = this.map.tileAt(cc.p(tile.getPosition().x + tile.getWidth(), tile.getPosition().y - tile.getHeight()));
        if (adjTile && adjTile.isWalkable()) {
            coords.push(adjTile.getPosition());
        }
        // bottom left
        adjTile = this.map.tileAt(cc.p(tile.getPosition().x - tile.getWidth(), tile.getPosition().y - tile.getHeight()));
        if (adjTile && adjTile.isWalkable()) {
            coords.push(adjTile.getPosition());
        }
        
        return coords;
    }
});

PathFinder.isDiagonalStep = function(from, to) {
    return from.x != to.x && from.y != to.y
};

PathFinder.getFacingDirection = function(curPos, nextPos) {
    if (curPos.x == nextPos.x) {
        if (curPos.y < nextPos.y) {
            return 'up';
        } else {
            return 'down';
        }
    } else {
        if (curPos.x < nextPos.x) {
            return 'right';
        } else {
            return 'left';
        }
    }
};

var ShortestPathStep = cc.Class.extend({
    position: null,
    gScore: 0,
    hScore: 0,
    parent: null,
    
    ctor: function(pos) {
        this.position = pos;
    },
    
    fScore: function() {
        return this.gScore + this.hScore;
    },
    
    isEqualTo: function(other) {
        return this.position.x == other.position.x && this.position.y == other.position.y;
    },
    
    description: function() {
        return "[" + this.position.x + ", " + this.position.y + "] g: " + this.gScore + " h: " + this.hScore + " F: " + this.fScore();
    }
});