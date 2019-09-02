import React from "react"
import { Client as BraynsClient } from "brayns"

import Script from './web-brayns/script'
import Scene from './web-brayns/scene'
import Model from './web-brayns/scene/model'
import ImageStream from './web-brayns/view/image-stream'
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
    showConsole: boolean
}

export default class App extends React.Component<IAppProps, {}> {
    constructor( props: IAppProps ) {
        super( props );
    }

    async componentDidMount() {
        try {
            Script.test();
            /*
            const materialTemplate = {
                opacity: 1,
                glossiness: 1,
                diffuseColor: [1,0,0],
                shadingMode: 'cartoon'
            }

            const materials = [
                //{ ...materialTemplate, shadingMode: "diffuse", glossiness: 0 },
                //{ ...materialTemplate, shadingMode: "diffuse", glossiness: 0.7 },
                //{ ...materialTemplate, shadingMode: "diffuse" },
                //{ ...materialTemplate, shadingMode: "electron" },
                { ...materialTemplate, shadingMode: "cartoon" }
            ]
            for( const material of materials ) {
                const output = await Scene.setMaterial(model.params.id, 0, material);
                continue;
                const options = await SnapshotDialog.show();
                if (!options) return;  // Action cancelled.
                const canvas = await SnapshotService.getCanvas(options);
                await SnapshotService.saveCanvasToFile(canvas, `${options.filename}.jpg`);
            }
*/

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

            //Scene.camera.lookAtWholeScene();
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
