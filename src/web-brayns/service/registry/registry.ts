interface IRegistry {
    [key: string]: ISchema
}

interface ISchema {

}

export default class Registry {
    constructor(readonly registry: IRegistry) {
        console.info("registry=", registry)
    }

    get entryPoints(): string[] {
        const entryPoints: string[] = Object.keys(this.registry)
        entryPoints.sort()
        return entryPoints
    }
}
