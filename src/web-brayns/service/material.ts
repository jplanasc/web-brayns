import Scene from '../scene'

export default {
    getMaterialIds,
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
    materialIds: (number | BigInt)[]
}


/**
 * Return the list of material IDs for a given model.
 * @param  modelId [description]
 * @return         [description]
 */
async function getMaterialIds(modelId: number): Promise<number[]> {
    try {
        const result = await Scene.request("get-material-ids", { modelId }) as { ids: number[] }
        return result.ids
    } catch (ex) {
        console.error("Unable to get materialIds:", ex)
        throw ex
    }
}

async function setMaterials(params: Partial<IMaterial>) {
    const material: IMaterial = {
        modelId: 0,
        materialIds: [],
        diffuseColor: [1, 0.6, 0.1],
        specularColor: [1, 1, 1],
        specularExponent: 15,
        reflectionIndex: 0,
        opacity: 1,
        refractionIndex: 1,
        emission: 0.2,
        glossiness: 0.2,
        simulationDataCast: false,
        shadingMode: 1,  // Diffuse
        clippingMode: 0,
        userParameter: 0,
        ...params
    }
    await Scene.request(
        "set-material-extra-attributes",
        { modelId: params.modelId }
    )
    console.info("[set-material-range] material=", material);
    await Scene.request(
        "set-material-range", material
    )
}
