import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'

import ServiceHost from "./web-brayns/service/host"
import Scene from "./web-brayns/scene"
import Dialog from "./tfw/factory/dialog"
import Theme from "./tfw/theme"
import App from './app.container';
import State from './web-brayns/state'

import "./tfw/font/josefin.css"


Theme.apply("default");

async function start() {
    const hostName = await ServiceHost.getHostName(false);
    console.info("hostName=", hostName);

    try {
        const client = await Dialog.wait(
            "Connecting to Brayns service...",
            Scene.connect(hostName)
        );

        const scene = await Dialog.wait("Loading models...", Scene.Api.getScene());
        State.dispatch(State.Models.reset(scene.models));

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
