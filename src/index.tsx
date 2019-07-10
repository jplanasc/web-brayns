import React from 'react';
import ReactDOM from 'react-dom';
import ServiceHost from "./web-brayns/service/host"
import Theme from "./tfw/theme"
import App from './app';

import "./tfw/font/josefin.css"


Theme.apply("default");

async function start() {
    // Entry point for our app
    const root = document.getElementById('root') as HTMLElement;
    ReactDOM.render(<App/>, root);

    const hostName = await ServiceHost.getHostName(false);
    console.info("hostName=", hostName);
}

start();
