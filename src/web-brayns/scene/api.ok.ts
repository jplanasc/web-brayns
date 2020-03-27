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
    getVolumeParameters /* Get the current state of volume-parameters */,
    imageJpeg /* Get the current state of image-jpeg */,
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
    setVolumeParameters /* Set the new state of volume-parameters */,
    snapshot /* Make a snapshot of the current view */,
    updateClipPlane /* Update a clip plane with the given coefficients */,
    updateInstance /* Update the instance with the given values */,
    updateModel /* Update the model with the given values */
}

//========================================================================
// "add-clip-plane" - Add a clip plane; returns the clip plane descriptor
//------------------------------------------------------------------------
export type API_addClipPlane_Param0 = [
    number,
    number,
    number,
    number
]
export type API_addClipPlane_Return = (
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
async function addClipPlane(plane: API_addClipPlane_Param0): Promise<API_addClipPlane_Return> {
    const out = await Scene.request("add-clip-plane", plane)
    return out as API_addClipPlane_Return
}
//============================================
// "add-light-ambient" - Add an ambient light
//--------------------------------------------
export type API_addLightAmbient_Param0 = {
    color: [
        number,
        number,
        number
    ];
    intensity: number;
    is_visible: boolean;
}
export type API_addLightAmbient_Return = (number /* Integer */)
/**
 * Add an ambient light
 */
async function addLightAmbient(light: API_addLightAmbient_Param0): Promise<API_addLightAmbient_Return> {
    const out = await Scene.request("add-light-ambient", light)
    return out as API_addLightAmbient_Return
}
//===================================================
// "add-light-directional" - Add a directional light
//---------------------------------------------------
export type API_addLightDirectional_Param0 = {
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
export type API_addLightDirectional_Return = (number /* Integer */)
/**
 * Add a directional light
 */
async function addLightDirectional(light: API_addLightDirectional_Param0): Promise<API_addLightDirectional_Return> {
    const out = await Scene.request("add-light-directional", light)
    return out as API_addLightDirectional_Return
}
//=====================================
// "add-light-quad" - Add a quad light
//-------------------------------------
export type API_addLightQuad_Param0 = {
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
export type API_addLightQuad_Return = (number /* Integer */)
/**
 * Add a quad light
 */
async function addLightQuad(light: API_addLightQuad_Param0): Promise<API_addLightQuad_Return> {
    const out = await Scene.request("add-light-quad", light)
    return out as API_addLightQuad_Return
}
//=========================================
// "add-light-sphere" - Add a sphere light
//-----------------------------------------
export type API_addLightSphere_Param0 = {
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
export type API_addLightSphere_Return = (number /* Integer */)
/**
 * Add a sphere light
 */
async function addLightSphere(light: API_addLightSphere_Param0): Promise<API_addLightSphere_Return> {
    const out = await Scene.request("add-light-sphere", light)
    return out as API_addLightSphere_Return
}
//================================================
// "add-light-spot" - Add a spotlight, returns id
//------------------------------------------------
export type API_addLightSpot_Param0 = {
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
export type API_addLightSpot_Return = (number /* Integer */)
/**
 * Add a spotlight, returns id
 */
async function addLightSpot(light: API_addLightSpot_Param0): Promise<API_addLightSpot_Return> {
    const out = await Scene.request("add-light-spot", light)
    return out as API_addLightSpot_Return
}
//===============================================================================
// "add-model" - Add model from remote path; returns model descriptor on success
//-------------------------------------------------------------------------------
export type API_addModel_Param0 = {
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
export type API_addModel_Return = (
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
async function addModel(model_param: API_addModel_Param0): Promise<API_addModel_Return> {
    const out = await Scene.request("add-model", model_param)
    return out as API_addModel_Return
}
//=================================================================
// "chunk" - Indicate sending of a binary chunk after this message
//-----------------------------------------------------------------
export type API_chunk_Param0 = {
    id?: string;
}
export type API_chunk_Return = undefined
/**
 * Indicate sending of a binary chunk after this message
 */
async function chunk(chunk: API_chunk_Param0): Promise<API_chunk_Return> {
    const out = await Scene.request("chunk", chunk)
    return out as API_chunk_Return
}
//=================================================
// "clear-lights" - Remove all lights in the scene
//-------------------------------------------------
export type API_clearLights_Return = undefined
/**
 * Remove all lights in the scene
 */
async function clearLights(): Promise<API_clearLights_Return> {
    const out = await Scene.request("clear-lights", )
    return out as API_clearLights_Return
}
//============================================================================
// "get-animation-parameters" - Get the current state of animation-parameters
//----------------------------------------------------------------------------
export type API_getAnimationParameters_Return = {
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
async function getAnimationParameters(): Promise<API_getAnimationParameters_Return> {
    const out = await Scene.request("get-animation-parameters", )
    return out as API_getAnimationParameters_Return
}
//================================================================================
// "get-application-parameters" - Get the current state of application-parameters
//--------------------------------------------------------------------------------
export type API_getApplicationParameters_Return = {
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
async function getApplicationParameters(): Promise<API_getApplicationParameters_Return> {
    const out = await Scene.request("get-application-parameters", )
    return out as API_getApplicationParameters_Return
}
//================================================
// "get-camera" - Get the current state of camera
//------------------------------------------------
export type API_getCamera_Return = {
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
async function getCamera(): Promise<API_getCamera_Return> {
    const out = await Scene.request("get-camera", )
    return out as API_getCamera_Return
}
//============================================================
// "get-camera-params" - Get the params of the current camera
//------------------------------------------------------------
export type API_getCameraParams_Return = (
    {
        height?: number;
        aspect?: number;
        enable_clipping_planes?: boolean;
    }
    | {}
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
    })
/**
 * Get the params of the current camera
 */
async function getCameraParams(): Promise<API_getCameraParams_Return> {
    const out = await Scene.request("get-camera-params", )
    return out as API_getCameraParams_Return
}
//=========================================
// "get-clip-planes" - Get all clip planes
//-----------------------------------------
export type API_getClipPlanes_Return = (
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
async function getClipPlanes(): Promise<API_getClipPlanes_Return> {
    const out = await Scene.request("get-clip-planes", )
    return out as API_getClipPlanes_Return
}
//================================================================
// "get-environment-map" - Get the environment map from the scene
//----------------------------------------------------------------
export type API_getEnvironmentMap_Return = {
    filename: string;
}
/**
 * Get the environment map from the scene
 */
async function getEnvironmentMap(): Promise<API_getEnvironmentMap_Return> {
    const out = await Scene.request("get-environment-map", )
    return out as API_getEnvironmentMap_Return
}
//=================================
// "get-instances" - Get instances
//---------------------------------
export type API_getInstances_Param0 = {
    id: (number /* Integer */);
    result_range?: [
        (number /* Integer */),
        (number /* Integer */)
    ];
}
export type API_getInstances_Return = {
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
async function getInstances(id, range: API_getInstances_Param0): Promise<API_getInstances_Return> {
    const out = await Scene.request("get-instances", id, range)
    return out as API_getInstances_Return
}
//===============================
// "get-lights" - get all lights
//-------------------------------
export type API_getLights_Return = {
    id: (number /* Integer */);
    properties: {};
    type: string;
}[]
/**
 * get all lights
 */
async function getLights(): Promise<API_getLights_Return> {
    const out = await Scene.request("get-lights", )
    return out as API_getLights_Return
}
//=================================
// "get-loaders" - Get all loaders
//---------------------------------
export type API_getLoaders_Return = {
    extensions: string[];
    name: string;
    properties: {};
}[]
/**
 * Get all loaders
 */
async function getLoaders(): Promise<API_getLoaders_Return> {
    const out = await Scene.request("get-loaders", )
    return out as API_getLoaders_Return
}
//================================================================
// "get-model-properties" - Get the properties of the given model
//----------------------------------------------------------------
export type API_getModelProperties_Param0 = {
    id: (number /* Integer */);
}
export type API_getModelProperties_Return = {}
/**
 * Get the properties of the given model
 */
async function getModelProperties(id: API_getModelProperties_Param0): Promise<API_getModelProperties_Return> {
    const out = await Scene.request("get-model-properties", id)
    return out as API_getModelProperties_Return
}
//==============================================================================
// "get-model-transfer-function" - Get the transfer function of the given model
//------------------------------------------------------------------------------
export type API_getModelTransferFunction_Param0 = {
    id: (number /* Integer */);
}
export type API_getModelTransferFunction_Return = {
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
async function getModelTransferFunction(id: API_getModelTransferFunction_Param0): Promise<API_getModelTransferFunction_Return> {
    const out = await Scene.request("get-model-transfer-function", id)
    return out as API_getModelTransferFunction_Return
}
//====================================================
// "get-renderer" - Get the current state of renderer
//----------------------------------------------------
export type API_getRenderer_Return = {
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
async function getRenderer(): Promise<API_getRenderer_Return> {
    const out = await Scene.request("get-renderer", )
    return out as API_getRenderer_Return
}
//================================================================
// "get-renderer-params" - Get the params of the current renderer
//----------------------------------------------------------------
export type API_getRendererParams_Return = (
    {
        gi_distance?: number;
        gi_weight?: number;
        gi_samples?: (number /* Integer */);
        shadows?: number;
        soft_shadows?: number;
        sampling_threshold?: number;
        volume_specular_exponent?: number;
        volume_alpha_correction?: number;
        max_distance_to_secondary_model?: number;
        pixel_alpha?: number;
        fog_start?: number;
        fog_thickness?: number;
    }
    | {}
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        pixel_alpha?: number;
        fog_start?: number;
        fog_thickness?: number;
    }
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        pixel_alpha?: number;
        fog_start?: number;
        fog_thickness?: number;
        gi_distance?: number;
        gi_weight?: number;
        gi_softness?: number;
        gi_samples?: (number /* Integer */);
        tf_color?: boolean;
    }
    | {
        roulette_depth?: (number /* Integer */);
        max_contribution?: number;
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
        electron_shading_enabled?: boolean;
        surface_shading_enabled?: boolean;
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
    }
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        pixel_alpha?: number;
        fog_start?: number;
        fog_thickness?: number;
    })
/**
 * Get the params of the current renderer
 */
async function getRendererParams(): Promise<API_getRendererParams_Return> {
    const out = await Scene.request("get-renderer-params", )
    return out as API_getRendererParams_Return
}
//==============================================
// "get-scene" - Get the current state of scene
//----------------------------------------------
export type API_getScene_Return = {
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
async function getScene(): Promise<API_getScene_Return> {
    const out = await Scene.request("get-scene", )
    return out as API_getScene_Return
}
//========================================================
// "get-statistics" - Get the current state of statistics
//--------------------------------------------------------
export type API_getStatistics_Return = {
    fps: number;
    scene_size_in_bytes: (number /* Integer */);
}
/**
 * Get the current state of statistics
 */
async function getStatistics(): Promise<API_getStatistics_Return> {
    const out = await Scene.request("get-statistics", )
    return out as API_getStatistics_Return
}
//======================================================================
// "get-volume-parameters" - Get the current state of volume-parameters
//----------------------------------------------------------------------
export type API_getVolumeParameters_Return = {
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
async function getVolumeParameters(): Promise<API_getVolumeParameters_Return> {
    const out = await Scene.request("get-volume-parameters", )
    return out as API_getVolumeParameters_Return
}
//====================================================
// "image-jpeg" - Get the current state of image-jpeg
//----------------------------------------------------
export type API_imageJpeg_Return = {
    data: string;
}
/**
 * Get the current state of image-jpeg
 */
async function imageJpeg(): Promise<API_imageJpeg_Return> {
    const out = await Scene.request("image-jpeg", )
    return out as API_imageJpeg_Return
}
//===============================================
// "inspect" - Inspect the scene at x-y position
//-----------------------------------------------
export type API_inspect_Param0 = [
    number,
    number
]
export type API_inspect_Return = {
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
async function inspect(position: API_inspect_Param0): Promise<API_inspect_Return> {
    const out = await Scene.request("inspect", position)
    return out as API_inspect_Return
}
//===================================================
// "loaders-schema" - Get the schema for all loaders
//---------------------------------------------------
export type API_loadersSchema_Return = {}[]
/**
 * Get the schema for all loaders
 */
async function loadersSchema(): Promise<API_loadersSchema_Return> {
    const out = await Scene.request("loaders-schema", )
    return out as API_loadersSchema_Return
}
//==================================================================
// "model-properties-schema" - Get the property schema of the model
//------------------------------------------------------------------
export type API_modelPropertiesSchema_Param0 = {
    id: (number /* Integer */);
}
export type API_modelPropertiesSchema_Return = string
/**
 * Get the property schema of the model
 */
async function modelPropertiesSchema(id: API_modelPropertiesSchema_Param0): Promise<API_modelPropertiesSchema_Return> {
    const out = await Scene.request("model-properties-schema", id)
    return out as API_modelPropertiesSchema_Return
}
//===============================
// "quit" - Quit the application
//-------------------------------
export type API_quit_Return = undefined
/**
 * Quit the application
 */
async function quit(): Promise<API_quit_Return> {
    const out = await Scene.request("quit", )
    return out as API_quit_Return
}
//===========================================================================
// "remove-clip-planes" - Remove clip planes from the scene given their gids
//---------------------------------------------------------------------------
export type API_removeClipPlanes_Param0 = (number /* Integer */)[]
export type API_removeClipPlanes_Return = boolean
/**
 * Remove clip planes from the scene given their gids
 */
async function removeClipPlanes(ids: API_removeClipPlanes_Param0): Promise<API_removeClipPlanes_Return> {
    const out = await Scene.request("remove-clip-planes", ids)
    return out as API_removeClipPlanes_Return
}
//================================================
// "remove-lights" - Remove light given their IDs
//------------------------------------------------
export type API_removeLights_Param0 = (number /* Integer */)[]
export type API_removeLights_Return = boolean
/**
 * Remove light given their IDs
 */
async function removeLights(ids: API_removeLights_Param0): Promise<API_removeLights_Return> {
    const out = await Scene.request("remove-lights", ids)
    return out as API_removeLights_Return
}
//==========================================================================
// "remove-model" - Remove the model(s) with the given ID(s) from the scene
//--------------------------------------------------------------------------
export type API_removeModel_Param0 = (number /* Integer */)[]
export type API_removeModel_Return = boolean
/**
 * Remove the model(s) with the given ID(s) from the scene
 */
async function removeModel(ids: API_removeModel_Param0): Promise<API_removeModel_Return> {
    const out = await Scene.request("remove-model", ids)
    return out as API_removeModel_Return
}
//==============================================================================================================================================
// "request-model-upload" - Request upload of blob to trigger adding of model after blob has been received; returns model descriptor on success
//----------------------------------------------------------------------------------------------------------------------------------------------
export type API_requestModelUpload_Param0 = {
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
export type API_requestModelUpload_Return = (
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
async function requestModelUpload(param: API_requestModelUpload_Param0): Promise<API_requestModelUpload_Return> {
    const out = await Scene.request("request-model-upload", param)
    return out as API_requestModelUpload_Return
}
//==========================================================
// "reset-camera" - Resets the camera to its initial values
//----------------------------------------------------------
export type API_resetCamera_Return = undefined
/**
 * Resets the camera to its initial values
 */
async function resetCamera(): Promise<API_resetCamera_Return> {
    const out = await Scene.request("reset-camera", )
    return out as API_resetCamera_Return
}
//=================================================
// "schema" - Get the schema of the given endpoint
//-------------------------------------------------
export type API_schema_Param0 = {
    endpoint: string;
}
export type API_schema_Return = string
/**
 * Get the schema of the given endpoint
 */
async function schema(endpoint: API_schema_Param0): Promise<API_schema_Return> {
    const out = await Scene.request("schema", endpoint)
    return out as API_schema_Return
}
//========================================================================
// "set-animation-parameters" - Set the new state of animation-parameters
//------------------------------------------------------------------------
export type API_setAnimationParameters_Param0 = {
    current?: (number /* Integer */);
    delta?: (number /* Integer */);
    dt?: number;
    frame_count?: (number /* Integer */);
    playing?: boolean;
    unit?: string;
}
export type API_setAnimationParameters_Return = boolean
/**
 * Set the new state of animation-parameters
 */
async function setAnimationParameters(param: API_setAnimationParameters_Param0): Promise<API_setAnimationParameters_Return> {
    const out = await Scene.request("set-animation-parameters", param)
    return out as API_setAnimationParameters_Return
}
//============================================================================
// "set-application-parameters" - Set the new state of application-parameters
//----------------------------------------------------------------------------
export type API_setApplicationParameters_Param0 = {
    engine?: string;
    image_stream_fps?: (number /* Integer */);
    jpeg_compression?: (number /* Integer */);
    viewport?: [
        number,
        number
    ];
}
export type API_setApplicationParameters_Return = boolean
/**
 * Set the new state of application-parameters
 */
async function setApplicationParameters(param: API_setApplicationParameters_Param0): Promise<API_setApplicationParameters_Return> {
    const out = await Scene.request("set-application-parameters", param)
    return out as API_setApplicationParameters_Return
}
//============================================
// "set-camera" - Set the new state of camera
//--------------------------------------------
export type API_setCamera_Param0 = {
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
export type API_setCamera_Return = boolean
/**
 * Set the new state of camera
 */
async function setCamera(param: API_setCamera_Param0): Promise<API_setCamera_Return> {
    const out = await Scene.request("set-camera", param)
    return out as API_setCamera_Return
}
//============================================================
// "set-camera-params" - Set the params on the current camera
//------------------------------------------------------------
export type API_setCameraParams_Param0 = (
    {
        height?: number;
        aspect?: number;
        enable_clipping_planes?: boolean;
    }
    | {}
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
    })
export type API_setCameraParams_Return = boolean
/**
 * Set the params on the current camera
 */
async function setCameraParams(input0: API_setCameraParams_Param0): Promise<API_setCameraParams_Return> {
    const out = await Scene.request("set-camera-params", input0)
    return out as API_setCameraParams_Return
}
//============================================================
// "set-environment-map" - Set a environment map in the scene
//------------------------------------------------------------
export type API_setEnvironmentMap_Param0 = {
    filename: string;
}
export type API_setEnvironmentMap_Return = boolean
/**
 * Set a environment map in the scene
 */
async function setEnvironmentMap(filename: API_setEnvironmentMap_Param0): Promise<API_setEnvironmentMap_Return> {
    const out = await Scene.request("set-environment-map", filename)
    return out as API_setEnvironmentMap_Return
}
//================================================================
// "set-model-properties" - Set the properties of the given model
//----------------------------------------------------------------
export type API_setModelProperties_Param0 = {
    id: (number /* Integer */);
    properties: {};
}
export type API_setModelProperties_Return = boolean
/**
 * Set the properties of the given model
 */
async function setModelProperties(param: API_setModelProperties_Param0): Promise<API_setModelProperties_Return> {
    const out = await Scene.request("set-model-properties", param)
    return out as API_setModelProperties_Return
}
//==============================================================================
// "set-model-transfer-function" - Set the transfer function of the given model
//------------------------------------------------------------------------------
export type API_setModelTransferFunction_Param0 = {
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
export type API_setModelTransferFunction_Return = boolean
/**
 * Set the transfer function of the given model
 */
async function setModelTransferFunction(param: API_setModelTransferFunction_Param0): Promise<API_setModelTransferFunction_Return> {
    const out = await Scene.request("set-model-transfer-function", param)
    return out as API_setModelTransferFunction_Return
}
//================================================
// "set-renderer" - Set the new state of renderer
//------------------------------------------------
export type API_setRenderer_Param0 = {
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
export type API_setRenderer_Return = boolean
/**
 * Set the new state of renderer
 */
async function setRenderer(param: API_setRenderer_Param0): Promise<API_setRenderer_Return> {
    const out = await Scene.request("set-renderer", param)
    return out as API_setRenderer_Return
}
//================================================================
// "set-renderer-params" - Set the params on the current renderer
//----------------------------------------------------------------
export type API_setRendererParams_Param0 = (
    {
        gi_distance?: number;
        gi_weight?: number;
        gi_samples?: (number /* Integer */);
        shadows?: number;
        soft_shadows?: number;
        sampling_threshold?: number;
        volume_specular_exponent?: number;
        volume_alpha_correction?: number;
        max_distance_to_secondary_model?: number;
        pixel_alpha?: number;
        fog_start?: number;
        fog_thickness?: number;
    }
    | {}
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        pixel_alpha?: number;
        fog_start?: number;
        fog_thickness?: number;
    }
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        pixel_alpha?: number;
        fog_start?: number;
        fog_thickness?: number;
        gi_distance?: number;
        gi_weight?: number;
        gi_softness?: number;
        gi_samples?: (number /* Integer */);
        tf_color?: boolean;
    }
    | {
        roulette_depth?: (number /* Integer */);
        max_contribution?: number;
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
        electron_shading_enabled?: boolean;
        surface_shading_enabled?: boolean;
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
    }
    | {
        alpha_correction?: number;
        simulation_threshold?: number;
        pixel_alpha?: number;
        fog_start?: number;
        fog_thickness?: number;
    })
export type API_setRendererParams_Return = boolean
/**
 * Set the params on the current renderer
 */
async function setRendererParams(input0: API_setRendererParams_Param0): Promise<API_setRendererParams_Return> {
    const out = await Scene.request("set-renderer-params", input0)
    return out as API_setRendererParams_Return
}
//==========================================
// "set-scene" - Set the new state of scene
//------------------------------------------
export type API_setScene_Param0 = {
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
export type API_setScene_Return = boolean
/**
 * Set the new state of scene
 */
async function setScene(param: API_setScene_Param0): Promise<API_setScene_Return> {
    const out = await Scene.request("set-scene", param)
    return out as API_setScene_Return
}
//==================================================================
// "set-volume-parameters" - Set the new state of volume-parameters
//------------------------------------------------------------------
export type API_setVolumeParameters_Param0 = {
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
export type API_setVolumeParameters_Return = boolean
/**
 * Set the new state of volume-parameters
 */
async function setVolumeParameters(param: API_setVolumeParameters_Param0): Promise<API_setVolumeParameters_Return> {
    const out = await Scene.request("set-volume-parameters", param)
    return out as API_setVolumeParameters_Return
}
//==================================================
// "snapshot" - Make a snapshot of the current view
//--------------------------------------------------
export type API_snapshot_Param0 = {
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
export type API_snapshot_Return = {
    data: string;
}
/**
 * Make a snapshot of the current view
 */
async function snapshot(settings: API_snapshot_Param0): Promise<API_snapshot_Return> {
    const out = await Scene.request("snapshot", settings)
    return out as API_snapshot_Return
}
//=======================================================================
// "update-clip-plane" - Update a clip plane with the given coefficients
//-----------------------------------------------------------------------
export type API_updateClipPlane_Param0 = {
    id: (number /* Integer */);
    plane: [
        number,
        number,
        number,
        number
    ];
}
export type API_updateClipPlane_Return = boolean
/**
 * Update a clip plane with the given coefficients
 */
async function updateClipPlane(clip_plane: API_updateClipPlane_Param0): Promise<API_updateClipPlane_Return> {
    const out = await Scene.request("update-clip-plane", clip_plane)
    return out as API_updateClipPlane_Return
}
//===============================================================
// "update-instance" - Update the instance with the given values
//---------------------------------------------------------------
export type API_updateInstance_Param0 = {
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
export type API_updateInstance_Return = boolean
/**
 * Update the instance with the given values
 */
async function updateInstance(model_instance: API_updateInstance_Param0): Promise<API_updateInstance_Return> {
    const out = await Scene.request("update-instance", model_instance)
    return out as API_updateInstance_Return
}
//=========================================================
// "update-model" - Update the model with the given values
//---------------------------------------------------------
export type API_updateModel_Param0 = {
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
export type API_updateModel_Return = boolean
/**
 * Update the model with the given values
 */
async function updateModel(model: API_updateModel_Param0): Promise<API_updateModel_Return> {
    const out = await Scene.request("update-model", model)
    return out as API_updateModel_Return
}
