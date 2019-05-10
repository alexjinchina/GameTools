import json
from utils import load_json, save_json

with open("db_dump/storage/Level_Home.json") as fd:
    Level_Home = json.load(fd)
    fd.close()

HOME={

}
areas={}
for x, ys in Level_Home["1"]['1']['0'].iteritems():
    for y, area in ys.iteritems():
        if not area in areas:
            areas[area]=list()
        areas[area].append([int(x),int(y)])
HOME["areas"]=areas
with open("home.json","wb") as fd:
    json.dump(HOME,fd)
    fd.close()