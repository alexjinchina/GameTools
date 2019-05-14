import os
import json
import sqlite3

from utils import load_json, save_json

MAX_ORB_ITEMS = 4

STORAGE_TABLE_NAME = "storage"


class Level_Home_Item:
    def __init__(self, data):
        self._data = data

    @property
    def id(self):
        return int(self._data[0])

    def get_orb_spawned_items(self):
        return [
            Level_Home_Item(v)
            for v in self._data.get(11, {}).get(1, {}).itervalues()
        ]


class Level_Home:
    STORAGE_FILENAME = "Level_Home"
    FIELD_ITEMS = 2

    def __init__(self, db):
        self.db = db

        return

    @property
    def data(self):
        return self.db.get_storage_file(self.STORAGE_FILENAME)

    @property
    def _items_data(self):
        return self.data[2]

    @property
    def items(self):
        return [
            Level_Home_Item(item_data)
            for item_data in self._items_data.itervalues()
        ]

    def add_item(self, item):
        if isinstance(item, Level_Home_Item):
            item = item._data
        id = int(item[0])
        if id in self._items_data:
            raise KeyError()
        self._items_data[id] = item
        self.set_modified()
        print "item[%s] added." % id

    def set_modified(self):
        self.db.updated_storage_files.add(self.STORAGE_FILENAME)

    def unlock_area(self, *areas):
        for x, flags in self.data[1][1][0].iteritems():
            for y, flag in flags.iteritems():
                if areas and flag not in areas:
                    continue
                flags[y] = "NONE"

                self.data[1][0]["%s_%s" % (x, y)] = {
                    0: x, 1: y,
                    2: {},
                    3: False,
                    4: False,
                    5: None,
                    6: None
                }
                print "%s(%s,%s): unlocked" % (flag, x, y)
                self.set_modified()
                continue
            continue
        return

    def calc_next_item_id(self):
        next_item_id = 1

        for item in self.items:
            if item.id >= next_item_id:
                next_item_id = item.id + 1
            for item2 in item.get_orb_spawned_items():
                if item2.id >= next_item_id:
                    next_item_id = item2.id + 1
                continue
            continue
        return next_item_id

    def add_orb_item(self,
                     items,
                     orb_class="Loot_Orb_1_Root",

                     ):
        next_item_id = self.calc_next_item_id()
        for item, count in items:
            count = int(count)
            while count > 0:
                n = min(count, MAX_ORB_ITEMS)
                orb_id = next_item_id
                next_item_id += 1
                orb = {
                    0: str(orb_id),
                    1: orb_class,
                    2: {
                        "x": 15.0538578,
                        "y": 10.84839,
                        "z": 12.2916689
                    },
                    3: 1,
                    4: 1,
                    5: False,
                    11: {
                        0: {},
                        1: {}
                    },
                    18: -1,
                    19: False,
                    20: False,
                    23: 1,
                    24: 1,
                    25: False,
                    26: True,
                    27: 6
                }
                for i in range(n):
                    orb[11][0][i] = item
                self.add_item(orb)
                count -= n
            continue
        return


class Database:
    def __init__(self,
                 fields_file="fields.json",
                 items_define_file="items.json"):
        self.fields = load_json(fields_file)
        self.key_fields = {}
        for filename, fields in self.fields.iteritems():
            for field, value_info in fields.iteritems():
                if isinstance(value_info, str) or isinstance(value_info, unicode):
                    key = value_info
                    value_type = None
                else:
                    key = value_info["key"]
                    value_type = value_info.get("type",None)
                if key[-1] != '?':
                    self.key_fields[key] = (filename, field, value_type)

        self.items_define_file = items_define_file
        self.items_define = load_json(items_define_file)

        self.conn = None
        self.storage = None
        self.updated_storage_files = None

        pass

    def open(self, filename="md_db.db"):
        self.close()
        filename = os.path.abspath(filename)
        if not os.path.exists(filename):
            raise RuntimeError("db file: %s not found!" % filename)
        self.conn = sqlite3.connect(filename)
        self.db_filename = filename
        self.storage = {}
        c = self.conn.cursor()
        c.execute("SELECT * FROM %s;" % STORAGE_TABLE_NAME)
        for filename, data in c.fetchall():
            self.storage[filename] = load_json(data)
            continue
        self.updated_storage_files = set()

        return

    def save(self):
        if not self.conn:
            return
        for f in self.updated_storage_files:
            print "updating storage file: %s ..." % f
            self.conn.execute(
                'UPDATE storage SET data=? WHERE file="%s";' % f,
                (json.dumps(self.get_storage_file(f)),))
        self.conn.commit()
        self.updated_storage_files.clear()

    def close(self):
        if self.conn:
            self.conn.close()
        self.conn = None
        self.storage = None
        self.updated_storage_files = None

    def dump_storage(self, dump_dir="db_dump", files=[]):
        table_dir = os.path.join(dump_dir, STORAGE_TABLE_NAME)
        if not os.path.isdir(table_dir):
            os.makedirs(table_dir)
        for filename, data in self.storage.iteritems():
            dump_filename = os.path.join(table_dir, filename+".json")
            print "dumping file: %s ..." % dump_filename
            save_json(data, dump_filename)

    @property
    def Level_Home(self):
        return Level_Home(self)

    def update_items_file(self, filename=None):
        if not self.conn:
            return
        updated = False
        for items in self.get_storage_file("_ObjectDefState").itervalues():
            for item in items.itervalues():
                if item not in self.items_define:
                    print "item: %s added into items file" % item
                    self.items_define[item] = {}
                updated = True
        if updated:
            save_json(self.items_define, filename or self.items_define_file)
        return

    def get_storage_file(self, filename):
        return self.storage[filename]

    def replace_storage_file(self, filename, data):
        # print data
        self.storage[filename] = load_json(data)
        self.updated_storage_files.add(filename)

    def set_value(self, key, value, echo=False):
        filename, field, value_type = self.key_fields[key]
        data = self.get_storage_file(filename)
        old = data[field]
        if value_type == "int":
            value = int(value)
        if old != value:
            data[field] = value
            self.updated_storage_files.add(filename)
            if echo:
                print "%s: %s->%s" % (key, old, value)
        return old

    def get_value(self, key):
        filename, field, _ = self.key_fields[key]
        data = self.get_storage_file(filename)
        return data[field]


if __name__ == "__main__":
    db = Database()
    db.open()
    # db.Level_Home.unlock_area("M3")
    #db.Level_Home.add_orb_item(items=[("Bones 1", 10)])
    db.set_value("gold", 1000)

    db.save()
    db.close()
