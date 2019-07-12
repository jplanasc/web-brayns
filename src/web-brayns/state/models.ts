import { IModel, IAction } from "../types"

const PREFIX = "models:"

export default {
    INITIAL_STATE: [],

    reducer(state: IModel[], action: IAction): IModel[] {
        const { type } = action;
        if (!type.startsWith(PREFIX)) return state;

        const command = action.type.substr(PREFIX.length);
        switch (command) {
            case "add": return add(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    add(model: IModel): IAction {
        return { type: `${PREFIX}add`, model };
    }
}


function add(state: IModel[], action: IAction): IModel[] {
    const models = state.slice();
    models.push(action.model);
    return models;
}
