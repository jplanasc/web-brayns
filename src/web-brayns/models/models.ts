import { IBounds, IModel, IBraynsModel } from './types'
import State from '../state'

export default {
    createModelFromBraynsData,
    getAllModels,
    getModelsBounds,
    getVisibleModels
}


/**
 * web-brayns models have more data than Brayns one.
 * This function will enrich data from Brayns to met our needs.
 */
function createModelFromBraynsData(model: IBraynsModel): IModel {
    return {
        brayns: { ...model },
        parent: 0,
        deleted: false,
        selected: false,
        technical: false
    }
}


/**
 * Compute the bounds of deveral models.
 */
function getModelsBounds(models: IModel[]): IBounds {
    const point: IBounds = { min: [-10,-10,-10], max: [10,10,10] }
    const modelsWithValidBounds = models.filter(hasValidBounds)
    if (modelsWithValidBounds.length === 0) return point;
    const bounds = { ...modelsWithValidBounds[0].brayns.bounds };

    for( let i=1; i<modelsWithValidBounds.length; i++ ) {
        const model = modelsWithValidBounds[i];
        const b = model.brayns.bounds || point;
        bounds.min[0] = Math.min(bounds.min[0], b.min[0]);
        bounds.min[1] = Math.min(bounds.min[1], b.min[1]);
        bounds.min[2] = Math.min(bounds.min[2], b.min[2]);
        bounds.max[0] = Math.max(bounds.max[0], b.max[0]);
        bounds.max[1] = Math.max(bounds.max[1], b.max[1]);
        bounds.max[2] = Math.max(bounds.max[2], b.max[2]);
    }
    return bounds;
}


function getVisibleModels(): IModel[] {
    return getAllModels().filter((model: IModel) => (
        // Most of the technical models' name start with a "/".
        model.brayns.name.charAt(0) !== '/' &&
        model.deleted === false &&
        model.technical === false &&
        model.brayns.visible === true
    ));
}


function getAllModels(): IModel[] {
    return State.store.getState().models;
}



function hasValidBounds(model: IModel): boolean {
    if (!model.brayns) return false;
    if (!model.brayns.bounds) return false;
    const bounds = model.brayns.bounds;
    if (bounds.min[0] > bounds.max[0]) return false;
    if (bounds.min[1] > bounds.max[1]) return false;
    if (bounds.min[2] > bounds.max[2]) return false;
    return true;
}
