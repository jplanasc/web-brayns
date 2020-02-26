/**
 * Depending on the use case, you can have different presets.
 * A preset is made of lights and rendering options.
 *
 *
 */
import Scene from '../../scene'
import LightsProxy from '../../proxy/lights'

export default {
    defaultRendering: wrap(defaultRendering),
    fastRenderingForSimulationPlayback: wrap(fastRenderingForSimulationPlayback),

    /**
     * Save the current preset for further restore.
     */
    save() { STACK.push(null) },
    restore() {
        if (STACK.length < 3) {
            const applyPreset = STACK[0]
            if (applyPreset) applyPreset()
            return
        }
        STACK.pop()
        const applyPreset = STACK[STACK.length - 1]
        if (applyPreset) applyPreset()
    }
}

const STACK: Array<null | (() => void)> = [defaultRendering]

/**
 * Wrapper form preset functions.
 * This is made to provide an easy way to save/restore presets.
 */
function wrap(applyPreset: () => void) {
    return async () => {
        if (STACK.length === 0) {
            STACK.push(applyPreset)
        } else {
            STACK[STACK.length - 1] = applyPreset
        }
        await applyPreset()
    }
}


async function defaultRendering() {
    await Scene.renderer.off()
    try {
        await LightsProxy.instance.clear()
        await Scene.Api.setRenderer({
            accumulation: true,
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
        await LightsProxy.instance.setKeyLight(1, true)
        await LightsProxy.instance.setFillLight(0.75, true)
        await LightsProxy.instance.setBackLight(1.5, true)
    } finally {
        await Scene.renderer.on()
    }
}

/**
 * For simulation playback, in order to reduce the flickering effect,
 * we want to prevent the image refinement and just use the head camera light.
 */
async function fastRenderingForSimulationPlayback() {
    await Scene.renderer.off()
    try {
        await LightsProxy.instance.clear()
        await Scene.Api.setRenderer({
            accumulation: false,
            current: "circuit_explorer_basic",
            head_light: true,
            max_accum_frames: 1,
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
            soft_shadows: 0,
            soft_shadows_samples: 1,
            use_hardware_randomizer: false,
            volume_alpha_correction: 0.5,
            volume_specular_exponent: 20
        })
    } finally {
        await Scene.renderer.on()
    }
}
