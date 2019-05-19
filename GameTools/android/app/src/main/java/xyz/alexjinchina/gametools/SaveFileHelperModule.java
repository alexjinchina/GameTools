// ToastModule.java

package xyz.alexjinchina.gametools;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.support.annotation.NonNull;
import android.util.Base64;

import com.facebook.common.logging.FLog;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.annotation.Nonnull;

public class SaveFileHelperModule extends ReactContextBaseJavaModule {

    static final String TAG = SaveFileHelperModule.class.getSimpleName();

    public SaveFileHelperModule(ReactApplicationContext reactContext) {

        super(reactContext);
        setLoggingLevel("info");
    }

    @Nonnull
    @Override
    public String getName() {
        return "SaveFileHelper";
    }

    @ReactMethod
    public void setLoggingLevel(@NonNull String level) {
        switch (level.toLowerCase()) {
        case "verbose":
            FLog.setMinimumLoggingLevel(FLog.VERBOSE);
            break;
        case "debug":
            FLog.setMinimumLoggingLevel(FLog.DEBUG);
            break;
        case "info":
            FLog.setMinimumLoggingLevel(FLog.INFO);
            break;
        case "warn":
            FLog.setMinimumLoggingLevel(FLog.WARN);
            break;
        case "error":
            FLog.setMinimumLoggingLevel(FLog.ERROR);
            break;
        case "assert":
            FLog.setMinimumLoggingLevel(FLog.ASSERT);
            break;
        default:
            FLog.setMinimumLoggingLevel(FLog.INFO);
            break;
        }
    }

    private void putSQLiteField(Cursor cursor, WritableMap map, String key, int columnIndex) {
        if (key == null) {
            key = cursor.getColumnName(columnIndex);
        }
        switch (cursor.getType(columnIndex)) {
        case Cursor.FIELD_TYPE_NULL:
            map.putNull(key);
            break;
        case Cursor.FIELD_TYPE_INTEGER:
            map.putInt(key, cursor.getInt(columnIndex));
            break;
        case Cursor.FIELD_TYPE_FLOAT:
            map.putDouble(key, cursor.getFloat(columnIndex));
            break;
        case Cursor.FIELD_TYPE_STRING:
            map.putString(key, cursor.getString(columnIndex));
            break;
        case Cursor.FIELD_TYPE_BLOB:
            map.putString(key, Base64.encodeToString(cursor.getBlob(columnIndex), Base64.DEFAULT));
            break;
        default:
            throw (new RuntimeException(String.format("invalid field type %d", cursor.getType(columnIndex))));
        }
    }

    private String getDataColumnName(ReadableMap config) {
        final String COLUMN = "column";
        if (!config.hasKey(COLUMN)) {
            throw new RuntimeException(String.format("%s not found in config", COLUMN));
        }
        if (config.getType(COLUMN) != ReadableType.String) {
            throw new RuntimeException(String.format("`%s` is not String!", COLUMN));

        }
        return config.getString(COLUMN);

    }

    private WritableMap loadSQLiteTable(SQLiteDatabase db, String tableName, ReadableMap config) {
        FLog.d(TAG, "loading SQLite table %s...", tableName);
        final String FIELDS = "fields";
        WritableMap tableData = Arguments.createMap();
        String keyField = (config != null && config.hasKey("key")) ? config.getString("key") : null;
        List<String> dataCols;

        if (config == null || !config.hasKey(FIELDS)) {
            FLog.d(TAG, "get all column names...", tableName);
            Cursor c = db.rawQuery(String.format("SELECT * FROM %s", tableName), null);
            dataCols = new ArrayList<>(Arrays.asList(c.getColumnNames()));
            c.close();
        } else {
            FLog.d(TAG, "config `%s` type is %s", FIELDS, config.getType(FIELDS));
            dataCols = new ArrayList<>();
            String columnName;
            switch (config.getType(FIELDS)) {
            case String:
                columnName = config.getString(FIELDS);
                FLog.d(TAG, "add data column: %s", columnName);
                dataCols.add(columnName);
                break;
            case Map:
                for (ReadableMapKeySetIterator iter = config.getMap(FIELDS).keySetIterator(); iter.hasNextKey();) {
                    columnName = iter.nextKey();
                    FLog.d(TAG, "add data column: %s", columnName);
                    dataCols.add(columnName);
                }

                break;
            // case Array:
            // ReadableArray data = config.getArray("data");
            // for (int i = 0; i < data.size(); ++i) {
            // switch (data.getType(i)) {
            // case String:
            // columnName = data.getString(i);
            // break;
            // case Map:
            // columnName = getDataColumnName(data.getMap(i));
            // break;
            // default:
            // throw new RuntimeException(String.format("invalid data column type: %s",
            // data.getType(i)));
            // }
            // FLog.d(TAG, "add data column: %s", columnName);
            // dataCols.add(columnName);
            // }
            // break;
            default:
                throw (new RuntimeException(
                        String.format("invalid type `%s` of `%s`!", config.getType(FIELDS), FIELDS)));
            }
        }

        if (keyField != null)
            dataCols.add(0, keyField);

        FLog.d(TAG, "query table %s...", tableName);
        Cursor cursor = db.query(tableName, dataCols.toArray(new String[dataCols.size()]), null, null, null, null,
                null);
        if (cursor.moveToFirst()) {
            int dataColumnStartIndex = keyField == null ? 0 : 1;
            do {

                String key = keyField == null ? Integer.toString(cursor.getPosition()) : cursor.getString(0);
                FLog.d(TAG, "putting row %s ...", key);
                if (dataCols.size() == dataColumnStartIndex + 1) {
                    putSQLiteField(cursor, tableData, key, dataColumnStartIndex);
                } else {
                    WritableMap dataMap = Arguments.createMap();
                    for (int i = dataColumnStartIndex; i < dataCols.size(); ++i) {
                        putSQLiteField(cursor, dataMap, null, i);
                    }
                    tableData.putMap(key, dataMap);
                }
            } while (cursor.moveToNext());
        }
        cursor.close();

        return tableData;
    }

    @ReactMethod
    public void loadSQLiteData(String filepath, ReadableMap config, Promise promise) {
        FLog.d(TAG, "loading SQLite data from %s...", filepath);
        SQLiteDatabase db;
        try {
            final String TABLES = "tables";
            WritableMap data = Arguments.createMap();
            FLog.d(TAG, "opening SQLite db...");
            db = SQLiteDatabase.openDatabase(
                    filepath, null, SQLiteDatabase.OPEN_READONLY);

            if (config.hasKey(TABLES)) {
                ReadableMap tables = config.getMap(TABLES);

                for (ReadableMapKeySetIterator iter = tables.keySetIterator(); iter.hasNextKey(); ) {
                    String tableName = iter.nextKey();
                    FLog.d(TAG, "reading table %s...", tableName);

                    ReadableMap tableConfig = tables.getMap(tableName);

                    data.putMap(tableName, loadSQLiteTable(db, tableName, tableConfig));
                }
            } else {

            }
            promise.resolve(data);
        } catch (Exception ex) {
            ex.printStackTrace();
            promise.reject(ex.getClass().getSimpleName(), ex.getMessage());
        } finally{
            if(db!=null){
                db.close();
            }
        }
    }

}