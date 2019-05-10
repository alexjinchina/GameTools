import React from "react";
import PropTypes from "prop-types";

import {
    Platform,
    PermissionsAndroid,
    YellowBox,
    StyleSheet,
    Dimensions,
    View,
    ScrollView,
    TextInput,
    ActivityIndicator
} from "react-native";

import { ListItem, Text, Button } from "react-native-elements";
import { TabView, SceneMap } from "react-native-tab-view";
import { lodash, castValueType } from "./utils";

import styles from "./styles";

export default class MainView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            index: 0,
            routes: [
                { key: "data", title: "Data" },
                { key: "area", title: "Area" },
                { key: "items", title: "Items" }
            ],
            values: {},
            valuesUpdated: false
        };
    }
    componentDidMount() {
        console.debug(`${this}.componentDidMount`)
        if (this.props.db) this._buildData(this.props.db)
    }

    componentDidUpdate(prevProps) {
        console.debug(`${this}.componentDidUpdate`)
        if (this.props.db && this.props.db !== prevProps.db) this._buildData(this.props.db)
    }

    render() {
        if (!this.props.db)
            return (
                <View style={[{ flex: 1 }]}>
                    <Text>ERROR:NO DATABASE!!!</Text>
                </View>
            )
        return (
            <View style={[{ flex: 1 }]}>
                <TabView
                    navigationState={this.state}
                    renderScene={SceneMap({
                        data: () => this._renderDataView(),
                        area: () => this._renderAreaView(),
                        items: () => this._renderItemsView()
                    })}
                    onIndexChange={index => this.setState({ index })}
                    initialLayout={{ width: Dimensions.get("window").width }}
                />
                <Button
                    title="Apply"
                    disabled={this.state.index === 0 ? !this.state.valuesUpdated : true}
                    onPress={() => this._applyChanges()}
                />
            </View>
        );

    }

    _renderDataView() {
        console.log("_renderDataView");
        return (
            <ScrollView style={styles.tabSceneView}>
                {lodash.keys(this.state.values)
                    .sort()
                    .map(key => {
                        const { info, value, oldValue } = this.state.values[key];
                        const { displayText = key } = info;
                        const updated = value !== oldValue;
                        // console.log(key, value, oldValue, updated);
                        return (
                            <ListItem
                                key={`item-${key}`}
                                title={`${displayText}`}
                                rightElement={
                                    <TextInput
                                        style={[
                                            updated
                                                ? styles.updatedValueItemText
                                                : styles.valueItemText,
                                            {}
                                        ]}
                                        keyboardType="numeric"
                                        defaultValue={value.toString()}
                                        // onChangeText={text => {
                                        onEndEditing={({ nativeEvent }) => {
                                            this._setValueItem(key, nativeEvent.text);
                                        }}
                                    />
                                }
                            />
                        );
                    })}
            </ScrollView>
        );
    }

    _renderAreaView() {
        console.log("_renderAreaView");
        return (
            <View style={[styles.tabSceneView]}>
                <Text>AREA</Text>
            </View>
        );
    }
    _renderItemsView() {
        console.log("_renderItemsView");
        return (
            <View style={[styles.tabSceneView]}>
                <Text>ITEM</Text>
            </View>
        );
    }

    _setValueItem(key, value) {
        const valueItem = this.state.values[key];
        valueItem.value = castValueType(valueItem.info.type, value);
        const maxValueItem = this.state.values[`${key}_max`];
        if (maxValueItem && maxValueItem.value < valueItem.value)
            maxValueItem.value = valueItem.value;
        this._checkUpdated();
    }

    _buildData(db) {
        const values = {};
        db.getKeys().map(key => {
            const info = db.getKeyInfo(key);
            const oldValue = db.getValue(key);
            values[key] = { info, oldValue, value: oldValue };
        });
        this.setState({ values, valuesUpdated: false });
    }


    _checkUpdated() {
        let valuesUpdated = false;

        const values = lodash.clone(this.state.values);
        lodash.map(values, valueItem => {
            if (valueItem.oldValue === valueItem.value) {
                valuesUpdated = true;
            }
        });
        this.setState({ values, valuesUpdated });
    }

    _applyChanges() {
        console.log(`_applyChanges`);
        const { db } = this.props;
        lodash.map(this.state.values, (valueItem, key) => {
            if (valueItem.value !== valueItem.oldValue) {
                console.log(`set value: ${key}=${valueItem.value}`);
                db.setValue(key, valueItem.value);
                valueItem.oldValue = valueItem.value
            }
        });

        if (this.props.onApplyChanges) this.props.onApplyChanges()


    }

}

MainView.propTypes = {
    db: PropTypes.object,
    onApplyChanges: PropTypes.func
};

MainView.defaultProps = {
};
