import { connect } from 'react-redux'

import { IAppState } from "../../../types"
import MovieView from "./movie"


function mapStateToProps(state: IAppState) {
    return { keyFrame: state.keyFrames }
}

function mapDispatchToProps(dispatch) {
    return {
        // onClick: ...
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MovieView);
