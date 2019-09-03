import { connect } from 'react-redux'
import { IAppState } from "../../../types"
import ModelView from './model'

function mapStateToProps(state: IAppState) {
    return { model: state.currentModel }
}

function mapDispatchToProps(dispatch) {
    return {
        // onClick: ...
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ModelView);
