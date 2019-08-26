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
            case "reset": return reset(state, action);
            case "update": return update(state, action);
            default: throw Error(`Unknown action "${type}"!`);
        }
    },

    add(model: IModel): IAction {
        return { type: `${PREFIX}add`, model };
    },

    reset(models: IModel[]): IAction {
        return { type: `${PREFIX}reset`, models };
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

/**
 * This function seem complicated, but it aism to remove doubles.
 * It's strange but its true thay Brayns can return doubles when you call "get-scene".
 */
function reset(state: IModel[], action: IAction): IModel[] {
    const alreadyAddedIds: number[] = [];
    const models = action.models.filter( (model: {id: number}) => {
        const id = model.id;
        const alreadyHere = alreadyAddedIds.includes(id);
        if (alreadyHere) return false;
        alreadyAddedIds.push(id);
        return true;
    });
    return models;
}


function update(state: IModel[], action: IAction): IModel[] {
    const { model } = action;
    const models = state.filter((m: IModel) => m.brayns.id !== model.brayns.id);
    models.push(model);
    return models;
}
