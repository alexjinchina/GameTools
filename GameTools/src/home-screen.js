
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
        return (<View style={{
            ...styles.screen,
            backgroundColor: "green"
        }} >
            <Text>Home Screen</Text>
        </ View>
        )
    }


}
