import { ISlicerState, IAction } from '../types'

const PREFIX = "slicer:"

export default {
    INITIAL_STATE: {
        activated: false,
        minX: 0,
        maxX: 1,
        minY: 0,
        maxY: 1,
        minZ: 0,
        maxZ: 1
    },

    reducer(state: ISlicerState, action: IAction): ISlicerState {
        const { type } = action;
        if (!type.startsWith(PREFIX)) return state;

        const command = action.type.substr(PREFIX.length);
        switch (command) {
            case "update": return update(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    update(sliceInfo: Partial<ISlicerState>): IAction {
        return { type: `${PREFIX}update`, sliceInfo };
    }
}


function update(state: ISlicerState, action: IAction): ISlicerState {
    return Object.assign( state, action.sliceInfo );
}
