var res = {
    maps_overworld: "res/maps/overworld.tmx",
    maps_cave: "res/maps/cave.tmx",
    hero_animations_walking_plist: "res/sprites/hero/walking.plist",
    hero_animations_walking_frames: "res/sprites/hero/walking.png",
    tilesets_meta: "res/tilesets/meta.png",
    tilesets_overworld: "res/tilesets/overworld.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}