import React from "react"
import { Client as BraynsClient } from "brayns"

import Scene from './web-brayns/scene'
import Model from './web-brayns/scene/model'
import ImageStream from './web-brayns/view/image-stream'
import Stack from './tfw/layout/stack'
import WebsocketConsole from './web-brayns/view/websocket-console'
import PanelModel from './web-brayns/view/panel/model'
import PanelClip from './web-brayns/view/panel/clip'

import { IVector } from './web-brayns/types'

import "./app.css"


interface IAppProps {
    panel: string,
    showConsole: boolean
}

export default class App extends React.Component<IAppProps, {}> {
    constructor( props: IAppProps ) {
        super( props );
    }

    async componentDidMount() {
        try {
            /*
            //Scene.clear();
            let modelNumber = 1;
            const factor = 200;
            const models: Model[] = [];
            const positions: IVector[] = [];

            for (let x=-1; x<=1; x++) {
                for (let y=-1; y<=1; y++) {
                    for (let z=-1; z<=1; z++) {
                        const astro = await loadAstrocyte(modelNumber++);
                        models.push(astro);
                        positions.push([
                            factor * x,
                            factor * y,
                            factor * z
                        ])
                    }
                }
            }

            models.forEach( async (model: Model, index: number) => {
                await model.locate(positions[index]);
            })*/

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
                    <PanelModel key="model"/>
                    <PanelClip key="clip"/>
                </Stack>
            </div>
            <div className='view'>
                <ImageStream
                    onPan={Scene.gestures.handlePan}
                    onPanStart={Scene.gestures.handlePanStart}/>
                <WebsocketConsole visible={this.props.showConsole}/>
            </div>
        </div>)
    }
}


async function loadAstrocyte(id: number): Promise<Model> {
    const path = `/gpfs/bbp.cscs.ch/project/proj3/resources/meshes/astrocytes/GLIA_${pad(id)}.h5_decimated.off`;
    return await Scene.loadMeshFromPath(path);
}


function pad(value: number): string {
    let out = `${value}`;
    while (out.length < 6 ) {
        out = `0${out}`;
    }
    return out;
}
