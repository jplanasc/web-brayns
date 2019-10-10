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
import Panel from './web-brayns/view/panel'
import { IModel } from './web-brayns/types'

import "./app.css"

interface IAppProps {
    panel: string,
    model: IModel,
    stream: "image" | "video",
    showConsole: boolean
}

interface IAppState {
    data: Blob
}

export default class App extends React.Component<IAppProps, {}> {
    constructor( props: IAppProps ) {
        super( props );
        this.state = { blob: new Blob() }
    }

    private handleScreenShot = async () => {
        const options = await Snapshot.show();
        if (!options) return;  // Action cancelled.
        const canvas = await SnapshotService.getCanvas(options);
        await SnapshotService.saveCanvasToFile(canvas, `${options.filename}.jpg`);
    }

    private handlePanelChange = (panel: string) => {
        State.store.dispatch(State.Navigation.setPanel(panel))
    }

    render() {
        return (<div className="App">
            <Panel value={this.props.panel}
                   model={this.props.model}
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
