var res = {
    maps_overworld: "res/maps/overworld.tmx",
    tilesets_overworld: "res/maps/overworld.png",
    tilesets_meta: "res/maps/meta.png",
    collectables_plist: "res/sprites/collectables.plist",
    collectables_frames: "res/sprites/collectables.png",
    hero_animations_walking_plist: "res/sprites/hero/walking.plist",
    hero_animations_walking_frames: "res/sprites/hero/walking.png",
    hud_plist: "res/sprites/hud.plist",
    hud_frames: "res/sprites/hud.png",
    maps_cave: "res/maps/cave.tmx",
    music_overworld: "res/music/overworld.ogg",
    music_cave: "res/music/cave.ogg"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}