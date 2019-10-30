import { connect } from 'react-redux'
import { IAppState } from "../../../types"
import View from "./world"

function mapStateToProps(state: IAppState) {
    const stats = state.statistics
    return {
        fps: stats.fps,
        sceneSizeInBytes: stats.sceneSizeInBytes
    }
}

function mapDispatchToProps(dispatch) {
    return {
        // onClick: ...
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(View)
