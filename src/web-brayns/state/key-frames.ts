import { IAction, IKeyFrame } from "./types"

const PREFIX = "key-frames:"

export default {
    INITIAL_STATE: [],

    reducer(state: IKeyFrame[], action: IAction): IKeyFrame[] {
        const { type } = action;
        if (!type.startsWith(PREFIX)) return state;

        const command = action.type.substr(PREFIX.length);
        switch (command) {
            case "add": return add(state, action);
            case "remove": return remove(state, action);
            case "reset": return reset(state, action);
            case "update": return update(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    add(keyFrame: IKeyFrame): IAction {
        return { type: `${PREFIX}add`, keyFrame };
    },

    reset(keyFrames: IKeyFrame[]): IAction {
        return { type: `${PREFIX}reset`, keyFrames };
    },

    update(keyFrame: IKeyFrame): IAction {
        return { type: `${PREFIX}update`, keyFrame };
    },

    remove(id: number): IAction {
        return { type: `${PREFIX}remove`, id };
    }
}


function add(state: IKeyFrame[], action: IAction): IKeyFrame[] {
    const keyFrames = state.slice();
    const { keyFrame } = action
    ensureIndexIfDefined(keyFrame)
    keyFrames.push(action.keyFrame);
    return keyFrames;
}

/**
 * This function seem complicated, but it aism to remove doubles.
 * It's strange but its true thay Brayns can return doubles when you call "get-scene".
 */
function reset(state: IKeyFrame[], action: IAction): IKeyFrame[] {
    return action.keyFrames.slice();
}


function update(state: IKeyFrame[], action: IAction): IKeyFrame[] {
    const { keyFrame } = action;
    ensureIndexIfDefined(keyFrame)
    const keyFrames = state.filter((kf: IKeyFrame) => kf.index !== keyFrame.index);
    keyFrames.push(keyFrame);
    return keyFrames;
}

function remove(state: IKeyFrame[], action: IAction): IKeyFrame[] {
    const { index } = action;
    const keyFrames = state.filter((kf: IKeyFrame) => kf.index !== index);
    return keyFrames;
}

function ensureIndexIfDefined(keyFrame: IKeyFrame) {
    if (typeof keyFrame.index !== 'number') {
        throw Error("KeyFrame must have an index! " + JSON.stringify(keyFrame))
    }
}
