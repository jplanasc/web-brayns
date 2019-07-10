import React from 'react';
import ReactDOM from 'react-dom';
import ServiceHost from "./web-brayns/service/host"
import Dialog from "./tfw/factory/dialog"
import Theme from "./tfw/theme"
import App from './app';

import "./tfw/font/josefin.css"


Theme.apply("default");

async function start() {
    const hostName = await ServiceHost.getHostName(false);
    console.info("hostName=", hostName);

    try {
        const client = await Dialog.wait("Connecting to Brayns service...", ServiceHost.connect(hostName));
        // Entry point for our app
        const root = document.getElementById('root') as HTMLElement;
        ReactDOM.render(<App brayns={client}/>, root);

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
