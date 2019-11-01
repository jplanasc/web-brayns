import React from "react"
import { connect } from 'react-redux'
import { IAppState } from "../../types"

import Wait from './wait'

function mapStateToProps(state: IAppState) {
    return {
        label: state.wait.label,
        progress: state.wait.progress
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        // onClick: ...
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Wait);
