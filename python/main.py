import sys
import os
import json
import copy
import argparse
import shutil

from utils import load_json, save_json
import adb 
from db import Database



ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
SAVE_FILES_DIR = os.path.join(ROOT_DIR,"save_files")

GAMES_CONFIG_JSON= os.path.join(ROOT_DIR,"config","games-config.json")

parser = argparse.ArgumentParser()

parser.add_argument("--game",
                    default="merge_dragons"
                    )

parser.add_argument("--device",
                    default="emulator-5554"
                    )


parser.add_argument("--save-files-dir",
                    default=None
                    )


parser.add_argument("--db",
                    default="md_db.db"
                    )

parser.add_argument("--adb-pull",
                    action="store_true",
                    default=False
                    )

parser.add_argument("--adb-push",
                    action="store_true",
                    default=False
                    )

parser.add_argument("--adb-no-stop",
                    action="store_false",
                    dest="adb_stop",
                    default=True
                    )

parser.add_argument("--adb-start",
                    action="store_true",
                    default=False
                    )

parser.add_argument("--adb-restart",
                    action="store_true",
                    default=False
                    )

parser.add_argument("--dump",
                    action="store_true",
                    default=False
                    )

parser.add_argument("--db-dump-dir",
                    default="db_dump"
                    )


parser.add_argument("--replace-storage-file",
                    nargs="*",
                    )


parser.add_argument("--no-backup",
                    action="store_false",
                    dest="backup",
                    default=True
                    )

parser.add_argument("--recover",
                    action="store_true",
                    default=False
                    )

# parser.add_argument("--diff-storage-file",
#                     nargs="*",
#                     )
# parser.add_argument("--diff-all-fields",
#                     action="store_true",
#                     default=False
#                     )

# parser.add_argument("--diff-max",
#                     type=int,
#                     default=sys.maxint
#                     )


# parser.add_argument("--fields-file",
#                     default="fields.json"
#                     )

# parser.add_argument("--items-file",
#                     default="items.json"
#                     )

parser.add_argument("--no-update-items-file",
                    action="store_false",
                    dest="update_items_file",
                    default=True
                    )

# parser.add_argument("--list",
#                     action="store_true",
#                     default=False
#                     )

parser.add_argument("--no-save",
                    action="store_false",
                    dest="save",
                    default=True
                    )

parser.add_argument("--unlock-area",
                    nargs="*"
                    )

parser.add_argument("--unlock-cash-areas",
                    action="store_true",
                    default=False
                    )

parser.add_argument("--add-item",
                    nargs=2,
                    action="append"
                    )

parser.add_argument("--set-value",
                    nargs=2,
                    action="append"
                    )

parser.add_argument("--list-keys",
                    action="store_true",
                    default=False
                    )


args = parser.parse_args()
print args

print GAMES_CONFIG_JSON
try:
    config = load_json(GAMES_CONFIG_JSON)[args.game]
except KeyError:
    print "Error: game %s not found!" % args.game
    sys.exit(1)

package_name = config["package_name"]

save_files_dir = args.save_files_dir or os.path.join( SAVE_FILES_DIR,args.game)




if (args.adb_pull and args.adb_stop) or args.adb_restart:
    adb.stop(package_name,device=args.device)

if args.adb_pull:
    os.system("adb pull %s/md_db.db %s" % (ADB_REMOTE_ROOT, args.db))
    pass


ROOT_DIR = os.path.dirname(args.db)
db = Database()


db_bak = args.db+".bak"
if args.recover and os.path.isfile(db_bak):
    print "recover from %s ..." % db_bak
    shutil.copyfile(db_bak, args.db)
if args.backup:
    print "backup to %s ..." % db_bak
    shutil.copyfile(args.db, db_bak)

db.open(args.db)

if args.dump:
    if not os.path.isdir(args.db_dump_dir):
        os.makedirs(args.db_dump_dir)
    db.dump_storage(args.db_dump_dir)


if args.update_items_file:
    db.update_items_file()

# if args.list:
#     for key, (filename, col) in sorted(KEY_FIELDS.iteritems()):
#         value = db[filename].get(col)
#         if isinstance(value, dict):
#             value = type(value)
#         print "%s=%s" % (key, value)
#     lock_flags = {}
#     for x, flags in db["Level_Home"][1][1][0].iteritems():
#         for y, flag in flags.iteritems():
#             if flag not in lock_flags:
#                 lock_flags[flag] = []
#             lock_flags[flag].append((x, y))
#     for flag, cells in sorted(lock_flags.iteritems(), key=lambda x: x[0]):
#         print "locked area: %s (%s cells)" % (flag, len(cells))


# def cmp_key(key1, key2):
#     try:
#         return cmp(int(key1), int(key2))
#     except:
#         return cmp(key1, key2)


# def diff_map(m1, m2, excludes=set(), indent=0, diff_max=None):
#     diff_max = diff_max or args.diff_max
#     keys = sorted((set(m1.keys()) | set(m2.keys())) - excludes, cmp=cmp_key)
#     diff_count = 0
#     for key in keys:
#         v1 = m1.get(key)
#         v2 = m2.get(key)
#         if v1 != v2:
#             tabs = "\t" * indent
#             if isinstance(v1, dict) or isinstance(v2, dict):
#                 print tabs+"%s:" % key
#                 diff_map(v1 or {}, v2 or {}, indent=indent+1)
#             else:
#                 print (tabs+"%s: %s <=> %s") % (key, v1, v2)
#             diff_count += 1
#             if diff_count >= diff_max:
#                 break
#     pass


# def diff_storage_file(filename):
#     f = os.path.splitext(os.path.basename(filename))[0]
#     print "diffing %s <=> %s ..." % (filename, f)
#     db_data = db[f]
#     file_data = load_json(filename)

#     excludes = set()
#     if not args.diff_all_fields:
#         excludes |= set(FIELDS.get(f, {}).keys())
#     diff_map(file_data, db_data, excludes)
#     return


def parse_filelist(files):
    r = set()
    for filename in files or []:
        if os.path.isdir(filename):
            for f in os.listdir(filename):
                r.add(os.path.join(filename, f))
        else:
            r.add(filename)
    return r


# def update(**kwargs):
#     for key, value in kwargs.iteritems():
#         filename, data_key = FIELDS[key]
#         if not filename in db:
#             print "file: %s not exists!" % filename
#             continue
#         data = db[filename]
#         if not data_key in data:
#             print "data key: %s not exists in file: %s!" % (data_key, filename)
#         else:
#             print "%s: %s => %s" % (key, data[data_key], value)
#             data[data_key] = value
#             updated_files.add(filename)
#         continue
#     return


# for filename in parse_filelist(args.diff_storage_file):
#     diff_storage_file(filename)

for filename in parse_filelist(args.replace_storage_file):
    f = os.path.splitext(os.path.basename(filename))[0]
    print "replacing %s into %s ..." % (filename, f)
    db.replace_storage_file(f, filename)


if args.unlock_cash_areas:
    if not args.unlock_area:
        args.unlock_area = []
    args.unlock_area += ["M3", "N3", "O2"]
if args.unlock_area:
    db.Level_Home.unlock_area(*args.unlock_area)


if args.list_keys:
    print "=" * 10 + " list " + "=" * 10
    for key in db.key_fields.keys():
        print "%s: %s" % (key, db.get_value(key))

if args.set_value:
    print "=" * 10 + " set " + "=" * 10
    for k, v in args.set_value:
        old = db.set_value(k, v)
        print "set %s: %s->%s" % (k, old, v)

if args.add_item:
    print "=" * 10 + " add items " + "=" * 10
    db.Level_Home.add_orb_item(items=args.add_item)


if args.save:
    print "saving..."
    db.save()

db.close()
db = None

if args.adb_push:
    os.system("adb push %s %s/md_db.db " % (args.db, ADB_REMOTE_ROOT))
    pass

if args.adb_start or args.adb_restart:
    os.system(
        "adb shell monkey -p %s -c android.intent.category.LAUNCHER 1" % (PACKAGE_NAME))
