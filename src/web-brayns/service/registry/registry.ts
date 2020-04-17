export interface IRegistry {
    [key: string]: ISchema
}

export interface ISchema {
    async: boolean
    description: string
    params: [{
        [key: string]: IParam
    }]
    returns: IType
    title: string
}

type IType = IBaseType | ITypeOneOf | ITypeAnyOf

interface IBaseType {
    type: "object" | "string" | "integer" | "array" | "number" | "boolean"
}

interface IParam extends IBaseType {
    name: string
    description: string
}

interface IOptionType extends IBaseType {
    title: string
}

interface ITypeOneOf {
    oneOf: IOptionType[]
}

interface ITypeAnyOf {
    anyOf: IType[]
}

interface ITypeArray extends IBaseType {
    type: "array"
    minItems: number
    maxItems: number
    items: IType
}

interface ITypeObject extends IBaseType {
    type: "object"
    required: string[]
    properties: {
        [key: string]: IType
    }
}

interface ITypeString extends IBaseType {
    type: "string"
}

interface ITypeInteger extends IBaseType {
    type: "integer"
    minimum: number
    maximum: number
}

interface ITypeNumber extends IBaseType {
    type: "number"
}

interface ITypeBoolean extends IBaseType {
    type: "boolean"
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

    exists(entryPointName: string): boolean {
        return typeof this.registry[entryPointName] !== 'undefined'
    }

    getEntryPointSchema(entryPointName: string): ISchema {
        console.info(`this.registry["${entryPointName}"]=`, this.registry[entryPointName])
        return this.registry[entryPointName]
    }

    getMarkdown(entryPointName: string): string[] {
        const schema = this.getEntryPointSchema(entryPointName)
        const doc: string[] = []

        return doc
    }
}
