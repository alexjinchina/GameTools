import json
from utils import load_json, save_json

# with open("db_dump/storage/Level_Home.json") as fd:
#     Level_Home = json.load(fd)
#     fd.close()

# HOME={

# }
# areas={}
# for x, ys in Level_Home["1"]['1']['0'].iteritems():
#     for y, area in ys.iteritems():
#         if not area in areas:
#             areas[area]=list()
#         areas[area].append([int(x),int(y)])
# HOME["areas"]=areas
# with open("home.json","wb") as fd:
#     json.dump(HOME,fd)
#     fd.close()

CONFIG_JSON = "games-config.json"


def updateMergeDragonsHome(config):
    HOME_JSON = "config/merge_dragons/home.json"
    home = load_json(HOME_JSON)
    premium_areas = set(home["cash_areas"])
    for area, lands in home["areas"].iteritems():
        config["locks"][area] = {
            "lands": lands,
            "is_premium_Land": area in premium_areas
        }

    config["extra"]["unlocked_land_data"] = home["unlockedLandPieces"]
    return


def updateMergeDragons(config):
    md = config["merge_dragons"]

    if "extra" not in md:
        md["extra"] = {}
    updateMergeDragonsHome(md)


config = load_json(CONFIG_JSON)
updateMergeDragons(config)

save_json(config, CONFIG_JSON)
