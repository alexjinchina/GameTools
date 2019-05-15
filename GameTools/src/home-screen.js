/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from "react";
import { View, Text } from "react-native";

import { } from "react-native-elements";
import { } from "./utils";

import styles from "./styles"

export default class HomeScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
    }

    render() {
        return (<View style={styles.screen}>
            <Text>Home Screen: {this}</Text>
        </View>
        )
    }
}
