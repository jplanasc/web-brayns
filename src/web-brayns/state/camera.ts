import { IAction, ICameraState } from "../types"

const PREFIX = "camera:"

export default {
    INITIAL_STATE: {
        current: "",
        types: []
    },

    reducer(state: ICameraState, action: IAction): ICameraState {
        const { type } = action;
        if (!type.startsWith(PREFIX)) return state;

        const command = action.type.substr(PREFIX.length);
        switch (command) {
            case "update": return update(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    update(state: Partial<ICameraState>): IAction {
        return { type: `${PREFIX}update`, state };
    }
}


function update(state: ICameraState, action: IAction): ICameraState {
    return { ...state, ...action.state }
}
