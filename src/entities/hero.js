var Hero = cc.Sprite.extend({
    _elapsed: 0,
    _curFrame: 1,
    _state: null,
    _pathfinder: null,
    _facingDirection: 'up',
    _inventory: {},
    
    ctor: function () {
        this._super("#" + this.getFrameName(this._curFrame));
        this._pathfinder = new PathFinder(App.instance.map);
        //this.anchorX = 0;
        this.anchorY = .25;
        //this.x = 44;//160;
        //this.y = 180;//12;
        this._state = Hero.states.STOPPED;
        this.loadSavedState();
    },

    loadSavedState: function() {
        if (App.instance.gamestate.contains('hero')) {
            var obj = App.instance.gamestate.getObjectState('hero');
            for (var iDx in object) {
                this[iDx] = object[iDx];
            }
        }
    },
    
    saveState: function() {
        var data = {};
        data.x = this.x;
        data.y = this.y;
        data._facingDirection = this._facingDirection;
        data._inventory = this._inventory;
        data._curFrame = this._curFrame;
        data._state = this._state;
        App.instance.gamestate.updateObjectState('hero', data);
    },
    
    update: function(dt) {
        this._elapsed += dt;
        
        if (this._state == Hero.states.WALKING) {
            if (this._elapsed > .05) {
                var frame = this.getWalkingFrame();
                this.setSpriteFrame(frame);
                this._elapsed = 0;
            }
        }
    },
    
    setState: function(state) {
        this._state = state;
    },
    
    setFacingDirection: function(direction) {
        this._facingDirection = direction;
        var frameName = this.getFrameName(Hero.animations.walking[this._facingDirection].start);
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(frameName));
    },
    
    getStoppedFrame: function() {
        var animations = Hero.animations.walking,
            frameNumber = 1;
        for (var iDx in animations) {
            if (animations[iDx] instanceof Frameset) {
                if (this._curFrame >= animations[iDx].start && this._curFrame <= animations[iDx].end) {
                    frameNumber = animations[iDx].start;
                    break;
                }
            }
        }
        return cc.spriteFrameCache.getSpriteFrame(this.getFrameName(frameNumber));
    },

    getWalkingFrame: function() {
        this._curFrame = this.getNextFrameNumber(Hero.animations.walking[this._facingDirection]);
        return cc.spriteFrameCache.getSpriteFrame(this.getFrameName(this._curFrame));
    },
    
    getStateFrame: function() {
        switch (this._state) {
            case Hero.states.ACQUIRING_TROPHY:
                return cc.spriteFrameCache.getSpriteFrame(this.getFrameName(Hero.animations.acquiring));
            case Hero.states.SCRIPTING:
                return cc.spriteFrameCache.getSpriteFrame(this.getFrameName(Hero.animations.scripting));
            default:
                return this.getStoppedFrame();
        }
    },

    getNextFrameNumber: function(frameSet) {
        if (this._curFrame < frameSet.start) {
            return frameSet.start;
        } else if (this._curFrame >= frameSet.end) {
            return frameSet.start;
        }
        return this._curFrame + 1;
    },

    getFrameName: function (number) {
        var prefix = Hero.constants.FRAME_PREFIX;
        if (number.toString().length < 2) {
            prefix += "0";
        }
        return prefix + number + Hero.constants.FRAME_SUFFIX;
    },
    
    walkTo: function(destination) {
        if (this.getPosition() == destination) {
            // Already there, so do nothing
            return;
        }
        if (this._state == Hero.states.ACQUIRING_TROPHY) {
            return;
        }
        this.setState(Hero.states.WALKING);
        this._pathfinder.setMap(App.instance.map);
        var route = this._pathfinder.findRoute(this.getPosition(), destination);
        this.traverseRoute(route);
    },

    isWalking: function() {
       return this._state == Hero.states.WALKING;
    },
    
    stop: function(callback) {
        callback = callback || function(){};
        if (this._state == Hero.states.STOPPED) {
            callback();
        }
        
        this.setState(Hero.states.STOPPING);
        this.setSpriteFrame(this.getStoppedFrame());
        
        var self = this;
        function checkState() {
            if (self._state == Hero.states.STOPPING) {
                setTimeout(checkState, 10);
            } else {
                callback();
            }
        }
        checkState();
    },

    traverseRoute: function(route) {
        var nextPos = route.pop();
        if (route.length == 0) {
            this.setState(Hero.states.STOPPED);
            this.setSpriteFrame(this.getStoppedFrame());
        } else if (this._state == Hero.states.STOPPING) {
            this.traverseRoute(route);
        } else {
            this._facingDirection = PathFinder.getFacingDirection(this.getPosition(), nextPos);
            var moveDuration = PathFinder.isDiagonalStep(this.getPosition(), nextPos) ? .09 : .07;
            var actionTo = new cc.MoveTo(moveDuration, nextPos);
            var self = this;
            var callback = new cc.CallFunc(function(){
                self.traverseRoute(route);
            }, this);
            this.runAction(new cc.Sequence(actionTo, callback));
        }
    },
    
    collect: function(item, callback) {
        this._inventory.collectables = this._inventory.collectables || [];
        this._inventory.collectables.push(item);
        if (item.isTrophy()) {
            var self = this;
            this.stop(function(){
                self.setState(Hero.states.ACQUIRING_TROPHY);
                self.setSpriteFrame(self.getStateFrame());
                item.getSprite().setPosition(cc.p(
                    self.x - item.getWidth() / 2,
                    self.y + 8
                ));
                setTimeout(function() {
                    self.setFacingDirection('down');
                    self.setState(Hero.states.STOPPED);
                    callback();
                }, 3000);
            });
        }
    }
});

Hero.constants = {
    FRAME_PREFIX: "walking_",
    FRAME_SUFFIX: ".png"
};
Hero.animations = {
    walking: {
        up: new Frameset(23, 30),
        down: new Frameset(42, 49),
        right: new Frameset(1, 8),
        left: new Frameset(31, 38)
    },
    scripting: 9,
    acquiring: 10
};

Hero.states = {
    STOPPED: 0,
    WALKING: 1,
    STOPPING: 2,
    ACQUIRING_TROPHY: 3,
    SCRIPTING: 4
};

