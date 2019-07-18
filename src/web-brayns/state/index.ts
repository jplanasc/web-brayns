/**
 * The full state of the application is stored and managed here.
 */
import { createStore } from 'redux'
import { IAppState, IAction } from "../types"

import Models from "./models"
import Navigation from './navigation'


const INITIAL_STATE: IAppState = {
    models: Models.INITIAL_STATE,
    navigation: Navigation.INITIAL_STATE
};

function reducer(state: IAppState | undefined = INITIAL_STATE, action: IAction): IAppState {
    return {
        models: Models.reducer(state.models, action),
        navigation: Navigation.reducer(state.navigation, action)
    };
}

const store = createStore(reducer);
export default {
    store, dispatch: store.dispatch,
    Models,
    Navigation
};
