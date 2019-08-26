import { connect } from 'react-redux'

import { IAppState, IAction } from "../../types"
import ModelList from './model-list'


function mapStateToProps(state: IAppState) {
    console.info("state=", state);
    return {
        models: state.models
    };
}

function mapDispatchToProps(dispatch: (action: IAction) => void) {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModelList);
