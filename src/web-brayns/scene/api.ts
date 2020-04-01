import Scene from './scene'

export default {
    addClipPlane /* Add a clip plane; returns the clip plane descriptor */,
    addLightAmbient /* Add an ambient light */,
    addLightDirectional /* Add a directional light */,
    addLightQuad /* Add a quad light */,
    addLightSphere /* Add a sphere light */,
    addLightSpot /* Add a spotlight, returns id */,
    addModel /* Add model from remote path; returns model descriptor on success */,
    chunk /* Indicate sending of a binary chunk after this message */,
    clearLights /* Remove all lights in the scene */,
    exitLater /* Schedules Brayns to shutdown after a given amount of minutes */,
    fsExists /* Return the type of filer (file or folder) if a given path exists, or none if it does not exists */,
    fsGetContent /* Return the content of a file if possible, or an error otherwise */,
    fsListDir /* Return the content of a file if possible, or an error otherwise */,
    getAnimationParameters /* Get the current state of animation-parameters */,
    getApplicationParameters /* Get the current state of application-parameters */,
    getCamera /* Get the current state of camera */,
    getCameraParams /* Get the params of the current camera */,
    getClipPlanes /* Get all clip planes */,
    getEnvironmentMap /* Get the environment map from the scene */,
    getInstances /* Get instances */,
    getLights /* get all lights */,
    getLoaders /* Get all loaders */,
    getModelProperties /* Get the properties of the given model */,
    getModelTransferFunction /* Get the transfer function of the given model */,
    getRenderer /* Get the current state of renderer */,
    getRendererParams /* Get the params of the current renderer */,
    getScene /* Get the current state of scene */,
    getStatistics /* Get the current state of statistics */,
    getVideostream /* Get the videostream parameters */,
    getVolumeParameters /* Get the current state of volume-parameters */,
    imageJpeg /* Get the current state of image-jpeg */,
    imageStreamingMode /* Set the image streaming method between automatic or controlled */,
    inspect /* Inspect the scene at x-y position */,
    loadersSchema /* Get the schema for all loaders */,
    modelPropertiesSchema /* Get the property schema of the model */,
    quit /* Quit the application */,
    removeClipPlanes /* Remove clip planes from the scene given their gids */,
    removeLights /* Remove light given their IDs */,
    removeModel /* Remove the model(s) with the given ID(s) from the scene */,
    requestModelUpload /* Request upload of blob to trigger adding of model after blob has been received; returns model descriptor on success */,
    resetCamera /* Resets the camera to its initial values */,
    schema /* Get the schema of the given endpoint */,
    setAnimationParameters /* Set the new state of animation-parameters */,
    setApplicationParameters /* Set the new state of application-parameters */,
    setCamera /* Set the new state of camera */,
    setCameraParams /* Set the params on the current camera */,
    setEnvironmentMap /* Set a environment map in the scene */,
    setModelProperties /* Set the properties of the given model */,
    setModelTransferFunction /* Set the transfer function of the given model */,
    setRenderer /* Set the new state of renderer */,
    setRendererParams /* Set the params on the current renderer */,
    setScene /* Set the new state of scene */,
    setVideostream /* Set the video streaming parameters */,
    setVolumeParameters /* Set the new state of volume-parameters */,
    snapshot /* Make a snapshot of the current view */,
    triggerJpegStream /* Triggers the engine to stream a frame to the clients */,
    updateClipPlane /* Update a clip plane with the given coefficients */,
    updateInstance /* Update the instance with the given values */,
    updateModel /* Update the model with the given values */
}

//========================================================================
// "add-clip-plane" - Add a clip plane; returns the clip plane descriptor
//------------------------------------------------------------------------
export type IBraynsAddclipplaneInput = [
    number,
    number,
    number,
    number
]
export type IBraynsAddclipplaneOutput = (
    null
    | {
        id: (number /* Integer */);
        plane: [
            number,
            number,
            number,
            number
        ];
    })
/**
 * Add a clip plane; returns the clip plane descriptor
 */
async function addClipPlane(plane: IBraynsAddclipplaneInput): Promise<IBraynsAddclipplaneOutput> {
    const out = await Scene.request("add-clip-plane", plane)
    return out as IBraynsAddclipplaneOutput
}
//============================================
// "add-light-ambient" - Add an ambient light
//--------------------------------------------
export type IBraynsAddlightambientInput = {
    color: [
        number,
        number,
        number
    ];
    intensity: number;
    is_visible: boolean;
}
export type IBraynsAddlightambientOutput = (number /* Integer */)
/**
 * Add an ambient light
 */
async function addLightAmbient(light: IBraynsAddlightambientInput): Promise<IBraynsAddlightambientOutput> {
    const out = await Scene.request("add-light-ambient", light)
    return out as IBraynsAddlightambientOutput
}
//===================================================
// "add-light-directional" - Add a directional light
//---------------------------------------------------
export type IBraynsAddlightdirectionalInput = {
    angularDiameter: number;
    color: [
        number,
        number,
        number
    ];
    direction: [
        number,
        number,
        number
    ];
    intensity: number;
    is_visible: boolean;
}
export type IBraynsAddlightdirectionalOutput = (number /* Integer */)
/**
 * Add a directional light
 */
async function addLightDirectional(light: IBraynsAddlightdirectionalInput): Promise<IBraynsAddlightdirectionalOutput> {
    const out = await Scene.request("add-light-directional", light)
    return out as IBraynsAddlightdirectionalOutput
}
//=====================================
// "add-light-quad" - Add a quad light
//-------------------------------------
export type IBraynsAddlightquadInput = {
    color: [
        number,
        number,
        number
    ];
    edge1: [
        number,
        number,
        number
    ];
    edge2: [
        number,
        number,
        number
    ];
    intensity: number;
    is_visible: boolean;
    position: [
        number,
        number,
        number
    ];
}
export type IBraynsAddlightquadOutput = (number /* Integer */)
/**
 * Add a quad light
 */
async function addLightQuad(light: IBraynsAddlightquadInput): Promise<IBraynsAddlightquadOutput> {
    const out = await Scene.request("add-light-quad", light)
    return out as IBraynsAddlightquadOutput
}
//=========================================
// "add-light-sphere" - Add a sphere light
//-----------------------------------------
export type IBraynsAddlightsphereInput = {
    color: [
        number,
        number,
        number
    ];
    intensity: number;
    is_visible: boolean;
    position: [
        number,
        number,
        number
    ];
    radius: number;
}
export type IBraynsAddlightsphereOutput = (number /* Integer */)
/**
 * Add a sphere light
 */
async function addLightSphere(light: IBraynsAddlightsphereInput): Promise<IBraynsAddlightsphereOutput> {
    const out = await Scene.request("add-light-sphere", light)
    return out as IBraynsAddlightsphereOutput
}
//================================================
// "add-light-spot" - Add a spotlight, returns id
//------------------------------------------------
export type IBraynsAddlightspotInput = {
    color: [
        number,
        number,
        number
    ];
    direction: [
        number,
        number,
        number
    ];
    intensity: number;
    is_visible: boolean;
    openingAngle: number;
    penumbraAngle: number;
    position: [
        number,
        number,
        number
    ];
    radius: number;
}
export type IBraynsAddlightspotOutput = (number /* Integer */)
/**
 * Add a spotlight, returns id
 */
async function addLightSpot(light: IBraynsAddlightspotInput): Promise<IBraynsAddlightspotOutput> {
    const out = await Scene.request("add-light-spot", light)
    return out as IBraynsAddlightspotOutput
}
//===============================================================================
// "add-model" - Add model from remote path; returns model descriptor on success
//-------------------------------------------------------------------------------
export type IBraynsAddmodelInput = {
    bounding_box?: boolean;
    loader_name?: string;
    loader_properties?: {};
    name?: string;
    path: string;
    transformation?: {
        rotation: [
            number,
            number,
            number,
            number
        ];
        rotation_center?: [
            number,
            number,
            number
        ];
        scale: [
            number,
            number,
            number
        ];
        translation: [
            number,
            number,
            number
        ];
    };
    visible?: boolean;
}
export type IBraynsAddmodelOutput = (
    null
    | {
        bounding_box?: boolean;
        bounds?: {
            max: [
                number,
                number,
                number
            ];
            min: [
                number,
                number,
                number
            ];
        };
        id: (number /* Integer */);
        metadata?: {};
        name?: string;
        path?: string;
        transformation?: {
            rotation: [
                number,
                number,
                number,
                number
            ];
            rotation_center?: [
                number,
                number,
                number
            ];
            scale: [
                number,
                number,
                number
            ];
            translation: [
                number,
                number,
                number
            ];
        };
        visible?: boolean;
    })
/**
 * Add model from remote path; returns model descriptor on success
 */
async function addModel(model_param: IBraynsAddmodelInput): Promise<IBraynsAddmodelOutput> {
    const out = await Scene.request("add-model", model_param)
    return out as IBraynsAddmodelOutput
}
//=================================================================
// "chunk" - Indicate sending of a binary chunk after this message
//-----------------------------------------------------------------
export type IBraynsChunkInput = {
    id?: string;
}
export type IBraynsChunkOutput = undefined
/**
 * Indicate sending of a binary chunk after this message
 */
async function chunk(chunk: IBraynsChunkInput): Promise<IBraynsChunkOutput> {
    const out = await Scene.request("chunk", chunk)
    return out as IBraynsChunkOutput
}
//=================================================
// "clear-lights" - Remove all lights in the scene
//-------------------------------------------------
export type IBraynsClearlightsOutput = undefined
/**
 * Remove all lights in the scene
 */
async function clearLights(): Promise<IBraynsClearlightsOutput> {
    const out = await Scene.request("clear-lights", )
    return out as IBraynsClearlightsOutput
}
//=============================================================================
// "exit-later" - Schedules Brayns to shutdown after a given amount of minutes
//-----------------------------------------------------------------------------
export type IBraynsExitlaterInput = {
    minutes: (number /* Integer */);
}
export type IBraynsExitlaterOutput = undefined
/**
 * Schedules Brayns to shutdown after a given amount of minutes
 */
async function exitLater(minutes: IBraynsExitlaterInput): Promise<IBraynsExitlaterOutput> {
    const out = await Scene.request("exit-later", minutes)
    return out as IBraynsExitlaterOutput
}
//===============================================================================================================
// "fs-exists" - Return the type of filer (file or folder) if a given path exists, or none if it does not exists
//---------------------------------------------------------------------------------------------------------------
export type IBraynsFsexistsInput = {
    path: string;
}
export type IBraynsFsexistsOutput = {
    error: (number /* Integer */);
    message: string;
    type: string;
}
/**
 * Return the type of filer (file or folder) if a given path exists, or none if it does not exists
 */
async function fsExists(path: IBraynsFsexistsInput): Promise<IBraynsFsexistsOutput> {
    const out = await Scene.request("fs-exists", path)
    return out as IBraynsFsexistsOutput
}
//====================================================================================
// "fs-get-content" - Return the content of a file if possible, or an error otherwise
//------------------------------------------------------------------------------------
export type IBraynsFsgetcontentInput = {
    path: string;
}
export type IBraynsFsgetcontentOutput = {
    content: string;
    error: (number /* Integer */);
    message: string;
}
/**
 * Return the content of a file if possible, or an error otherwise
 */
async function fsGetContent(path: IBraynsFsgetcontentInput): Promise<IBraynsFsgetcontentOutput> {
    const out = await Scene.request("fs-get-content", path)
    return out as IBraynsFsgetcontentOutput
}
//=================================================================================
// "fs-list-dir" - Return the content of a file if possible, or an error otherwise
//---------------------------------------------------------------------------------
export type IBraynsFslistdirInput = {
    path: string;
}
export type IBraynsFslistdirOutput = {
    dirs: string[];
    error: (number /* Integer */);
    files: {
        names: string[];
        sizes: (number /* Integer */)[];
    };
    message: string;
}
/**
 * Return the content of a file if possible, or an error otherwise
 */
async function fsListDir(path: IBraynsFslistdirInput): Promise<IBraynsFslistdirOutput> {
    const out = await Scene.request("fs-list-dir", path)
    return out as IBraynsFslistdirOutput
}
//============================================================================
// "get-animation-parameters" - Get the current state of animation-parameters
//----------------------------------------------------------------------------
export type IBraynsGetanimationparametersOutput = {
    current?: (number /* Integer */);
    delta?: (number /* Integer */);
    dt?: number;
    frame_count?: (number /* Integer */);
    playing?: boolean;
    unit?: string;
}
/**
 * Get the current state of animation-parameters
 */
async function getAnimationParameters(): Promise<IBraynsGetanimationparametersOutput> {
    const out = await Scene.request("get-animation-parameters", )
    return out as IBraynsGetanimationparametersOutput
}
//================================================================================
// "get-application-parameters" - Get the current state of application-parameters
//--------------------------------------------------------------------------------
export type IBraynsGetapplicationparametersOutput = {
    engine?: string;
    image_stream_fps?: (number /* Integer */);
    jpeg_compression?: (number /* Integer */);
    viewport?: [
        number,
        number
    ];
}
/**
 * Get the current state of application-parameters
 */
async function getApplicationParameters(): Promise<IBraynsGetapplicationparametersOutput> {
    const out = await Scene.request("get-application-parameters", )
    return out as IBraynsGetapplicationparametersOutput
}
//================================================
// "get-camera" - Get the current state of camera
//------------------------------------------------
export type IBraynsGetcameraOutput = {
    current?: string;
    orientation?: [
        number,
        number,
        number,
        number
    ];
    position?: [
        number,
        number,
        number
    ];
    target?: [
        number,
        number,
        number
    ];
    types?: string[];
}
/**
 * Get the current state of camera
 */
async function getCamera(): Promise<IBraynsGetcameraOutput> {
    const out = await Scene.request("get-camera", )
    return out as IBraynsGetcameraOutput
}
//============================================================
// "get-camera-params" - Get the params of the current camera
//------------------------------------------------------------
export type IBraynsGetcameraparamsOutput = (
    {
        fovy?: number;
        aspect?: number;
        aperture_radius?: number;
        focus_distance?: number;
        enable_clipping_planes?: boolean;
    }
    | {
        fovy?: number;
        aspect?: number;
        aperture_radius?: number;
        focus_distance?: number;
        enable_clipping_planes?: boolean;
    }
    | {
        fovy?: number;
        aspect?: number;
        aperture_radius?: number;
        focus_distance?: number;
        enable_clipping_planes?: boolean;
    }
    | {
        height?: number;
        aspect?: number;
        enable_clipping_planes?: boolean;
    }
    | {
        enable_clipping_planes?: boolean;
        half?: boolean;
    }
    | {
        fovy?: number;
        aspect?: number;
        aperture_radius?: number;
        focus_distance?: number;
        enable_clipping_planes?: boolean;
    }
    | {
        fovy?: number;
        aspect?: number;
        enable_clipping_planes?: boolean;
    })
/**
 * Get the params of the current camera
 */
async function getCameraParams(): Promise<IBraynsGetcameraparamsOutput> {
    const out = await Scene.request("get-camera-params", )
    return out as IBraynsGetcameraparamsOutput
}
//=========================================
// "get-clip-planes" - Get all clip planes
//-----------------------------------------
export type IBraynsGetclipplanesOutput = (
    null
    | {
        id: (number /* Integer */);
        plane: [
            number,
            number,
            number,
            number
        ];
    })[]
/**
 * Get all clip planes
 */
async function getClipPlanes(): Promise<IBraynsGetclipplanesOutput> {
    const out = await Scene.request("get-clip-planes", )
    return out as IBraynsGetclipplanesOutput
}
//================================================================
// "get-environment-map" - Get the environment map from the scene
//----------------------------------------------------------------
export type IBraynsGetenvironmentmapOutput = {
    filename: string;
}
/**
 * Get the environment map from the scene
 */
async function getEnvironmentMap(): Promise<IBraynsGetenvironmentmapOutput> {
    const out = await Scene.request("get-environment-map", )
    return out as IBraynsGetenvironmentmapOutput
}
//=================================
// "get-instances" - Get instances
//---------------------------------
export type IBraynsGetinstancesInput = {
    id: (number /* Integer */);
    result_range?: [
        (number /* Integer */),
        (number /* Integer */)
    ];
}
export type IBraynsGetinstancesOutput = {
    bounding_box?: boolean;
    instance_id: (number /* Integer */);
    model_id: (number /* Integer */);
    transformation?: {
        rotation: [
            number,
            number,
            number,
            number
        ];
        rotation_center?: [
            number,
            number,
            number
        ];
        scale: [
            number,
            number,
            number
        ];
        translation: [
            number,
            number,
            number
        ];
    };
    visible?: boolean;
}[]
/**
 * Get instances
 */
async function getInstances(input: IBraynsGetinstancesInput): Promise<IBraynsGetinstancesOutput> {
    const out = await Scene.request("get-instances", input)
    return out as IBraynsGetinstancesOutput
}
//===============================
// "get-lights" - get all lights
//-------------------------------
export type IBraynsGetlightsOutput = {
    id: (number /* Integer */);
    properties: {};
    type: string;
}[]
/**
 * get all lights
 */
async function getLights(): Promise<IBraynsGetlightsOutput> {
    const out = await Scene.request("get-lights", )
    return out as IBraynsGetlightsOutput
}
//=================================
// "get-loaders" - Get all loaders
//---------------------------------
export type IBraynsGetloadersOutput = {
    extensions: string[];
    name: string;
    properties: {};
}[]
/**
 * Get all loaders
 */
async function getLoaders(): Promise<IBraynsGetloadersOutput> {
    const out = await Scene.request("get-loaders", )
    return out as IBraynsGetloadersOutput
}
//================================================================
// "get-model-properties" - Get the properties of the given model
//----------------------------------------------------------------
export type IBraynsGetmodelpropertiesInput = {
    id: (number /* Integer */);
}
export type IBraynsGetmodelpropertiesOutput = {}
/**
 * Get the properties of the given model
 */
async function getModelProperties(id: IBraynsGetmodelpropertiesInput): Promise<IBraynsGetmodelpropertiesOutput> {
    const out = await Scene.request("get-model-properties", id)
    return out as IBraynsGetmodelpropertiesOutput
}
//==============================================================================
// "get-model-transfer-function" - Get the transfer function of the given model
//------------------------------------------------------------------------------
export type IBraynsGetmodeltransferfunctionInput = {
    id: (number /* Integer */);
}
export type IBraynsGetmodeltransferfunctionOutput = {
    colormap?: {
        colors: [
            number,
            number,
            number
        ][];
        name?: string;
    };
    opacity_curve?: [
        number,
        number
    ][];
    range?: [
        number,
        number
    ];
}
/**
 * Get the transfer function of the given model
 */
async function getModelTransferFunction(id: IBraynsGetmodeltransferfunctionInput): Promise<IBraynsGetmodeltransferfunctionOutput> {
    const out = await Scene.request("get-model-transfer-function", id)
    return out as IBraynsGetmodeltransferfunctionOutput
}
//====================================================
// "get-renderer" - Get the current state of renderer
//----------------------------------------------------
export type IBraynsGetrendererOutput = {
    accumulation?: boolean;
    background_color?: [
        number,
        number,
        number
    ];
    current?: string;
    head_light?: boolean;
    max_accum_frames?: (number /* Integer */);
    samples_per_pixel?: (number /* Integer */);
    subsampling?: (number /* Integer */);
    types?: string[];
    variance_threshold?: number;
}
/**
 * Get the current state of renderer
 */
async function getRenderer(): Promise<IBraynsGetrendererOutput> {
    const out = await Scene.request("get-renderer", )
    return out as IBraynsGetrendererOutput
}
//================================================================
// "get-renderer-params" - Get the params of the current renderer
//----------------------------------------------------------------
export type IBraynsGetrendererparamsOutput = (
    {}
    | {
        gi_distance?: number;
        gi_weight?: number;
        gi_samples?: (number /* Integer */);
        shadows?: number;
        soft_shadows?: number;
        soft_shadows_samples?: (number /* Integer */);
        epsilon_factor?: number;
        sampling_threshold?: number;
        volume_specular_exponent?: number;
        volume_alpha_correction?: number;
        max_distance_to_secondary_model?: number;
        exposure?: number;
        fog_start?: number;
        fog_thickness?: number;
        max_bounces?: (number /* Integer */);
        use_hardware_randomizer?: boolean;
    }
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        max_distance_to_secondary_model?: number;
        exposure?: number;
        max_bounces?: (number /* Integer */);
        use_hardware_randomizer?: boolean;
    }
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        exposure?: number;
        fog_start?: number;
        fog_thickness?: number;
        tf_color?: boolean;
        shadows?: number;
        soft_shadows?: number;
        shadow_distance?: number;
        use_hardware_randomizer?: boolean;
    }
    | {
        alpha_correction?: number;
        detection_distance?: number;
        detection_far_color?: [
            number,
            number,
            number
        ];
        detection_near_color?: [
            number,
            number,
            number
        ];
        detection_on_different_material?: boolean;
        surface_shading_enabled?: boolean;
        max_bounces?: (number /* Integer */);
        exposure?: number;
        use_hardware_randomizer?: boolean;
    }
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        exposure?: number;
        fog_start?: number;
        fog_thickness?: number;
        max_bounces?: (number /* Integer */);
        use_hardware_randomizer?: boolean;
    }
    | {
        roulette_depth?: (number /* Integer */);
        max_contribution?: number;
    }
    | {}
    | {}
    | {
        ao_distance?: number;
        ao_samples?: (number /* Integer */);
        ao_transparency_enabled?: boolean;
        ao_weight?: number;
        one_sided_lighting?: boolean;
        shadows_enabled?: boolean;
    })
/**
 * Get the params of the current renderer
 */
async function getRendererParams(): Promise<IBraynsGetrendererparamsOutput> {
    const out = await Scene.request("get-renderer-params", )
    return out as IBraynsGetrendererparamsOutput
}
//==============================================
// "get-scene" - Get the current state of scene
//----------------------------------------------
export type IBraynsGetsceneOutput = {
    bounds?: {
        max: [
            number,
            number,
            number
        ];
        min: [
            number,
            number,
            number
        ];
    };
    models?: (
        null
        | {
            bounding_box?: boolean;
            bounds?: {
                max: [
                    number,
                    number,
                    number
                ];
                min: [
                    number,
                    number,
                    number
                ];
            };
            id: (number /* Integer */);
            metadata?: {};
            name?: string;
            path?: string;
            transformation?: {
                rotation: [
                    number,
                    number,
                    number,
                    number
                ];
                rotation_center?: [
                    number,
                    number,
                    number
                ];
                scale: [
                    number,
                    number,
                    number
                ];
                translation: [
                    number,
                    number,
                    number
                ];
            };
            visible?: boolean;
        })[];
}
/**
 * Get the current state of scene
 */
async function getScene(): Promise<IBraynsGetsceneOutput> {
    const out = await Scene.request("get-scene", )
    return out as IBraynsGetsceneOutput
}
//========================================================
// "get-statistics" - Get the current state of statistics
//--------------------------------------------------------
export type IBraynsGetstatisticsOutput = {
    fps: number;
    scene_size_in_bytes: (number /* Integer */);
}
/**
 * Get the current state of statistics
 */
async function getStatistics(): Promise<IBraynsGetstatisticsOutput> {
    const out = await Scene.request("get-statistics", )
    return out as IBraynsGetstatisticsOutput
}
//====================================================
// "get-videostream" - Get the videostream parameters
//----------------------------------------------------
export type IBraynsGetvideostreamOutput = {
    enabled?: boolean;
    kbps?: (number /* Integer */);
}
/**
 * Get the videostream parameters
 */
async function getVideostream(): Promise<IBraynsGetvideostreamOutput> {
    const out = await Scene.request("get-videostream", )
    return out as IBraynsGetvideostreamOutput
}
//======================================================================
// "get-volume-parameters" - Get the current state of volume-parameters
//----------------------------------------------------------------------
export type IBraynsGetvolumeparametersOutput = {
    adaptive_max_sampling_rate?: number;
    adaptive_sampling?: boolean;
    clip_box?: {
        max: [
            number,
            number,
            number
        ];
        min: [
            number,
            number,
            number
        ];
    };
    gradient_shading?: boolean;
    pre_integration?: boolean;
    sampling_rate?: number;
    single_shade?: boolean;
    specular?: [
        number,
        number,
        number
    ];
    volume_dimensions?: [
        (number /* Integer */),
        (number /* Integer */),
        (number /* Integer */)
    ];
    volume_element_spacing?: [
        number,
        number,
        number
    ];
    volume_offset?: [
        number,
        number,
        number
    ];
}
/**
 * Get the current state of volume-parameters
 */
async function getVolumeParameters(): Promise<IBraynsGetvolumeparametersOutput> {
    const out = await Scene.request("get-volume-parameters", )
    return out as IBraynsGetvolumeparametersOutput
}
//====================================================
// "image-jpeg" - Get the current state of image-jpeg
//----------------------------------------------------
export type IBraynsImagejpegOutput = {
    data: string;
}
/**
 * Get the current state of image-jpeg
 */
async function imageJpeg(): Promise<IBraynsImagejpegOutput> {
    const out = await Scene.request("image-jpeg", )
    return out as IBraynsImagejpegOutput
}
//=========================================================================================
// "image-streaming-mode" - Set the image streaming method between automatic or controlled
//-----------------------------------------------------------------------------------------
export type IBraynsImagestreamingmodeInput = {
    type: string;
}
export type IBraynsImagestreamingmodeOutput = undefined
/**
 * Set the image streaming method between automatic or controlled
 */
async function imageStreamingMode(type: IBraynsImagestreamingmodeInput): Promise<IBraynsImagestreamingmodeOutput> {
    const out = await Scene.request("image-streaming-mode", type)
    return out as IBraynsImagestreamingmodeOutput
}
//===============================================
// "inspect" - Inspect the scene at x-y position
//-----------------------------------------------
export type IBraynsInspectInput = [
    number,
    number
]
export type IBraynsInspectOutput = {
    hit: boolean;
    position: [
        number,
        number,
        number
    ];
}
/**
 * Inspect the scene at x-y position
 */
async function inspect(position: IBraynsInspectInput): Promise<IBraynsInspectOutput> {
    const out = await Scene.request("inspect", position)
    return out as IBraynsInspectOutput
}
//===================================================
// "loaders-schema" - Get the schema for all loaders
//---------------------------------------------------
export type IBraynsLoadersschemaOutput = {}[]
/**
 * Get the schema for all loaders
 */
async function loadersSchema(): Promise<IBraynsLoadersschemaOutput> {
    const out = await Scene.request("loaders-schema", )
    return out as IBraynsLoadersschemaOutput
}
//==================================================================
// "model-properties-schema" - Get the property schema of the model
//------------------------------------------------------------------
export type IBraynsModelpropertiesschemaInput = {
    id: (number /* Integer */);
}
export type IBraynsModelpropertiesschemaOutput = string
/**
 * Get the property schema of the model
 */
async function modelPropertiesSchema(id: IBraynsModelpropertiesschemaInput): Promise<IBraynsModelpropertiesschemaOutput> {
    const out = await Scene.request("model-properties-schema", id)
    return out as IBraynsModelpropertiesschemaOutput
}
//===============================
// "quit" - Quit the application
//-------------------------------
export type IBraynsQuitOutput = undefined
/**
 * Quit the application
 */
async function quit(): Promise<IBraynsQuitOutput> {
    const out = await Scene.request("quit", )
    return out as IBraynsQuitOutput
}
//===========================================================================
// "remove-clip-planes" - Remove clip planes from the scene given their gids
//---------------------------------------------------------------------------
export type IBraynsRemoveclipplanesInput = (number /* Integer */)[]
export type IBraynsRemoveclipplanesOutput = boolean
/**
 * Remove clip planes from the scene given their gids
 */
async function removeClipPlanes(ids: IBraynsRemoveclipplanesInput): Promise<IBraynsRemoveclipplanesOutput> {
    const out = await Scene.request("remove-clip-planes", ids)
    return out as IBraynsRemoveclipplanesOutput
}
//================================================
// "remove-lights" - Remove light given their IDs
//------------------------------------------------
export type IBraynsRemovelightsInput = (number /* Integer */)[]
export type IBraynsRemovelightsOutput = boolean
/**
 * Remove light given their IDs
 */
async function removeLights(ids: IBraynsRemovelightsInput): Promise<IBraynsRemovelightsOutput> {
    const out = await Scene.request("remove-lights", ids)
    return out as IBraynsRemovelightsOutput
}
//==========================================================================
// "remove-model" - Remove the model(s) with the given ID(s) from the scene
//--------------------------------------------------------------------------
export type IBraynsRemovemodelInput = (number /* Integer */)[]
export type IBraynsRemovemodelOutput = boolean
/**
 * Remove the model(s) with the given ID(s) from the scene
 */
async function removeModel(ids: IBraynsRemovemodelInput): Promise<IBraynsRemovemodelOutput> {
    const out = await Scene.request("remove-model", ids)
    return out as IBraynsRemovemodelOutput
}
//==============================================================================================================================================
// "request-model-upload" - Request upload of blob to trigger adding of model after blob has been received; returns model descriptor on success
//----------------------------------------------------------------------------------------------------------------------------------------------
export type IBraynsRequestmodeluploadInput = {
    bounding_box?: boolean;
    chunks_id: string;
    loader_name?: string;
    loader_properties?: {};
    name?: string;
    path: string;
    size: (number /* Integer */);
    transformation?: {
        rotation: [
            number,
            number,
            number,
            number
        ];
        rotation_center?: [
            number,
            number,
            number
        ];
        scale: [
            number,
            number,
            number
        ];
        translation: [
            number,
            number,
            number
        ];
    };
    type: string;
    visible?: boolean;
}
export type IBraynsRequestmodeluploadOutput = (
    null
    | {
        bounding_box?: boolean;
        bounds?: {
            max: [
                number,
                number,
                number
            ];
            min: [
                number,
                number,
                number
            ];
        };
        id: (number /* Integer */);
        metadata?: {};
        name?: string;
        path?: string;
        transformation?: {
            rotation: [
                number,
                number,
                number,
                number
            ];
            rotation_center?: [
                number,
                number,
                number
            ];
            scale: [
                number,
                number,
                number
            ];
            translation: [
                number,
                number,
                number
            ];
        };
        visible?: boolean;
    })
/**
 * Request upload of blob to trigger adding of model after blob has been received; returns model descriptor on success
 */
async function requestModelUpload(param: IBraynsRequestmodeluploadInput): Promise<IBraynsRequestmodeluploadOutput> {
    const out = await Scene.request("request-model-upload", param)
    return out as IBraynsRequestmodeluploadOutput
}
//==========================================================
// "reset-camera" - Resets the camera to its initial values
//----------------------------------------------------------
export type IBraynsResetcameraOutput = undefined
/**
 * Resets the camera to its initial values
 */
async function resetCamera(): Promise<IBraynsResetcameraOutput> {
    const out = await Scene.request("reset-camera", )
    return out as IBraynsResetcameraOutput
}
//=================================================
// "schema" - Get the schema of the given endpoint
//-------------------------------------------------
export type IBraynsSchemaInput = {
    endpoint: string;
}
export type IBraynsSchemaOutput = string
/**
 * Get the schema of the given endpoint
 */
async function schema(endpoint: IBraynsSchemaInput): Promise<IBraynsSchemaOutput> {
    const out = await Scene.request("schema", endpoint)
    return out as IBraynsSchemaOutput
}
//========================================================================
// "set-animation-parameters" - Set the new state of animation-parameters
//------------------------------------------------------------------------
export type IBraynsSetanimationparametersInput = {
    current?: (number /* Integer */);
    delta?: (number /* Integer */);
    dt?: number;
    frame_count?: (number /* Integer */);
    playing?: boolean;
    unit?: string;
}
export type IBraynsSetanimationparametersOutput = boolean
/**
 * Set the new state of animation-parameters
 */
async function setAnimationParameters(param: IBraynsSetanimationparametersInput): Promise<IBraynsSetanimationparametersOutput> {
    const out = await Scene.request("set-animation-parameters", param)
    return out as IBraynsSetanimationparametersOutput
}
//============================================================================
// "set-application-parameters" - Set the new state of application-parameters
//----------------------------------------------------------------------------
export type IBraynsSetapplicationparametersInput = {
    engine?: string;
    image_stream_fps?: (number /* Integer */);
    jpeg_compression?: (number /* Integer */);
    viewport?: [
        number,
        number
    ];
}
export type IBraynsSetapplicationparametersOutput = boolean
/**
 * Set the new state of application-parameters
 */
async function setApplicationParameters(param: IBraynsSetapplicationparametersInput): Promise<IBraynsSetapplicationparametersOutput> {
    const out = await Scene.request("set-application-parameters", param)
    return out as IBraynsSetapplicationparametersOutput
}
//============================================
// "set-camera" - Set the new state of camera
//--------------------------------------------
export type IBraynsSetcameraInput = {
    current?: string;
    orientation?: [
        number,
        number,
        number,
        number
    ];
    position?: [
        number,
        number,
        number
    ];
    target?: [
        number,
        number,
        number
    ];
    types?: string[];
}
export type IBraynsSetcameraOutput = boolean
/**
 * Set the new state of camera
 */
async function setCamera(param: IBraynsSetcameraInput): Promise<IBraynsSetcameraOutput> {
    const out = await Scene.request("set-camera", param)
    return out as IBraynsSetcameraOutput
}
//============================================================
// "set-camera-params" - Set the params on the current camera
//------------------------------------------------------------
export type IBraynsSetcameraparamsInput = (
    {
        fovy?: number;
        aspect?: number;
        aperture_radius?: number;
        focus_distance?: number;
        enable_clipping_planes?: boolean;
    }
    | {
        fovy?: number;
        aspect?: number;
        aperture_radius?: number;
        focus_distance?: number;
        enable_clipping_planes?: boolean;
    }
    | {
        fovy?: number;
        aspect?: number;
        aperture_radius?: number;
        focus_distance?: number;
        enable_clipping_planes?: boolean;
    }
    | {
        height?: number;
        aspect?: number;
        enable_clipping_planes?: boolean;
    }
    | {
        enable_clipping_planes?: boolean;
        half?: boolean;
    }
    | {
        fovy?: number;
        aspect?: number;
        aperture_radius?: number;
        focus_distance?: number;
        enable_clipping_planes?: boolean;
    }
    | {
        fovy?: number;
        aspect?: number;
        enable_clipping_planes?: boolean;
    })
export type IBraynsSetcameraparamsOutput = boolean
/**
 * Set the params on the current camera
 */
async function setCameraParams(input: IBraynsSetcameraparamsInput): Promise<IBraynsSetcameraparamsOutput> {
    const out = await Scene.request("set-camera-params", input)
    return out as IBraynsSetcameraparamsOutput
}
//============================================================
// "set-environment-map" - Set a environment map in the scene
//------------------------------------------------------------
export type IBraynsSetenvironmentmapInput = {
    filename: string;
}
export type IBraynsSetenvironmentmapOutput = boolean
/**
 * Set a environment map in the scene
 */
async function setEnvironmentMap(filename: IBraynsSetenvironmentmapInput): Promise<IBraynsSetenvironmentmapOutput> {
    const out = await Scene.request("set-environment-map", filename)
    return out as IBraynsSetenvironmentmapOutput
}
//================================================================
// "set-model-properties" - Set the properties of the given model
//----------------------------------------------------------------
export type IBraynsSetmodelpropertiesInput = {
    id: (number /* Integer */);
    properties: {};
}
export type IBraynsSetmodelpropertiesOutput = boolean
/**
 * Set the properties of the given model
 */
async function setModelProperties(param: IBraynsSetmodelpropertiesInput): Promise<IBraynsSetmodelpropertiesOutput> {
    const out = await Scene.request("set-model-properties", param)
    return out as IBraynsSetmodelpropertiesOutput
}
//==============================================================================
// "set-model-transfer-function" - Set the transfer function of the given model
//------------------------------------------------------------------------------
export type IBraynsSetmodeltransferfunctionInput = {
    id: (number /* Integer */);
    transfer_function: {
        colormap?: {
            colors: [
                number,
                number,
                number
            ][];
            name?: string;
        };
        opacity_curve?: [
            number,
            number
        ][];
        range?: [
            number,
            number
        ];
    };
}
export type IBraynsSetmodeltransferfunctionOutput = boolean
/**
 * Set the transfer function of the given model
 */
async function setModelTransferFunction(param: IBraynsSetmodeltransferfunctionInput): Promise<IBraynsSetmodeltransferfunctionOutput> {
    const out = await Scene.request("set-model-transfer-function", param)
    return out as IBraynsSetmodeltransferfunctionOutput
}
//================================================
// "set-renderer" - Set the new state of renderer
//------------------------------------------------
export type IBraynsSetrendererInput = {
    accumulation?: boolean;
    background_color?: [
        number,
        number,
        number
    ];
    current?: string;
    head_light?: boolean;
    max_accum_frames?: (number /* Integer */);
    samples_per_pixel?: (number /* Integer */);
    subsampling?: (number /* Integer */);
    types?: string[];
    variance_threshold?: number;
}
export type IBraynsSetrendererOutput = boolean
/**
 * Set the new state of renderer
 */
async function setRenderer(param: IBraynsSetrendererInput): Promise<IBraynsSetrendererOutput> {
    const out = await Scene.request("set-renderer", param)
    return out as IBraynsSetrendererOutput
}
//================================================================
// "set-renderer-params" - Set the params on the current renderer
//----------------------------------------------------------------
export type IBraynsSetrendererparamsInput = (
    {}
    | {
        gi_distance?: number;
        gi_weight?: number;
        gi_samples?: (number /* Integer */);
        shadows?: number;
        soft_shadows?: number;
        soft_shadows_samples?: (number /* Integer */);
        epsilon_factor?: number;
        sampling_threshold?: number;
        volume_specular_exponent?: number;
        volume_alpha_correction?: number;
        max_distance_to_secondary_model?: number;
        exposure?: number;
        fog_start?: number;
        fog_thickness?: number;
        max_bounces?: (number /* Integer */);
        use_hardware_randomizer?: boolean;
    }
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        max_distance_to_secondary_model?: number;
        exposure?: number;
        max_bounces?: (number /* Integer */);
        use_hardware_randomizer?: boolean;
    }
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        exposure?: number;
        fog_start?: number;
        fog_thickness?: number;
        tf_color?: boolean;
        shadows?: number;
        soft_shadows?: number;
        shadow_distance?: number;
        use_hardware_randomizer?: boolean;
    }
    | {
        alpha_correction?: number;
        detection_distance?: number;
        detection_far_color?: [
            number,
            number,
            number
        ];
        detection_near_color?: [
            number,
            number,
            number
        ];
        detection_on_different_material?: boolean;
        surface_shading_enabled?: boolean;
        max_bounces?: (number /* Integer */);
        exposure?: number;
        use_hardware_randomizer?: boolean;
    }
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        exposure?: number;
        fog_start?: number;
        fog_thickness?: number;
        max_bounces?: (number /* Integer */);
        use_hardware_randomizer?: boolean;
    }
    | {
        roulette_depth?: (number /* Integer */);
        max_contribution?: number;
    }
    | {}
    | {}
    | {
        ao_distance?: number;
        ao_samples?: (number /* Integer */);
        ao_transparency_enabled?: boolean;
        ao_weight?: number;
        one_sided_lighting?: boolean;
        shadows_enabled?: boolean;
    })
export type IBraynsSetrendererparamsOutput = boolean
/**
 * Set the params on the current renderer
 */
async function setRendererParams(input: IBraynsSetrendererparamsInput): Promise<IBraynsSetrendererparamsOutput> {
    const out = await Scene.request("set-renderer-params", input)
    return out as IBraynsSetrendererparamsOutput
}
//==========================================
// "set-scene" - Set the new state of scene
//------------------------------------------
export type IBraynsSetsceneInput = {
    bounds?: {
        max: [
            number,
            number,
            number
        ];
        min: [
            number,
            number,
            number
        ];
    };
    models?: (
        null
        | {
            bounding_box?: boolean;
            bounds?: {
                max: [
                    number,
                    number,
                    number
                ];
                min: [
                    number,
                    number,
                    number
                ];
            };
            id: (number /* Integer */);
            metadata?: {};
            name?: string;
            path?: string;
            transformation?: {
                rotation: [
                    number,
                    number,
                    number,
                    number
                ];
                rotation_center?: [
                    number,
                    number,
                    number
                ];
                scale: [
                    number,
                    number,
                    number
                ];
                translation: [
                    number,
                    number,
                    number
                ];
            };
            visible?: boolean;
        })[];
}
export type IBraynsSetsceneOutput = boolean
/**
 * Set the new state of scene
 */
async function setScene(param: IBraynsSetsceneInput): Promise<IBraynsSetsceneOutput> {
    const out = await Scene.request("set-scene", param)
    return out as IBraynsSetsceneOutput
}
//========================================================
// "set-videostream" - Set the video streaming parameters
//--------------------------------------------------------
export type IBraynsSetvideostreamInput = {
    enabled?: boolean;
    kbps?: (number /* Integer */);
}
export type IBraynsSetvideostreamOutput = boolean
/**
 * Set the video streaming parameters
 */
async function setVideostream(params: IBraynsSetvideostreamInput): Promise<IBraynsSetvideostreamOutput> {
    const out = await Scene.request("set-videostream", params)
    return out as IBraynsSetvideostreamOutput
}
//==================================================================
// "set-volume-parameters" - Set the new state of volume-parameters
//------------------------------------------------------------------
export type IBraynsSetvolumeparametersInput = {
    adaptive_max_sampling_rate?: number;
    adaptive_sampling?: boolean;
    clip_box?: {
        max: [
            number,
            number,
            number
        ];
        min: [
            number,
            number,
            number
        ];
    };
    gradient_shading?: boolean;
    pre_integration?: boolean;
    sampling_rate?: number;
    single_shade?: boolean;
    specular?: [
        number,
        number,
        number
    ];
    volume_dimensions?: [
        (number /* Integer */),
        (number /* Integer */),
        (number /* Integer */)
    ];
    volume_element_spacing?: [
        number,
        number,
        number
    ];
    volume_offset?: [
        number,
        number,
        number
    ];
}
export type IBraynsSetvolumeparametersOutput = boolean
/**
 * Set the new state of volume-parameters
 */
async function setVolumeParameters(param: IBraynsSetvolumeparametersInput): Promise<IBraynsSetvolumeparametersOutput> {
    const out = await Scene.request("set-volume-parameters", param)
    return out as IBraynsSetvolumeparametersOutput
}
//==================================================
// "snapshot" - Make a snapshot of the current view
//--------------------------------------------------
export type IBraynsSnapshotInput = {
    animation_parameters?: (
        null
        | {
            current?: (number /* Integer */);
            delta?: (number /* Integer */);
            dt?: number;
            frame_count?: (number /* Integer */);
            playing?: boolean;
            unit?: string;
        });
    camera?: (
        null
        | {
            current?: string;
            orientation?: [
                number,
                number,
                number,
                number
            ];
            position?: [
                number,
                number,
                number
            ];
            target?: [
                number,
                number,
                number
            ];
            types?: string[];
        });
    filePath?: string;
    format: string;
    name?: string;
    quality?: (number /* Integer */);
    renderer?: (
        null
        | {
            accumulation?: boolean;
            background_color?: [
                number,
                number,
                number
            ];
            current?: string;
            head_light?: boolean;
            max_accum_frames?: (number /* Integer */);
            samples_per_pixel?: (number /* Integer */);
            subsampling?: (number /* Integer */);
            types?: string[];
            variance_threshold?: number;
        });
    samples_per_pixel?: (number /* Integer */);
    size: [
        (number /* Integer */),
        (number /* Integer */)
    ];
}
export type IBraynsSnapshotOutput = {
    data: string;
}
/**
 * Make a snapshot of the current view
 */
async function snapshot(settings: IBraynsSnapshotInput): Promise<IBraynsSnapshotOutput> {
    const out = await Scene.request("snapshot", settings)
    return out as IBraynsSnapshotOutput
}
//==============================================================================
// "trigger-jpeg-stream" - Triggers the engine to stream a frame to the clients
//------------------------------------------------------------------------------
export type IBraynsTriggerjpegstreamOutput = undefined
/**
 * Triggers the engine to stream a frame to the clients
 */
async function triggerJpegStream(): Promise<IBraynsTriggerjpegstreamOutput> {
    const out = await Scene.request("trigger-jpeg-stream", )
    return out as IBraynsTriggerjpegstreamOutput
}
//=======================================================================
// "update-clip-plane" - Update a clip plane with the given coefficients
//-----------------------------------------------------------------------
export type IBraynsUpdateclipplaneInput = {
    id: (number /* Integer */);
    plane: [
        number,
        number,
        number,
        number
    ];
}
export type IBraynsUpdateclipplaneOutput = boolean
/**
 * Update a clip plane with the given coefficients
 */
async function updateClipPlane(clip_plane: IBraynsUpdateclipplaneInput): Promise<IBraynsUpdateclipplaneOutput> {
    const out = await Scene.request("update-clip-plane", clip_plane)
    return out as IBraynsUpdateclipplaneOutput
}
//===============================================================
// "update-instance" - Update the instance with the given values
//---------------------------------------------------------------
export type IBraynsUpdateinstanceInput = {
    bounding_box?: boolean;
    instance_id: (number /* Integer */);
    model_id: (number /* Integer */);
    transformation?: {
        rotation: [
            number,
            number,
            number,
            number
        ];
        rotation_center?: [
            number,
            number,
            number
        ];
        scale: [
            number,
            number,
            number
        ];
        translation: [
            number,
            number,
            number
        ];
    };
    visible?: boolean;
}
export type IBraynsUpdateinstanceOutput = boolean
/**
 * Update the instance with the given values
 */
async function updateInstance(model_instance: IBraynsUpdateinstanceInput): Promise<IBraynsUpdateinstanceOutput> {
    const out = await Scene.request("update-instance", model_instance)
    return out as IBraynsUpdateinstanceOutput
}
//=========================================================
// "update-model" - Update the model with the given values
//---------------------------------------------------------
export type IBraynsUpdatemodelInput = {
    bounding_box?: boolean;
    bounds?: {
        max: [
            number,
            number,
            number
        ];
        min: [
            number,
            number,
            number
        ];
    };
    id: (number /* Integer */);
    metadata?: {};
    name?: string;
    path?: string;
    transformation?: {
        rotation: [
            number,
            number,
            number,
            number
        ];
        rotation_center?: [
            number,
            number,
            number
        ];
        scale: [
            number,
            number,
            number
        ];
        translation: [
            number,
            number,
            number
        ];
    };
    visible?: boolean;
}
export type IBraynsUpdatemodelOutput = boolean
/**
 * Update the model with the given values
 */
async function updateModel(model: IBraynsUpdatemodelInput): Promise<IBraynsUpdatemodelOutput> {
    const out = await Scene.request("update-model", model)
    return out as IBraynsUpdatemodelOutput
}
