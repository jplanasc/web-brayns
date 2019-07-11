import React from "react"
import { Client as BraynsClient } from "brayns"

import Scene from './web-brayns/scene'
import Model from './web-brayns/scene/model'
import ImageStream from './web-brayns/view/image-stream'
import Icon from './tfw/view/icon'
import Dialog from './tfw/factory/dialog'
import InputPath from './web-brayns/view/input-path'
import WebsocketConsole from './web-brayns/view/websocket-console'

import ModelList from './web-brayns/view/model-list/container'

import "./app.css"


interface IAppProps {
    brayns: BraynsClient
}

export default class App extends React.Component<IAppProps, {}> {
    constructor( props: IAppProps ) {
        super( props );
    }

    async componentDidMount() {
        try {
            //Scene.clear();
            const astro1 = await loadAstrocyte(1);
            astro1.locate([-30, 0, 0]);
            const astro2 = await loadAstrocyte(2);
            astro2.locate([30, 0, 0]);
        }
        catch( ex ) {
            console.error(ex);
        }
    }

    handleLoadMesh = async () => {
        let path = '';
        const confirmed = await Dialog.confirm(
            "Load Mesh",
            <InputPath onChange={(p: string) => path = p}/>);
        if (!confirmed) return;
        const model = await Scene.loadMeshFromPath(path);
        console.info("model=", model);
    }

    render() {
        return (<div className="App">
            <div className="panel">
                <header className="thm-bgPD thm-ele-nav">
                    <div>Web-Brayns</div>
                    <div>
                        <Icon content='import' onClick={this.handleLoadMesh}/>
                        <Icon content='bug'/>
                    </div>
                </header>
                <ModelList />
            </div>
            <div className='view'>
                <ImageStream brayns={this.props.brayns}/>
                <WebsocketConsole/>
            </div>
        </div>)
    }
}


async function loadAstrocyte(id: number): Promise<Model> {
    const path = `/gpfs/bbp.cscs.ch/project/proj3/resources/meshes/astrocytes/GLIA_${pad(id)}.h5_decimated.off`;
    console.info("path=", path);
    return await Scene.loadMeshFromPath(path);
}


function pad(value: number): string {
    let out = `${value}`;
    while (out.length < 6 ) {
        out = `0${out}`;
    }
    return out;
}
