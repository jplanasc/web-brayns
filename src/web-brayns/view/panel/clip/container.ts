import { connect } from 'react-redux'
import { IAppState } from "../../../types"
import ClipView from "./clip"

function mapStateToProps(state: IAppState) {
    return {
        activated: state.slicer.activated,
        minX: state.slicer.minX,
        maxX: state.slicer.maxX,
        minY: state.slicer.minY,
        maxY: state.slicer.maxY,
        minZ: state.slicer.minZ,
        maxZ: state.slicer.maxZ
    };
}

function mapDispatchToProps(dispatch) {
    return {
        // onClick: ...
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClipView);
