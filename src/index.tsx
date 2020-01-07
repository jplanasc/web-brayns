import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import Package from '../package.json'
import Tfw from "tfw"
import { IBraynsModel } from './web-brayns/types'
import ServiceHost from "./web-brayns/service/host"
import Scene from "./web-brayns/scene"
import Theme from "./tfw/theme"
import App from './app.container';
import State from './web-brayns/state'
import Lights from './web-brayns/proxy/lights'

import "./tfw/font/josefin.css"

const Dialog = Tfw.Factory.Dialog

console.log("Version:", Package.version)

Theme.apply("default");

async function start() {
    try {
        const hostName = await ServiceHost.getHostName(false);
        console.info("hostName=", hostName);
        if (hostName.length === 0) {
            // No host name found. Maybe, we are waiting for a redirection after
            // resource allocation.
            return
        }

        try {
            const client = await Dialog.wait(
                `Contacting Brayns on ${hostName}...`,
                Scene.connect(hostName),
                false)
            //await Lights.initialize()
            const planes = await Scene.Api.getClipPlanes()
            const notNullplanes: {id: number, plane: [number,number,number,number]}[] =
                planes.filter( p => p !== null )
            const planeIds = notNullplanes.map( p => p.id )
            Scene.Api.removeClipPlanes(planeIds);

            const scene = await Dialog.wait("Loading models...", Scene.Api.getScene(), false)
            const models = scene.models.map((params: IBraynsModel) => ({
                brayns: params,
                parent: -1,
                deleted: false,
                selected: false,
                technical: false
            }))
            State.dispatch(State.Models.reset(models))
            State.dispatch(State.CurrentModel.reset(models[0]))

            // Entry point for our app
            const stream = await figureOutStreamType()
            console.info("Stream type:", stream.toUpperCase())
            const root = document.getElementById('root') as HTMLElement;
            ReactDOM.render(<Provider store={State.store}>
                    <App brayns={client} stream={stream}/>
                </Provider>, root);

            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.add("vanish");
                window.setTimeout(() => document.body.removeChild(splash), 600);
            }
        }
        catch(ex) {
            console.error("Unable to connect Brayns: ", ex)
            await Dialog.alert(`Seems like Brayns is not reachable on ${hostName}!`);
            location.reload();
        }
    }
    catch(ex) {
        console.error("Unable to start!")
        console.info(ex)
        await Dialog.alert(
            <div>
                <h1>Unable to connect to Brayns' backend!</h1>
                <pre style={{whiteSpace: "pre-wrap", opacity: .5}}>{`${ex}`}</pre>
            </div>
        );
        console.info("window.location=", window.location);
        window.location.href = window.location.origin
    }
}


/**
 * Brayns can send us data as JPEG images or as a video stream.
 * We will try to know which type is used by the current Brayns Service.
 */
async function figureOutStreamType(): Promise<("image" | "video")> {
    try {
        const result = await Scene.request("get-videostream")
        console.info("result=", result);
        if (!result) return "image"
        return "video"
    }
    catch(err) {
        return "image"
    }
}


start();
