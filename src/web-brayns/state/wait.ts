import { IWait } from '../state/types'
import { IAction } from '../types'

const PREFIX = "wait:"


export default {
    INITIAL_STATE: {
        label: "Please wait...",
        progress: 0
    },

    reducer(state: IWait, action: IAction): IWait {
        const { type } = action;
        if (!type.startsWith(PREFIX)) return state;

        const command = action.type.substr(PREFIX.length);
        switch (command) {
            case "update": return update(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    update(label: string, progress: number): IAction {
        return { type: `${PREFIX}update`, label, progress };
    }
}


function update(state: IWait, action: IAction): IWait {
    return { ...state, label: action.label, progress: action.progress }
}
