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

import { ListItem, Text, Button } from "react-native-elements";
// import NumericInput from 'react-native-numeric-input'
// import Spinner from 'react-native-number-spinner';
import Spinner from "./spinner";
import { TabView, SceneMap } from "react-native-tab-view";
import { fs, path, lodash } from "./utils";
import DB from "./db";

YellowBox.ignoreWarnings(["componentWillMount is deprecated"]);

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      isError: false,
      errorMessage: null,
      isLoading: true,
      loadingInfo: null,
      db: null,
      index: 0,
      routes: [
        { key: "data", title: "Data" },
        { key: "area", title: "Area" },
        { key: "items", title: "Items" }
      ],
      updatedValues: {}
    };
  }
  componentDidMount() {
    this.openDatabase();
  }
  async openDatabase() {
    try {
      this.setState({
        isLoading: true,
        isError: false
      });
      const db = new DB({
        messageCallback: msg => {
          this.setState({ loadingInfo: msg });
        },
        errorCallback: error => {
          // debugger
          this.setState({
            isError: true,
            errorMessage: error.message || error
          });
        }
      });
      await db.open();
      this.setState({ isLoading: false, db });
    } catch (error) {
      // debugger
      this.handleError(error);
    }
  }
  handleSQLError = (tx, error) => {
    this.handleError(error);
  };

  handleError = error => {
    this.setState({
      isError: true,
      errorMessage: error.message || error
    });
  };
  _renderError() {
    return (
      <View>
        <Text style={[styles.welcome, { color: "#FF0000" }]}>ERROR</Text>
        <Text style={styles.instructions}>{this.state.loadingInfo || ""}</Text>
        <Text style={[styles.instructions, { color: "#FF0000" }]}>
          {this.state.errorMessage || ""}
        </Text>
      </View>
    );
  }
  _renderLoading() {
    return (
      <View>
        <ActivityIndicator />
        <Text style={styles.instructions}>{this.state.loadingInfo || ""}</Text>
      </View>
    );
  }
  _renderMainView() {
    return (
      <View style={[{ flex: 1 }]}>
        <TabView
          navigationState={this.state}
          renderScene={SceneMap({
            data: this._renderDataView,
            area: () => <View style={[styles.tabSceneView]} />,
            items: () => <View style={[styles.tabSceneView]} />
          })}
          onIndexChange={index => this.setState({ index })}
          initialLayout={{ width: Dimensions.get("window").width }}
        />
        <Button
          title="Apply"
          disabled={
            this.state.index === 0
              ? lodash.isEmpty(this.state.updatedValues)
              : false
          }
        />
      </View>
    );
  }
  _renderDataView = () => {
    return (
      <ScrollView style={styles.tabSceneView}>
        {this.state.db
          .getKeys()
          .sort()
          .map((key, index) => {
            const app = this;
            const { type, displayText = key } = this.state.db.getKeyInfo(key);
            const oldValue = this.state.db.getValue(key);
            const updatedValue = this.state.updatedValues[key];
            const updated = !lodash.isUndefined(updatedValue);
            if (updatedValue) {
              debugger;
            }
            console.log(key, oldValue, updatedValue);
            // console.log(oldValue,updatedValue,updated)
            return (
              <ListItem
                key={`item-${key}`}
                title={displayText}
                rightElement={
                  // <Spinner
                  //   onNumChange={value => {}}
                  //   value={oldValue}
                  //   min={0}
                  //   width={240}
                  //   // btnWidth={20}
                  // />
                  <TextInput
                    style={{}}
                    keyboardType="numeric"
                    value={(updated ? updatedValue : oldValue).toString()}
                    onChangeText={text => {
                      console.debug(key, oldValue, updatedValue, text);
                      const updatedValues = lodash.clone(
                        this.state.updatedValues
                      );
                      updatedValues[key] = parseInt(text);
                      this.setState({ updatedValues });
                    }}
                  />
                }
              />
            );
          })}
      </ScrollView>
    );
  };
  render() {
    if (this.state.db) return this._renderMainView();
    return (
      <View style={styles.container}>
        {this.state.isError
          ? this._renderError()
          : this.state.isLoading
          ? this._renderLoading()
          : null}
        {/* <Text style={styles.instructions}>{this.state.dBFilePath}</Text>
        <Text style={styles.instructions}>{this.state.dbMTime && this.state.dbMTime.toISOString()}</Text> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  },
  itemText: {
    // fontSize: 20,
    // textAlign: 'center',
    // color: '#333333',
    // marginBottom: 5,
  },
  tabSceneView: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  }
});
