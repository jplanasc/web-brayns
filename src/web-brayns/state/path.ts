import { IAction, IPathState } from "../types"

const PREFIX = "path:"

export default {
    INITIAL_STATE: {
        path: "",
        root: "",
        files: [],
        folders: []
    },

    reducer(state: IPathState, action: IAction): IPathState {
        const { type } = action;
        if (!type.startsWith(PREFIX)) return state;

        const command = action.type.substr(PREFIX.length);
        switch (command) {
            case "update": return update(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    update(state: Partial<IPathState>): IAction {
        return { type: `${PREFIX}update`, state };
    }
}


function update(state: IPathState, action: IAction): IPathState {
    return { ...state, ...action.state }
}
