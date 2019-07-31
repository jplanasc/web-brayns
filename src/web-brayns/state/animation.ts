import { IAnimation, IAction } from '../types'

const PREFIX = "animation:"


export default {
    INITIAL_STATE: {
        current: 0,
        delta: 1,
        dt: 1,
        frameCount: 0,
        playing: false,
        unit: ''
    },

    reducer(state: IAnimation, action: IAction): IAnimation {
        const { type } = action;
        if (!type.startsWith(PREFIX)) return state;

        const command = action.type.substr(PREFIX.length);
        switch (command) {
            case "update": return update(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    update(animation: Partial<IAnimation>): IAction {
        return { type: `${PREFIX}update`, animation };
    }
}


function update(state: IAnimation, action: IAction): IAnimation {
    return Object.assign( state, action.animation );
}
