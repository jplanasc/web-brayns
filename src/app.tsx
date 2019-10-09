import React from "react"
//import { Client as BraynsClient } from "brayns"

import Script from './web-brayns/script'
import Scene from './web-brayns/scene'
import Model from './web-brayns/scene/model'
import ImageStream from './web-brayns/view/image-stream'
import VideoStream from './web-brayns/view/video-stream'
import Stack from './tfw/layout/stack'
import WebsocketConsole from './web-brayns/view/websocket-console'
import PanelModels from './web-brayns/view/panel/models'
import PanelModel from './web-brayns/view/panel/model/container'
import PanelClip from './web-brayns/view/panel/clip/container'

import { IVector } from './web-brayns/types'

import "./app.css"

import Python from './web-brayns/service/python'
import SnapshotService from './web-brayns/service/snapshot'
import SnapshotDialog from './web-brayns/dialog/snapshot'

interface IAppProps {
    panel: string,
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

    async componentDidMount() {
        try {
            //Script.test();
            Scene.camera.lookAtWholeScene();
        }
        catch( ex ) {
            console.error(ex);
        }
    }

    render() {
        return (<div className="App">
            <div className="panel">
                <Stack value={this.props.panel}>
                    <PanelModels key="models"/>
                    <PanelModel key="model"/>
                    <PanelClip key="clip"/>
                </Stack>
            </div>
            <div className='view'>
                {
                    this.props.stream === 'image' &&
                    <ImageStream
                        key="image-stream"
                        onPan={Scene.gestures.handlePan}
                        onPanStart={Scene.gestures.handlePanStart}/>
                }
                {
                    this.props.stream === 'video' &&
                    <VideoStream
                        key="video-stream"
                        onPan={Scene.gestures.handlePan}
                        onPanStart={Scene.gestures.handlePanStart}/>
                }
                <WebsocketConsole visible={this.props.showConsole}/>
            </div>
        </div>)
    }
}
