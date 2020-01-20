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
            await Lights.initialize()
            const planes = await Scene.Api.getClipPlanes()
            const notNullplanes: { id: number, plane: [number, number, number, number] }[] =
                planes.filter(p => p !== null)
            const planeIds = notNullplanes.map(p => p.id)
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

            // Initial renderer
            await Scene.Api.setRenderer({
                "accumulation": true,
                "background_color": [
                    0,
                    0,
                    0
                ],
                current: "circuit_explorer_advanced",
                head_light: false,
                max_accum_frames: 128,
                samples_per_pixel: 1,
                subsampling: 1,
                variance_threshold: -1
            });
            await Scene.Api.setRendererParams({
                epsilon_factor: 1,
                exposure: 1,
                fog_start: 0,
                fog_thickness: 100000000,
                gi_distance: 10000,
                gi_samples: 0,
                gi_weight: 0,
                max_bounces: 3,
                max_distance_to_secondary_model: 30,
                sampling_threshold: 0.001,
                shadows: 0,
                soft_shadows: 1,
                soft_shadows_samples: 1,
                use_hardware_randomizer: false,
                volume_alpha_correction: 0.5,
                volume_specular_exponent: 20
            })

            // Entry point for our app
            const stream = await figureOutStreamType()
            console.info("Stream type:", stream.toUpperCase())
            const root = document.getElementById('root') as HTMLElement;
            ReactDOM.render(<Provider store={State.store}>
                <App brayns={client} stream={stream} />
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
            location.reload();
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


/**
 * Brayns can send us data as JPEG images or as a video stream.
 * We will try to know which type is used by the current Brayns Service.
 */
async function figureOutStreamType(): Promise<("image" | "video")> {
    /*
    try {
        const result = await Scene.request("get-videostream")
        console.info("result=", result);
        if (!result) return "image"
        return "video"
    }
    catch (err) {*/
        return "image"
    //}
}


start();
