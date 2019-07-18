import { IBounds, IModel, IBraynsModel } from './types'

export default {
    createModelFromBraynsData,
    getModelsBounds
}


/**
 * web-brayns models have more data than Brayns one.
 * This function will enrich data from Brayns to met our needs.
 */
function createModelFromBraynsData(model: IBraynsModel): IModel {
    return {
        brayns: Object.assign({}, model),
        parent: 0,
        deleted: false,
        selected: false
    }
}


/**
 * Compute the bounds of deveral models.
 */
function getModelsBounds(models: IModel[]): IBounds {
    const point: IBounds = { min: [0,0,0], max: [0,0,0] }
    if (models.length === 0) return point;
    const bounds = models[0].brayns.bounds || point;

    for( let i=1; i<models.length; i++ ) {
        const model = models[i];
        if (!model.brayns.visible) continue;
        const b = model.brayns.bounds || point;
        bounds.min[0] = Math.min(bounds.min[0], b.min[0]);
        bounds.min[1] = Math.min(bounds.min[0], b.min[1]);
        bounds.min[2] = Math.min(bounds.min[0], b.min[2]);
        bounds.max[0] = Math.max(bounds.max[0], b.max[0]);
        bounds.max[1] = Math.max(bounds.max[0], b.max[1]);
        bounds.max[2] = Math.max(bounds.max[0], b.max[2]);
    }
    return bounds;
}
