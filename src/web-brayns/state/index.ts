/**
 * The full state of the application is stored and managed here.
 */
import { createStore } from 'redux'
import { IAppState } from "../types"

import Models from "./models"

const INITIAL_STATE: IAppState = {
    models: Models.INITIAL_STATE
};

function reducer(state: IAppState | undefined = INITIAL_STATE, action: IAction): IAppState {
    return {
        models: Models.reducer(state.models, action)
    };
}

const store = createStore(reducer);
export default {
    store, dispatch: store.dispatch,
    Models
};
