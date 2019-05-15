import React from "react";



export default class OverlayInfo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isError: false,
            errorMessage: null,

            isInProgress: true,
            progressMessage: null

        }
    }

    render() {

    }
}

OverlayInfo.propTypes = {

}

OverlayInfo.defaultProps = {

}