import Scene from '../scene'

export default {
    setMaterials,
    SHADER: {
        NONE: 0,
        DIFFUSE: 1,
        ELECTRON: 2,
        CARTOON: 3,
        ELECTRON_TRANSPARENCY: 4,
        PERLIN: 5,
        DIFFUSE_TRANSPARENCY: 6,
        CHECKER: 7
    }
}

interface IMaterialBase {
    modelId: number,
    // Number of elements must be an integral multiple of 3.
    diffuseColor: number[],
    specularColor?: [number, number, number],
    specularExponent?: number,
    reflectionIndex?: number,
    opacity?: number,
    refractionIndex?: number,
    emission?: number,
    glossiness?: number,
    simulationDataCast?: boolean,
    /**
     * 0: none.
     * 1: diffuse (default).
     * 2: electron.
     * 3: cartoon.
     * 4: electon-transparency.
     * 5: perlin.
     * 6: diffuse-transparency.
     * 7: checker.
     */
    shadingMode?: number,
    clippingMode?: number,
    userParameter?: number
}

export interface IMaterial extends IMaterialBase {
    materialIds: (number|BigInt)[]
}


async function setMaterials(params: IMaterial) {
    await Scene.request(
        "set-material-extra-attributes",
        { modelId: params.modelId }
    )
    await Scene.request(
        "set-material-range", {
            specularColor: [.8,.8,.8],
            specularExponent: 0,
            reflectionIndex: 0,
            opacity: 1,
            refractionIndex: 0,
            emission: 0,
            glossiness: 0,
            simulationDataCast: false,
            shadingMode: 1,
            clippingMode: 0,
            userParameter: 0,
            ...params
        }
    )

}
