/**
 * The full state of the application is stored and managed here.
 */
import { createStore } from 'redux'
import { IAppState, IAction } from "../types"

import Animation from './animation'
import Camera from './camera'
import CurrentModel from './current-model'
import Dialogs from './dialogs'
import KeyFrames from './key-frames'
import Models from "./models"
import Navigation from './navigation'
import Path from './path'
import Slicer from './slicer'
import Statistics from './statistics'
import Wait from './wait'


const INITIAL_STATE: IAppState = {
    animation: Animation.INITIAL_STATE,
    camera: Camera.INITIAL_STATE,
    currentModel: CurrentModel.INITIAL_STATE,
    dialogs: Dialogs.INITIAL_STATE,
    keyFrames: KeyFrames.INITIAL_STATE,
    models: Models.INITIAL_STATE,
    navigation: Navigation.INITIAL_STATE,
    path: Path.INITIAL_STATE,
    slicer: Slicer.INITIAL_STATE,
    statistics: Statistics.INITIAL_STATE,
    wait: Wait.INITIAL_STATE
};

function reducer(state: IAppState | undefined = INITIAL_STATE, action: IAction): IAppState {
    return {
        animation: Animation.reducer(state.animation, action),
        camera: Camera.reducer(state.camera, action),
        currentModel: CurrentModel.reducer(state.currentModel, action),
        dialogs: Dialogs.reducer(state.dialogs, action),
        keyFrames: KeyFrames.reducer(state.keyFrames, action),
        models: Models.reducer(state.models, action),
        navigation: Navigation.reducer(state.navigation, action),
        path: Path.reducer(state.path, action),
        slicer: Slicer.reducer(state.slicer, action),
        statistics: Statistics.reducer(state.statistics, action),
        wait: Wait.reducer(state.wait, action)
    };
}

const store = createStore(reducer);
export default {
    store, dispatch: store.dispatch,
    Animation,
    Camera,
    CurrentModel,
    Dialogs,
    Models,
    Navigation,
    Path,
    Slicer,
    Statistics,
    Wait
};
