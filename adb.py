import subprocess


def _run(args=[]):
    cmd = ["adb"]
    cmd += args
    return [x.strip() for x in subprocess.check_output(cmd).split("\n") if x and x.strip()]


def devices():
    devices = [x.split()[0] for x in _run(["devices"])[1:]]
    return devices


if __name__ == "__main__":
    print devices()
