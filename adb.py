import subprocess


def _run(*args,**kwargs):
    cmd = ["adb"]
    if 'device' in kwargs:
        cmd += ['-s',kwargs['device']]

    cmd += args
    print cmd
    return [x.strip() for x in subprocess.check_output(cmd).split("\n") if x and x.strip()]


def devices():
    devices = [x.split()[0] for x in _run("devices")[1:]]
    return devices


def stop(package_name,device=None):
    print "stoping %s ..." % package_name
    _run("shell","am","force-stop",package_name,device=device)


if __name__ == "__main__":
    print devices()
