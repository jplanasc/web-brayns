import React from "react"
//import { Client as BraynsClient } from "brayns"

import SnapshotService from './web-brayns/service/snapshot'
import Snapshot from './web-brayns/dialog/snapshot'
import Scene from './web-brayns/scene'
import State from './web-brayns/state'
import SelectedModelInfo from './web-brayns/view/selected-model-info'
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
    braynsServiceVersion: string,
    panelVisible: boolean
}

export default class App extends React.Component<IAppProps, IAppState> {
    constructor( props: IAppProps ) {
        super( props );
        this.state = { data: new Blob(), panelVisible: true, braynsServiceVersion: "" }
    }

    async componentDidMount() {
        const version = await Scene.brayns.exec("get-version")
        console.info("version=", version);
        if (version) {
            this.setState({
                braynsServiceVersion: `${version.major}.${version.minor}.${version.patch} (${
                    version.revision
                })`
            })
        }

        const args = UrlArgs.parse()
        const load = args.load
        if (typeof load === 'string') this.execLoad(load)

        if (typeof args.allocator === 'string') {
            // BraynsService has been started from this web interface.
            // We need to kill it as soon as this page is not used anymore.
            // For this, we will use the 'exit-later' function.
            const exitLater = async () => {
                console.log("exit-later", { minutes: 6 })
                await Scene.brayns.exec("exit-later", { minutes: 6 })
                window.setTimeout(() => {
                    exitLater()
                }, 5 * 60 * 1000)
            }
            exitLater()
        }
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
        const options = await Snapshot.show({});
        if (!options) return;  // Action cancelled.
        const canvas = await SnapshotService.snapshot(options) as HTMLCanvasElement
        if (!canvas) return
        await Dialog.wait("Saving in progress...", SnapshotService.saveCanvasToFile(
            canvas, `${options.filename}.png`))

        /*const canvas = await Dialog.wait(
            "Snapshoting in progress...",
            SnapshotService.getCanvas(options)
        )*/
    }

    private handlePanelChange = (panel: string) => {
        State.store.dispatch(State.Navigation.setPanel(panel))
    }

    private handlePanelVisibleChange = (panelVisible: boolean) => {
        this.setState({ panelVisible })
    }

    render() {
        const className = this.state.panelVisible ? "App visible" : "App"
        const { model } = this.props
        
        return (<div className={className}>
            <Panel value={this.props.panel}
                   model={this.props.model}
                   braynsServiceVersion={this.state.braynsServiceVersion}
                   visible={this.state.panelVisible}
                   onVisibleChange={this.handlePanelVisibleChange}
                   onChange={this.handlePanelChange}/>
            <div className='view'>
                <div className='body'>
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
                    <SelectedModelInfo model={model}/>
                </div>
                <div className="icons">
                    <Button
                        icon="camera"
                        small={true}
                        onClick={this.handleScreenShot}
                        warning={true}/>
                </div>
            </div>
        </div>)
    }
}
