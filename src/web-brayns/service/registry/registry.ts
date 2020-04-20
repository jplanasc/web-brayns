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
        const param = schema.params[0]
        const doc: string[] = []
        doc.push(
            `# ${schema.title}\n`,
            `${schema.description}  \n\n`
        )
        if (param) {
            const requiredPropNames = Object.keys(param.properties)
                .filter((propName: string) => param.required.indexOf(propName) !== -1)
            const optionalPropNames = Object.keys(param.properties)
                .filter((propName: string) => param.required.indexOf(propName) === -1)
            doc.push(
                "## Params\n\n",
                `${param.description}\n`
            )
            if (requiredPropNames.length > 0) {
                doc.push(
                    "\n### Required\n\n",
                    ...(requiredPropNames.map((propName: string) => {
                        const propValue = param.properties[propName]
                        return `* __\`${propName}\`__: ${JSON.stringify(propValue.type)}\n`
                    }))
                )
            }
            if (optionalPropNames.length > 0) {
                doc.push(
                    "\n### Optional\n\n",
                    ...(optionalPropNames.map((propName: string) => {
                        const propValue = param.properties[propName]
                        return `* __\`${propName}\`__: ${JSON.stringify(propValue.type)}\n`
                    }))
                )
            }
        }
        return doc
    }
}
