import React from "react"
//import { Client as BraynsClient } from "brayns"

import SnapshotService from './web-brayns/service/snapshot'
import SnapshotDialog from './web-brayns/dialog/snapshot'
import Snapshot from './web-brayns/dialog/snapshot'
import Scene from './web-brayns/scene'
import State from './web-brayns/state'
import ImageStream from './web-brayns/view/image-stream'
import VideoStream from './web-brayns/view/video-stream'
import Button from './tfw/view/button'
import Dialog from './tfw/factory/dialog'
import Panel from './web-brayns/view/panel'
import { IModel } from './web-brayns/types'
import UrlArgs from './tfw/url-args'

import "./app.css"

interface IAppProps {
    panel: string,
    model: IModel,
    stream: "image" | "video",
    showConsole: boolean
}

interface IAppState {
    data: Blob,
    panelVisible: boolean
}

export default class App extends React.Component<IAppProps, IAppState> {
    constructor( props: IAppProps ) {
        super( props );
        this.state = { data: new Blob(), panelVisible: true }
    }

    /**
     * Parse querystring params.
     */
    componentWillMount() {
        const args = UrlArgs.parse()
        const load = args.load
        if (typeof load === 'string') this.execLoad(load)
    }

    /**
     * Querystring "load=path" trigger the load of a model.
     */
    private async execLoad(path: string) {
        const model = await Scene.loadMeshFromPath(path);
        if (!model) return
        model.focus()        
    }

    private handleScreenShot = async () => {
        const options = await Snapshot.show();
        if (!options) return;  // Action cancelled.
        const canvas = await Dialog.wait("Snapshoting in progress...", SnapshotService.getCanvas(options))
        console.info("canvas=", canvas);
        await Dialog.wait("Saving in progress...", SnapshotService.saveCanvasToFile(canvas, `${options.filename}.jpg`))
    }

    private handlePanelChange = (panel: string) => {
        State.store.dispatch(State.Navigation.setPanel(panel))
    }

    private handlePanelVisibleChange = (panelVisible: boolean) => {
        this.setState({ panelVisible })
    }

    render() {
        const className = this.state.panelVisible ? "App visible" : "App"

        return (<div className={className}>
            <Panel value={this.props.panel}
                   model={this.props.model}
                   visible={this.state.panelVisible}
                   onVisibleChange={this.handlePanelVisibleChange}
                   onChange={this.handlePanelChange}/>
            <div className='view'>
                {
                    this.props.stream === 'image' &&
                    <ImageStream
                        key="image-stream"
                        onPan={Scene.gestures.handlePan}
                        onPanStart={Scene.gestures.handlePanStart}
                        onWheel={Scene.gestures.handleWheel}/>
                }
                {
                    this.props.stream === 'video' &&
                    <VideoStream
                        key="video-stream"
                        onPan={Scene.gestures.handlePan}
                        onPanStart={Scene.gestures.handlePanStart}
                        onWheel={Scene.gestures.handleWheel}/>
                }
                <div className="icons">
                    <Button
                        icon="camera"
                        onClick={this.handleScreenShot}
                        warning={true}/>
                </div>
            </div>
        </div>)
    }
}
