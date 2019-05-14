/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
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

const FIELDS = require("./config/merge_dragons/fields");


export default class App extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View>
                <TextInput defaultValue="123" />
            </View>
        )
    }




}
