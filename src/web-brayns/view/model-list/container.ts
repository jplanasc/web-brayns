import { connect } from 'react-redux'

import { IAppState, IAction } from "../../types"
import State from '../../state'
import { IModel } from '../../types'
import ModelList from './model-list'


function mapStateToProps(state: IAppState) {
    return {
        models: state.models,
        currentModel: state.currentModel
    };
}

function mapDispatchToProps(dispatch: (action: IAction) => void) {
    return {
        onToggleSelection(model: IModel) {
            dispatch(State.CurrentModel.reset({ ...model }))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModelList);
