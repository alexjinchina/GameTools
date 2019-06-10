package xyz.alexjinchina.gametools;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.DataOutputStream;
import java.io.IOException;

import javax.annotation.Nonnull;

public class GameHelperModule extends ReactContextBaseJavaModule {

    static final String TAG = GameHelperModule.class.getSimpleName();

    public GameHelperModule(ReactApplicationContext reactContext) {

        super(reactContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return "GameHelper";
    }

    @ReactMethod
    public void stopApp(String packageId, Promise promise) {

    }

    @ReactMethod
    public void rootExec(String cmd, Promise promise) {
        try {
            ExecResult r = execRootCmd(cmd);
            WritableMap result = Arguments.createMap();
            result.putInt("exitValue", r.exitValue);
            result.putString("stdout", r.stdout.toString());
            result.putString("stderr", r.stderr.toString());
            promise.resolve(result);
        } catch (Exception ex) {
            ex.printStackTrace();
            promise.reject(ex.getClass().getSimpleName(), ex.getMessage());

        }
    }

    static public class ExecResult {
        public ExecResult() {
        }
        public int exitValue = -1;
        public StringBuffer stdout = new StringBuffer();
        public StringBuffer stderr = new StringBuffer();
    }

    public static ExecResult execRootCmd(String cmd) throws IOException, InterruptedException {
        ExecResult result = new ExecResult();

        Process p = Runtime.getRuntime().exec("su");
        DataOutputStream stdin = new DataOutputStream(p.getOutputStream());
        stdin.writeChars(cmd);
        stdin.writeChars("\n");
        stdin.flush();
        stdin.writeChars("exit\n");
        p.waitFor();
        result.exitValue = p.exitValue();
        byte[] buffer = new byte[4096];
        int readBytes;
        while ((readBytes = p.getInputStream().read(buffer)) != -1) {
            result.stdout.append(new String(buffer, 0, readBytes));
        }
        while ((readBytes = p.getErrorStream().read(buffer)) != -1) {
            result.stderr.append(new String(buffer, 0, readBytes));
        }
        return result;
    }

}