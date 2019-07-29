import { connect } from 'react-redux'
import { IAppState } from "../../types"
import State from "../../state"
import { default as snapshotView, RESOLUTIONS, SAMPLINGS } from "./snapshot"

export { RESOLUTIONS, SAMPLINGS } from './snapshot'

function mapStateToProps(state: IAppState) {
    return {
        filename: state.dialogs.snapshot.filename,
        sizeKey: state.dialogs.snapshot.sizeKey,
        width: state.dialogs.snapshot.width,
        height: state.dialogs.snapshot.height,
        samplesKey: state.dialogs.snapshot.samplesKey,
        samples: state.dialogs.snapshot.samples
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onFilenameChange(filename: string) {
            dispatch(State.Dialogs.updateSnapshot({ filename }))
        },

        onSizeKeyChange(sizeKey: string) {
            dispatch(State.Dialogs.updateSnapshot({ sizeKey }))
            const res = RESOLUTIONS[sizeKey];
            if (!res) return;
            const [width, height] = res;
            dispatch(State.Dialogs.updateSnapshot({ width, height }))
        },

        onWidthChange(width: number) {
            dispatch(State.Dialogs.updateSnapshot({ width }))
        },

        onheightChange(height: number) {
            dispatch(State.Dialogs.updateSnapshot({ height }))
        },

        onSamplesKeyChange(samplesKey: string) {
            dispatch(State.Dialogs.updateSnapshot({ samplesKey }))
            const samples = SAMPLINGS[samplesKey];
            if (!samples) return;
            dispatch(State.Dialogs.updateSnapshot({ samples }))
        },

        onSamplesChange(samples: number) {
            dispatch(State.Dialogs.updateSnapshot({ samples }))
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(snapshotView);
