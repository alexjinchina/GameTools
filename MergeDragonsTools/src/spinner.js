import React, { Component, } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { lodash } from './utils';
const styles = StyleSheet.create({
    container: {
        borderWidth: 0.5,
        borderRadius: 4,
        flexDirection: 'row',
        overflow: 'hidden',
        width: 200
    },

    btn: {
        flex: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },

    btnText: {
        color: 'white',
        textAlign: 'center'
    },

    num: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    numText: {
        textAlign: 'center'
    }
})



export default class Spinner extends Component {
    static propTypes = {
        min: PropTypes.number,
        max: PropTypes.number,
        step: PropTypes.oneOf([PropTypes.number, PropTypes.func])
    };

    static defaultProps = {
        min: 0,
        max: 99,
        default: 0,
        color: '#33c9d6',
        numColor: '#333',
        numBgColor: 'white',
        showBorder: true,
        fontSize: 14,
        btnFontSize: 14,
        buttonTextColor: 'white',
        disabled: false,
        height: 30

    };

    constructor(props) {
        super(props)
        this.state = {
            num: lodash.isNumber(props.value) ? props.value : props.default
        };

    }


    _onNumChange(num) {
        if (this.props.onNumChange) this.props.onNumChange(num);
    }

    _increase() {
        // console.log(this.state);
        if (this.props.disabled) return;

        if (this.props.max > this.state.num) {
            var num = this.state.num + 1;
            if (typeof this.state.value === 'undefined') {
                this.setState({ num });
            }

            this._onNumChange(num);
        }
    }

    _decrease() {
        if (this.props.disabled) return;

        if (this.props.min < this.state.num) {
            var num = this.state.num - 1;
            if (typeof this.state.value === 'undefined') {
                this.setState({ num });
            }

            this._onNumChange(num);
        }
    }

    render() {
        return (
            <View style={[
                styles.container,
                {
                    borderColor: this.props.showBorder ? this.props.color : 'transparent',
                    width: this.props.width
                }]}>
                <TouchableOpacity
                    style={[
                        styles.btn,
                        {
                            backgroundColor: this.props.color,
                            borderColor: this.props.showBorder ? this.props.color : 'transparent',
                            height: this.props.height,
                            width: this.props.btnWidth || this.props.height,
                        }

                    ]}
                    onPress={() => this._decrease()}>
                    <Text style={[
                        styles.btnText,
                        {
                            color: this.props.buttonTextColor,
                            fontSize: this.props.btnFontSize
                        }
                    ]}>-</Text>
                </TouchableOpacity>
                <View style={[styles.num,
                {
                    borderColor: this.props.showBorder ? this.props.color : 'transparent',
                    backgroundColor: this.props.numBgColor,
                    height: this.props.height,
                    width: 100
                }]}>
                    <Text style={[
                        styles.numText,
                        {
                            color: this.props.numColor,
                            fontSize: this.props.fontSize,
                            width: this.props.width - 2 * 20
                        }
                    ]}>{this.state.num}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.btn,
                    {
                        backgroundColor: this.props.color,
                        borderColor: this.props.showBorder ? this.props.color : 'transparent',
                        height: this.props.height,
                        width: this.props.btnWidth || this.props.height,

                    }]}
                    onPress={() => this._increase()}>
                    <Text style={[styles.btnText,
                    {
                        color: this.props.buttonTextColor,
                        fontSize: this.props.btnFontSize
                    }]}>+</Text>
                </TouchableOpacity>
            </View>
        )
    }
}


