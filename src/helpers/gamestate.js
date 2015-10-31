var GameState = cc.Class.extend({
    file: null,
    data: {},
    name: "default",
    dirName: "./savedgames/",
    ctor: function(name) {
        this.name = name || this.name;
        this.file = this.dirName + this.name + ".json";
    },
    save: function() {
        console.log('gamestate.save.1 ' + this.dirName);
        if ( ! jsb.fileUtils.isDirectoryExist(this.dirName)) {
            console.log('gamestate.save.2 ');
            jsb.fileUtils.createDirectory(this.dirName);
            console.log('gamestate.save.3 ');
        }
        console.log('gamestate.save.4 ' + JSON.stringify(this.data));
        jsb.fileUtils.writeStringToFile(JSON.stringify(this.data), this.file);
        console.log('gamestate.save.5 ' + this.file);
    },
    load: function() {
        console.log('gamestate.load.1 ' + this.file);
        if (jsb.fileUtils.isFileExist(this.file)) {
            var data = jsb.fileUtils.getStringFromFile(this.file);
            console.log('gamestate.load.2');
            try {
                this.data = JSON.parse(data);
            } catch (e) { }
            console.log('gamestate.load.3 ' + data);
        }
    },
    contains: function(key) {
        return typeof(this.data[key]) != 'undefined';
    },
    updateObjectState: function(key, object) {
        var state = {};
        for (var iDx in object) {
            if (typeof(object[iDx] != 'function')) {
                state[iDx] = object[iDx];
            }
        }
        this.data[key] = state;
    },
    getObjectState: function(key) {
        if (typeof(this.data[key]) != 'undefined') {
            return this.data[key];
        }
        return null;
    }
});