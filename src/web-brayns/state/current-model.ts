import { IModel, IAction } from "../types"

const PREFIX = "current-model:"

export default {
    INITIAL_STATE: {
        brayns: {
            id: -1,
            name: "",
            path: "",
            bounds: { max: [0,0,0], min: [0,0,0] },
            transformation: {
                rotation: [0,0,0,1],
                scale: [1,1,1],
                translation: [0,0,0]
            }
        },
        parent: -1,
        deleted: false,
        selected: false,
        technical: false,
        materialIds: []
    },

    reducer(state: IModel, action: IAction): IModel {
        const { type } = action;
        if (!type.startsWith(PREFIX)) return state;

        const command = action.type.substr(PREFIX.length);
        switch (command) {
            case "reset": return reset(state, action);
            case "update": return update(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    reset(model: IModel): IAction {
        return { type: `${PREFIX}reset`, model };
    },

    update(model: IModel): IAction {
        return { type: `${PREFIX}update`, model };
    }
}


function reset(state: IModel, action: IAction): IModel {
    return { ...action.model }
}


function update(state: IModel, action: IAction): IModel {
    return { state, ...action.model }
}
