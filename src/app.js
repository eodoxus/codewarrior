var App = cc.Layer.extend({
    gamestate: null,
    hero: null,
    hud: null,
    map: null,
    pack: null,
    transitioning: false,
    heroWalkingBatch: null,
    
    ctor:function () {
        this._super();
        App.instance = this;
        
        winSize = cc.director.getWinSize();
        
        this.gamestate = new GameState();
        this.gamestate.load('default');
        
        this.initAssets();
        this.initInputListeners();
        
        this.scheduleUpdate();
        return true;
    },
    
    initAssets: function() {
        // Overworld map
        this.map = new Map(res.maps_overworld);
        this.map.init();
        this.addChild(this.map);

        // Hero walking
        cc.spriteFrameCache.addSpriteFrames(res.hero_animations_walking_plist);
        var texHeroWalking = cc.textureCache.addImage(res.hero_animations_walking_frames);
        texHeroWalking.setAliasTexParameters();
        this.heroWalkingBatch = new cc.SpriteBatchNode(texHeroWalking);
        this.addChild(this.heroWalkingBatch);

        this.hero = new Hero();
        this.hero.setPosition(this.map.getHeroSpawnPoint());
        this.heroWalkingBatch.addChild(this.hero);

        // HUD
        cc.spriteFrameCache.addSpriteFrames(res.hud_plist);
        var texHud = cc.textureCache.addImage(res.hud_frames);
        texHud.setAliasTexParameters();
        var hudBatch = new cc.SpriteBatchNode(texHud);
        this.addChild(hudBatch);

        // Collectables
        cc.spriteFrameCache.addSpriteFrames(res.collectables_plist);
        var texCollectables = cc.textureCache.addImage(res.collectables_frames);
        texCollectables.setAliasTexParameters();
        var collectablesBatch = new cc.SpriteBatchNode(texCollectables);
        this.addChild(collectablesBatch);


        this.hud = new Hud();
        this.addChild(this.hud);
    },
    
    transitionMap: function(doorway) {
        this.transitioning = true;
        doorway.playSound();
        
        var afterFadeOut = new cc.CallFunc(function(){
            this.removeChild(this.map, true);
            this.map = new Map(res["maps_" + doorway.getDestination()]);
            this.addChild(this.map);
            this.map.init();
            
            this.hero.setPosition(doorway.getDestinationSpawnPoint());
            this.hero.setFacingDirection(doorway.getSpawnDirection());
            this.hero.runAction(cc.fadeIn(1));
            this.reorderChild(this.heroWalkingBatch, 1);
            
            this.reorderChild(this.hud, 1);
            
            this.transitioning = false;
        }, this);

        this.hero.runAction(new cc.Sequence(cc.fadeOut(1), afterFadeOut));
        this.saveGame();
    },

    showPack: function() {
        this.packShowing = true;
        this.scroll = new cc.Sprite(res.scroll_sprite);
        //this.scroll.setScale(.9, .9);
        this.scroll.setPosition(cc.p(winSize.width / 2, winSize.height / 2));
        this.addChild(this.scroll, 2);
    },

    hidePack: function() {
        this.removeChild(this.scroll, true);
        this.packShowing = false;
    },
    
    initInputListeners: function() {
        if (cc.sys.capabilities.hasOwnProperty('keyboard')) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed:function (key, event) {
                    APP.KEYS[key] = true;
                },
                onKeyReleased:function (key, event) {
                    APP.KEYS[key] = false;
                }
            }, this);
        }

        if ('mouse' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseDown: function(event){
                    if(event.getButton() == cc.EventMouse.BUTTON_LEFT)
                        event.getCurrentTarget().handleInputEvent(event);
                }
            }, this);
        }

        if (cc.sys.capabilities.hasOwnProperty('touches')) {
            cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                onTouchBegan:function (touch, event) {
                    event.getCurrentTarget().handleInputEvent(touch);
                    return false;
                }
            }, this);
        }
    },

    update: function(dt) {
        var tile = this.map.tileAt(this.hero.getPosition());
        if ( ! this.transitioning && tile && tile.isTransitional()) {
            var doorway = this.map.doorwayAt(this.hero.getPosition());
            if (doorway) {
                this.hero.stop();
                this.transitionMap(doorway);
            }
        } else if (tile && tile.isCollectable()) {
            var collectable = this.map.collectableAt(this.hero.getPosition());
            if (collectable) {
                this.map.removeCollectable(collectable);
                var self = this;
                this.hero.collect(collectable, function() {
                    self.hud.draw();
                    self.saveGame();
                    self.map.removeChild(collectable.getSprite(), true);
                });
            } else {
                this.hero.update(dt);
            }
        } else {
            this.hero.update(dt);
        }
    },
    
    handleInputEvent:function (touch) {
        if (this.transitioning) {
            return;
        }
        var touchLocation = touch.getLocation();
        var hudItem = this.hud.itemAt(touchLocation);
        if (hudItem) {
            hudItem.handleTouch(touchLocation);
            return;
        }

        if (this.packShowing) {
            return;
        }

        var tile = this.map.tileAt(touchLocation);
        if ( ! tile) {
            return;
        }
        var self = this;
        if (this.hero.isWalking()) {
            this.hero.stop(function(){
                self.hero.walkTo(tile.getPosition());
            });
        } else {
            this.hero.walkTo(tile.getPosition());
        }
    },

    saveGame: function() {
        this.map.saveState();
        this.hero.saveState();
        this.gamestate.save();
    }
});

App.scene = function() {
    var scene = new cc.Scene();
    var layer = new App();
    scene.addChild(layer, 1);
    return scene;
};

App.instance = null;
