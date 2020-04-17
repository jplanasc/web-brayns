export interface IBounds {
    min: [number, number, number],
    max: [number, number, number]
}

export interface IBraynsModel {
    bounding_box?: boolean;
    bounds: {
        max: [
            number,
            number,
            number
        ];
        min: [
            number,
            number,
            number
        ];
    };
    id: (number /* Integer */);
    metadata?: { [key: string]: any }
    name: string;
    path?: string;
    transformation: {
        rotation: [
            number,
            number,
            number,
            number
        ];
        rotation_center?: [
            number,
            number,
            number
        ];
        scale: [
            number,
            number,
            number
        ];
        translation: [
            number,
            number,
            number
        ];
    };
    visible?: boolean;
}

export interface IModelOptions {
    brayns?: Partial<IBraynsModel>,
    parent?: number,
    deleted?: boolean,
    selected?: boolean,
    // Some models are technical. They must not appear on any snapshot.
    technical?: boolean
}

export interface IModel {
    brayns: IBraynsModel,
    parent: number,
    deleted: boolean,
    selected: boolean,
    // Some models are technical. They must not appear on any snapshot.
    technical: boolean,
    materialIds: number[]
}
