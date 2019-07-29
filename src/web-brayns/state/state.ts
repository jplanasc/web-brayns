/**
 * The full state of the application is stored and managed here.
 */
import { createStore } from 'redux'
import { IAppState, IAction } from "../types"

import Models from "./models"
import Navigation from './navigation'
import Slicer from './slicer'
import Dialogs from './dialogs'


const INITIAL_STATE: IAppState = {
    dialogs: Dialogs.INITIAL_STATE,
    models: Models.INITIAL_STATE,
    navigation: Navigation.INITIAL_STATE,
    slicer: Slicer.INITIAL_STATE
};

function reducer(state: IAppState | undefined = INITIAL_STATE, action: IAction): IAppState {
    return {
        dialogs: Dialogs.reducer(state.dialogs, action),
        models: Models.reducer(state.models, action),
        navigation: Navigation.reducer(state.navigation, action),
        slicer: Slicer.reducer(state.slicer, action)
    };
}

const store = createStore(reducer);
export default {
    store, dispatch: store.dispatch,
    Dialogs,
    Models,
    Navigation,
    Slicer
};


console.info("INITIAL_STATE.dialogs=", INITIAL_STATE.dialogs);
