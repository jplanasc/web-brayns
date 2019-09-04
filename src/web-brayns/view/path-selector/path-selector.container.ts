import { connect } from 'react-redux'

import { IAppState } from "../../types"

import PathService from "../../service/path"
import View from "./path-selector"

function mapStateToProps(state: IAppState) {
    return { ...state.path };
}

function mapDispatchToProps(dispatch) {
    return {
        async onFolderClick(path: string) {
            await PathService.browse(path);
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(View);
