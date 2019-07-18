import { IBounds, IModel } from './types'

export default {
    getModelsBounds
}


function getModelsBounds(models: IModel[]): IBounds {
    const point: IBounds = { min: [0,0,0], max: [0,0,0] }
    if (models.length === 0) return point;
    const bounds = models[0].brayns.bounds || point;

    for( let i=1; i<models.length; i++ ) {
        const model = models[i];
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
