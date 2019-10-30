import { IStatistics, IAction } from '../types'

const PREFIX = "statistics:"


export default {
    INITIAL_STATE: {
        fps: 0,
        sceneSizeInBytes: 0
    },

    reducer(state: IStatistics, action: IAction): IStatistics {
        const { type } = action;
        if (!type.startsWith(PREFIX)) return state;

        const command = action.type.substr(PREFIX.length);
        switch (command) {
            case "update": return update(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    update(animation: Partial<IStatistics>): IAction {
        return { type: `${PREFIX}update`, animation };
    }
}


function update(state: IStatistics, action: IAction): IStatistics {
    return Object.assign( state, action.animation );
}
