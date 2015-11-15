var Map = cc.TMXTiledMap.extend({
    _backgroundLayer: null,
    _collectables: null,
    _doorways: null,
    _metaLayer: null,
    
    ctor: function (tmxFile) {
        this._super(tmxFile);
        this._backgroundLayer = this.getLayer("background");
        this._metaLayer = this.getLayer("meta");
        this._metaLayer.setVisible(false);

        this._collectables = [];
        this._doorways = [];
        
        var objectGroup = this.getObjectGroup("objects");
        if (objectGroup) {
            var objects = objectGroup.getObjects();
            for (var iDx in objects) {
                var object = objects[iDx];
                var state = null;
                if (object["type"]) {
                    if (object["type"] == "collectable") {
                        var collectable = new Collectable(object);
                        state = App.instance.gamestate.getObjectState(this.getName() + '::' + collectable.id);
                        if (state) {
                            collectable.initState(state);
                        }
                        if (collectable.isAlive()) {
                            this._collectables.push(collectable);
                            this.addChild(collectable.getSprite());
                        }
                    }
                    if (object["type"] == "doorway") {
                        this._doorways.push(new Doorway(object));
                    }
                }
            }
        }
    },
    
    init: function() {
        this.playAmbientMusic();
    },
    
    getName: function() {
        return this.getProperties()["name"] || "misc";
    },
    
    getHeroSpawnPoint: function() {
        return cc.p(this._metaLayer.getProperties()["spawnX"], this._metaLayer.getProperties()["spawnY"]);
    },
    
    toTileCoord: function(position) {
        var x = Math.floor(position.x / this.getTileSize().width);
        var y = Math.floor((this.height - position.y) / this.getTileSize().height);
        return cc.p(x, y);
    },

    tileAt: function(position) {
        if (position.x < 0 || position.x > this.width || position.y < 0 || position.y > this.height) {
            return null;
        }
        var tileCoord = this.toTileCoord(position);
        var sprite = this._backgroundLayer.getTileAt(tileCoord);
        var gid = this._metaLayer.getTileGIDAt(tileCoord);
        var properties = this.getPropertiesForGID(gid);
        return new Tile(sprite, properties);
    },

    collectableTileAt: function(position) {
        if (position.x < 0 || position.x > this.width || position.y < 0 || position.y > this.height) {
            return null;
        }
        var tileCoord = this.toTileCoord(position);
        var sprite = this._backgroundLayer.getTileAt(tileCoord);
        var gid = this._metaLayer.getTileGIDAt(tileCoord);
        var properties = this.getPropertiesForGID(gid);
        return new Tile(sprite, properties);
    },

    doorwayAt: function(position) {
        for (var iDx in this._doorways) {
            var obj = this._doorways[iDx];
            if (obj.intersects(position)) {
                return obj;
            }
        }
        return null;
    },

    collectableAt: function(position) {
        for (var iDx in this._collectables) {
            var obj = this._collectables[iDx];
            if (obj.intersects(position)) {
                return obj;
            }
        }
        return null;
    },

    removeCollectable: function(collectable) {
        for (var iDx in this._collectables) {
            if (this._collectables[iDx].id == collectable.id) {
                collectable.state = MapObject.states.DEAD;
                App.instance.gamestate.updateObjectState(this.getName() + '::' + collectable.id, collectable);
                this._collectables.splice(iDx, 1);
            }
        }
    },

    playAmbientMusic: function() {
        this.playMusic('ambient');
    },

    playSound: function(name) {
        var sound = this._metaLayer.getProperties()['sound_' + name];
        if (sound) {
            cc.audioEngine.playEffect(sound);
        }
    },

    playMusic: function(name) {
        var music = this._metaLayer.getProperties()['music_' + name];
        if (music) {
            cc.audioEngine.playMusic(music);
        }
    },

    saveState: function() {
        var iDx = 0;
        for (; iDx < this._collectables.length; iDx++ ) {
            this._collectables[iDx].setMapName(this.getName());
            this._collectables[iDx].saveState();
        }
    }
});

Map.TILE_WIDTH = 8;
Map.TILE_HEIGHT = 8;

var Tile = cc.Class.extend({
    _sprite: null,
    _properties: null,
    
    ctor: function(sprite, properties) {
        this._sprite = sprite;
        this._properties = properties || [];
    },
    
    getPosition: function() {
        return cc.p(this._sprite.x + this._sprite.width / 2, this._sprite.y + this._sprite.height / 2);
    },
     
    isWalkable: function() {
        return this._properties["collidable"] != "true";
    },

    isTransitional: function() {
        return this._properties["transitional"] == "true";
    },

    isCollectable: function() {
        return this._properties["collectable"] == "true";
    },
    
    highlight: function(color) {
        this._sprite.setColor(color);
    },
    
    getHeight: function() {
        return this._sprite.height;
    },
    
    getWidth: function() {
        return this._sprite.width;
    }
});

var MapObject = cc.Class.extend({

    ctor: function(properties) {
        for (var key in properties) {
            this[key] = properties[key];
        }
        this.id = properties["type"] + "." + properties["name"] + "." + properties["x"] + "." + properties["y"];
        this.state = MapObject.states.ALIVE;
    },

    initState: function(state) {
        for (var key in state) {
            this[key] = state[key];
        }
    },
    
    getName: function() {
        return this.name;
    },

    getPosition: function() {
        return cc.p(this.x, this.y);
    },

    intersects: function(position) {
        var start = cc.p(this.x, this.y);
        var end = cc.p(start.x + this.width, start.y + this.height);
        return position.x >= start.x && position.x <= end.x && position.y >= start.y && position.y <= end.y;
    },

    getHeight: function() {
        return this.height;
    },

    getWidth: function() {
        return this.width;
    },

    isAlive: function() {
        return this.state != MapObject.states.DEAD;
    },

    setMapName: function(mapName) {
        this.mapName = mapName;
    },
    
    saveState: function() {
        var data = {};
        data.x = this.x;
        data.y = this.y;
        data.state = this.state;
        App.instance.gamestate.updateObjectState(this.mapName + '::' + this.id, data);
    }
});

MapObject.states = {
    DEAD: 0,
    ALIVE: 1
};

var Doorway = MapObject.extend({
    getDestination: function() {
        return this.destination;
    },

    getDestinationSpawnPoint: function() {
        return cc.p(this.spawnX, this.spawnY);
    },

    getSpawnDirection: function() {
        return this.spawnDirection;
    },

    playSound: function(name) {
        var sound = this.sound;
        if (sound) {
            cc.audioEngine.playEffect(sound);
        }
    },
});

var Collectable = MapObject.extend({
    
    _sprite: null,
    
    ctor: function(properties) {
        this._super(properties);
        this._sprite = new cc.Sprite(this.asset);
        this._sprite.setPosition(this.getPosition());
        this._sprite.setAnchorPoint(cc.p(0, -.5));
    },
    
    getSprite: function() {
        return this._sprite;
    },
    
    isTrophy: function() {
        return this.trophy == "true";
    }
});
