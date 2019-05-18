// ToastModule.java

package xyz.alexjinchina.gametools;

import android.util.Base64;
import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.io.OutputStream;
import java.util.Map;
import java.util.HashMap;

import javax.annotation.Nonnull;

public class SaveFileHelperModule extends ReactContextBaseJavaModule {

    // private static final String DURATION_SHORT_KEY = "SHORT";
    // private static final String DURATION_LONG_KEY = "LONG";

    public SaveFileHelperModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return "SaveFileHelper";
    }


//    @ReactMethod
//    public void writeFile(String filepath, String base64Content, ReadableMap options, Promise promise) {
//        try {
//            byte[] bytes = Base64.decode(base64Content, Base64.DEFAULT);
//
//            OutputStream outputStream = getOutputStream(filepath, false);
//            outputStream.write(bytes);
//            outputStream.close();
//
//            promise.resolve(null);
//        } catch (Exception ex) {
//            ex.printStackTrace();
//            reject(promise, filepath, ex);
//      promise.reject(ioRejectionException.getCode(), ioRejectionException.getMessage());
//        }
//    }

}