/**
 * The full state of the application is stored and managed here.
 */
import { createStore } from 'redux'
import { IAppState, IAction } from "../types"

import Animation from './animation'
import Dialogs from './dialogs'
import Models from "./models"
import Navigation from './navigation'
import Path from './path'
import Slicer from './slicer'


const INITIAL_STATE: IAppState = {
    animation: Animation.INITIAL_STATE,
    dialogs: Dialogs.INITIAL_STATE,
    models: Models.INITIAL_STATE,
    navigation: Navigation.INITIAL_STATE,
    path: Path.INITIAL_STATE,
    slicer: Slicer.INITIAL_STATE
};

function reducer(state: IAppState | undefined = INITIAL_STATE, action: IAction): IAppState {
    return {
        animation: Animation.reducer(state.animation, action),
        dialogs: Dialogs.reducer(state.dialogs, action),
        models: Models.reducer(state.models, action),
        navigation: Navigation.reducer(state.navigation, action),
        path: Path.reducer(state.path, action),
        slicer: Slicer.reducer(state.slicer, action)
    };
}

const store = createStore(reducer);
export default {
    store, dispatch: store.dispatch,
    Animation,
    Dialogs,
    Models,
    Navigation,
    Path,
    Slicer
};


console.info("INITIAL_STATE.dialogs=", INITIAL_STATE.dialogs);
