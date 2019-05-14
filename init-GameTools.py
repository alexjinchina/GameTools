import os
import sys

if sys.platform in ["win32"]:
    def os_link(src, dst):
        os.system('MKLINK /H "%s" "%s"' % (dst, src))
else:
    os_link = os.link


def link(src, dst):
    print 'linking %s => %s ...' % (src, dst)
    if os.path.isdir(src):
        if not os.path.isdir(dst):
            print "making dir %s ..." % dst
            os.makedirs(dst)
        for f in os.listdir(src):
            link(os.path.join(src, f), os.path.join(dst, f))
    else:
        if os.path.exists(dst):
            if os.stat(dst).st_mtime == os.stat(src).st_mtime:
                print "dest file %s already exists, but same mtime." % dst
                return
            raise RuntimeError("dest file %s already exists" % dst)
        os_link(src, dst)
    pass


link("config", os.path.join("GameTools", "src", "config"))
