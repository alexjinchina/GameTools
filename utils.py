import os
import json


def object_hook(object):
    return object  # dict(object)


def object_pairs_hook(pairs):
    try:
        return dict([(int(k), v) for k, v in pairs])
    except:
        return dict(pairs)


def load_json(data):
    if isinstance(data, str) or isinstance(data, unicode):
        if os.path.isfile(data):
            with open(data, "rb") as fd:
                data = fd.read()
                fd.close()
    elif callable(data.read):
        data = data.read()
    else:
        raise RuntimeError("invalid data format: %s" % type(data))
    return json.loads(data, object_pairs_hook=object_pairs_hook)


def save_json(data, filename):
    with open(filename, "wb") as fd:
        json.dump(data, fd, indent=2, sort_keys=True)
        fd.close()
        pass
