import { connect } from 'react-redux'
import { IAppState, ICameraState } from "../../../types"
import Scene from '../../../scene'
import State from '../../../state'
import View from "./world"
import Lights from '../../../proxy/lights'

function mapStateToProps(state: IAppState) {
    const stats = state.statistics
    return {
        fps: stats.fps,
        sceneSizeInBytes: stats.sceneSizeInBytes,
        camera: state.camera
    }
}

function mapDispatchToProps(dispatch) {
    return {
        async onCameraChange(cameraState: Partial<ICameraState>) {
            console.info("[set] cameraState=", cameraState);
            await Scene.Api.setCamera({
                current: cameraState.current
            })
            await Scene.Api.setCameraParams({
                height: cameraState.height
            })
            console.log("setCamera: Done!")
        },

        async onRefreshCamera() {
            const camera = await Scene.Api.getCamera()
            dispatch(State.Camera.update({ current: camera.current }))
            const cameraParams = await Scene.Api.getCameraParams()
            console.info("[get] cameraParams=", cameraParams);
            dispatch(State.Camera.update({
                height: cameraParams.height
            }))
        },

        async onApplyLightings(intensity: number) {
            Lights.instance.clear()
            Lights.instance.setKeyLight(intensity, true)
            Lights.instance.setFillLight(intensity, true)
            Lights.instance.setBackLight(intensity, true)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(View)
