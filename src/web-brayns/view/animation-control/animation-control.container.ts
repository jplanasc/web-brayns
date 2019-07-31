import { connect } from 'react-redux'
import { IAppState } from "../../types"
import View from "./animation-control"

function mapStateToProps(state: IAppState) {
    return { ...state.animation };
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(View);
