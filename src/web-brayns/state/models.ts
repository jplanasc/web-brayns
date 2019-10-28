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
            case "remove": return remove(state, action);
            case "reset": return reset(action);
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
    },

    remove(id: number): IAction {
        return { type: `${PREFIX}remove`, id };
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
function reset(action: IAction): IModel[] {
    const alreadyAddedIds: Set<number> = new Set();
    const models = action.models.filter( (model: { brayns: {id: number}}) => {
        console.info("model=", model);
        const id = model.brayns.id;
        const alreadyHere = alreadyAddedIds.has(id);
        if (alreadyHere) return false;
        alreadyAddedIds.add(id);
        return true;
    });
    console.info("filtered models=", models);
    return models;
}


function update(state: IModel[], action: IAction): IModel[] {
    const { model } = action;
    const models = state.filter((m: IModel) => m.brayns.id !== model.brayns.id);
    models.push(model);
    return models;
}

function remove(state: IModel[], action: IAction): IModel[] {
    const { id } = action;
    const models = state.filter((m: IModel) => m.brayns.id !== id);
    return models;
}
