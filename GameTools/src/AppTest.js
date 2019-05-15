/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
    View,
    Text,
    TextInput,
} from "react-native";

const FIELDS = require("../config/merge_dragons/fields");


export default class App extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View>
                <Text>AppTest</Text>
                {/* <TextInput defaultValue="AppTest" /> */}
            </View>
        )
    }




}
