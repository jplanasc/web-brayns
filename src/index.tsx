import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'

import { IBraynsModel } from './web-brayns/types'
import PathService from "./web-brayns/service/path"
import ServiceHost from "./web-brayns/service/host"
import Scene from "./web-brayns/scene"
import Dialog from "./tfw/factory/dialog"
import Theme from "./tfw/theme"
import App from './app.container';
import State from './web-brayns/state'

import "./tfw/font/josefin.css"

import Python from './web-brayns/service/python'

Theme.apply("default");

async function start() {
    const output = await Python.exec("test", {text: "Hello world!"})
    console.info("output=", output);

    const hostName = await ServiceHost.getHostName(false);
    console.info("hostName=", hostName);

    const browse = await PathService.browse();
    console.info("browse=", browse);

    try {
        const client = await Dialog.wait("Contacting Brayns...", Scene.connect(hostName), false);
        const scene = await Dialog.wait("Loading models...", Scene.Api.getScene(), false);
        const planes = await Scene.Api.getClipPlanes();
        const planeIds = planes.map( p => p.id );
        Scene.Api.removeClipPlanes(planeIds);

        State.dispatch(State.Models.reset(
            scene.models.map((params: IBraynsModel) => ({
                brayns: params,
                parent: -1,
                deleted: false,
                selected: false,
                technical: false
            }))
        ));

        // Entry point for our app
        const root = document.getElementById('root') as HTMLElement;
        ReactDOM.render(<Provider store={State.store}><App brayns={client}/></Provider>, root);

        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add("vanish");
            window.setTimeout(() => document.body.removeChild(splash), 600);
        }
    }
    catch(ex) {
        await Dialog.alert(`Seems like Brayns is not reachable on ${hostName}!`);
        location.reload();
    }

}

start();
