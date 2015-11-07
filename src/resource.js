var res = {
    collectables_plist: "res/sprites/collectables.plist",
    collectables_frames: "res/sprites/collectables.png",
    hero_animations_walking_plist: "res/sprites/hero/walking.plist",
    hero_animations_walking_frames: "res/sprites/hero/walking.png",
    hud_plist: "res/sprites/hud.plist",
    hud_frames: "res/sprites/hud.png",
    maps_overworld: "res/maps/overworld.tmx",
    maps_cave: "res/maps/cave.tmx",
    tilesets_meta: "res/tilesets/meta.png",
    tilesets_overworld: "res/tilesets/overworld.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}