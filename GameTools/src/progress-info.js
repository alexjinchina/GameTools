import React from "react";

import propTypes from "prop-types"

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
import { Text, ListItem, Button, Overlay, Icon } from "react-native-elements";

import styles from "./styles";


export default class ProgressInfo extends React.Component {
    constructor(props) {
        super(props)
    }

    // componentDidMount() {

    // }
    // componentWillUnmount() {

    // }
    // componentDidUpdate(prevProps, prevState) {

    // }

    render() {
        return (<View style={styles.container}>
            {!this.props.isError ? <ActivityIndicator size="large" /> : <Icon name="error" />}
            <Text style={styles.infoText}>
                {this.props.progressMessage || ""}
            </Text>
            {this.props.isError && (<Text style={styles.errorText}>
                {this.props.errorMessage || ""}
            </Text>)}

        </View>);
    }
}

// ProgressInfo.propTypes = {
//     isInProgress: propTypes.bool,
// }

// ProgressInfo.defaultProps = {
//     isInProgress: false
// }