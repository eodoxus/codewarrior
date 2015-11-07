var Hud = cc.Sprite.extend({
    items: null,
    hero: null,
    ctor: function() {
        this._super("#hud_container.png");
        this.setPosition(cc.p(320, 240));
        this.setAnchorPoint(cc.p(1, 1));
        this.hero = App.instance.hero;

        this.draw();

        //var box = new cc.DrawNode();
        //this.addChild(box);
        //box.drawRect(cc.p(0, 0), cc.p(this.width, this.height), cc.color(0,255,0,40), 1, cc.color(255,255,255,255));
    },
    draw: function() {
        this.removeAllChildren();
        this.items = [];

        if (this.hero.inventoryContains('scroll_writer')) {
            this.items.push(new HudScrollWriter());
        }

        var healthBar = new HudHealthBar(
            this.hero.getMaxHealth(),
            this.hero.getCurrentHealth()
        );
        this.items.push(healthBar);
        
        for (var iDx in this.items) {
            this.addChild(this.items[iDx]);
        }

        healthBar.draw();
    },
    itemAt: function(location) {
        var point = this.translateInputLocation(location);
        if (point.x > 0 && point.y > 0) {
            for (var iDx in this.items) {
                var item = this.items[iDx];
                if (point.x >= item.x 
                    && point.x <= item.x + item.width
                    && point.y >= item.y
                    && point.y <= item.y + item.height
                ) {
                    return item;
                }
            }
        }
        return null;
    },
    translateInputLocation: function(location) {
        var x = location.x - this.x + this.width;
        var y = location.y - this.y + this.height;
        return cc.p(x,y);
    }
});

var HudItem = cc.Sprite.extend({
    ctor: function(image) {
        this._super(image);
        this.setAnchorPoint(0, 0);
    },
    handleTouch: function() {

    }
});

var HudScrollWriter = HudItem.extend({
    isOpen: false,
    ctor: function() {
        this._super("#scroll_writer.png");
        this.setScale(.5, .5);
        this.setPosition(cc.p(8, 10));
        this.setName('ScrollWriter');
    },
    handleTouch: function() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },
    open: function() {
        this.isOpen = true;
        App.instance.showPack();
    },
    close: function() {
        this.isOpen = false;
        App.instance.hidePack();
    }
});

var HudHealthBar = cc.DrawNode.extend({
    max: 0,
    current: 0,
    heartWidth: 10,
    containerHeight: 10,
    containerWidth: 0,
    ctor: function(max, current) {
        this._super();
        this.max = max,
        this.current = current;
        this.containerWidth = this.heartWidth * (this.max / 2);

        this.setAnchorPoint(0, 0);
        this.setName('HealthBar');
    },
    draw: function() {
        var parentSize = this.getParent().getContentSize();
        //this.setPosition(cc.p(parentSize.width, parentSize.height));
        this.setPosition(cc.p(parentSize.width - this.containerWidth, parentSize.height - this.containerHeight));
        this.setContentSize(this.containerWidth, this.containerHeight);

        //this.drawRect(cc.p(0, 0), cc.p(this.containerWidth, this.containerHeight), cc.color(255,0,0,40), 1, cc.color(255,255,255,255));

        // draw filled
        var numFull = Math.floor(this.current / 2);
        var numPartial = Math.ceil(this.current % 2 != 0);
        var numEmpty = this.max/2 - numFull - numPartial;

        this.removeAllChildren();
        var iDx = 0;
        for (; iDx < numFull; iDx ++) {
            this.drawHeart('full', iDx * this.heartWidth);
        }
        if (numPartial > 0) {
            this.drawHeart('piece', (iDx++) * this.heartWidth);
        }
        for (jDx = 0; jDx < numEmpty; jDx ++) {
            this.drawHeart('empty', (jDx + iDx) * this.heartWidth);
        }
    },
    drawHeart: function(type, dx) {
        var sprite = new cc.Sprite('#hud_heart_' + type + '.png');
        sprite.setAnchorPoint(0, 0);
        sprite.setPosition(dx, 0);
        sprite.setScale(.3, .3);
        this.addChild(sprite);
    },
    increase: function(byAmount) {
        
    },
    reduce: function(byAmount) {
        
    },
    handleTouch: function() {

    }
});

