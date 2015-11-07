var GameState = cc.Class.extend({
    file: null,
    data: {},
    name: "default",
    dirName: "/tmp/savedgames/",
    ctor: function(name) {
        this.name = name || this.name;
        this.file = this.dirName + this.name + ".json";
    },
    save: function() {
        if ( ! jsb.fileUtils.isDirectoryExist(this.dirName)) {
            jsb.fileUtils.createDirectory(this.dirName);
        }
        jsb.fileUtils.writeStringToFile(JSON.stringify(this.data), this.file);
    },
    load: function() {
return;
        if (jsb.fileUtils.isFileExist(this.file)) {
            var data = jsb.fileUtils.getStringFromFile(this.file);
            try {
                this.data = JSON.parse(data);
            } catch (e) { }
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