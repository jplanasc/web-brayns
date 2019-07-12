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
            case "update": return update(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    add(model: IModel): IAction {
        return { type: `${PREFIX}add`, model };
    },

    update(model: IModel): IAction {
        return { type: `${PREFIX}update`, model };
    }
}


function add(state: IModel[], action: IAction): IModel[] {
    const models = state.slice();
    models.push(action.model);
    return models;
}

function update(state: IModel[], action: IAction): IModel[] {
    const { model } = action;
    const models = state.filter((m: IModel) => m.id !== model.id);
    models.push(model);
    return models;
}
