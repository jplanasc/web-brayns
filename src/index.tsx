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
            const root = document.getElementById('root') as HTMLElement;
            ReactDOM.render(<Provider store={State.store}>
                <App brayns={client} stream="image" />
            </Provider>, root);

            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.add("vanish");
                window.setTimeout(() => document.body.removeChild(splash), 600);
            }
        }
        catch (ex) {
            console.error("Unable to connect Brayns: ", ex)
            await Dialog.alert(`Seems like Brayns is not reachable on ${hostName}!`);
            window.location.reload();
        }
    }
    catch (ex) {
        console.error("Unable to start!")
        console.info(ex)
        await Dialog.alert(
            <div>
                <h1>Unable to connect to Brayns' backend!</h1>
                <pre style={{ whiteSpace: "pre-wrap", opacity: .5 }}>{`${ex}`}</pre>
            </div>
        );
        console.info("window.location=", window.location);
        window.location.href = window.location.origin
    }
}

/*
const root = document.getElementById('root') as HTMLElement;
ReactDOM.render(<Provider store={State.store}>
    <div>
        <TargetsSelectorButton
            selectedTargets={[]}
            onClick={targets => { console.log(targets) }} />
        <TargetsSelectorButton
            selectedTargets={["Layer 1", "Layer 3", "Layer 5"]}
            onClick={targets => { console.log(targets) }} />
        <TargetsSelectorButton
            selectedTargets={["Ancien Layer 1", "Very old Layer 2", "Almost dead Layer 3", "Layer 4", "Layer 5", "Layer 6", "Layer X"]}
            onClick={targets => { console.log(targets) }} />
        <TargetsSelector
            onChange={targets => { console.log(targets) }}
            selectedTargets={["Layer 1", "Layer 3", "Layer 5"]}
            availableTargets={[
                "Layer 1",
                "Layer 2",
                "Layer 3",
                "Layer 4",
                "Layer 5",
                "Layer 6",
                "mc2_column",
                "L1_alpha",
                "L23_alpha",
                "L4_alpha",
                "L5_alpha",
                "L6_alpha",
                "L1_beta",
                "L23_beta",
                "L4_beta",
                "L5_beta",
                "L6_beta",
                "L1_gamma",
                "L23_gamma",
                "L4_gamma",
                "L5_gamma",
                "L6_gamma"
            ]} />
    </div>
</Provider>, root);

const splash = document.getElementById('splash-screen');
if (splash) {
    splash.classList.add("vanish");
    window.setTimeout(() => document.body.removeChild(splash), 600);
}
*/

start();
