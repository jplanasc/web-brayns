import Scene from '../../scene'
import Registry, { IRegistry, ISchema } from './registry'
import Storage from './registry-storage'

let globalRegistry: Registry | null = null

async function loadRegistry(): Promise<IRegistry> {
    try {
        const url = `http://${Scene.host}/registry`
        const response = await fetch(url)
        const data = await response.json()
        const schemas: IRegistry = {}
        for (const entryPointName of Object.keys(data)) {
            if (!entryPointName.endsWith("/schema")) continue
            const name = entryPointName.substr(0, entryPointName.length - "/schema".length)
            const urlSchema = `http://${Scene.host}/${entryPointName}`
            try {
                const responseSchema = await fetch(urlSchema)
                const dataSchema = await responseSchema.json()
                schemas[name] = dataSchema
            } catch (ex) {
                throw Error(`Unable to fetch "${urlSchema}":\n${ex}`)
            }
        }
        return schemas
    }
    catch (ex) {
        console.error("Error in web-brayns/service/registry/registry-service/loadRegistry: ", ex)
        throw ex
    }

}

async function getRegistry(): Promise<Registry> {
    if (globalRegistry) return globalRegistry
    loadRegistry().then(schemas => {
        Storage.set(schemas)
        globalRegistry = new Registry(schemas)
    })
    const schemas = Storage.get()
    if (!schemas) {
        const registry = new Registry(await loadRegistry())
        globalRegistry = registry
        return registry
    }
    const registry = new Registry(schemas)
    globalRegistry = registry
    return registry
}


export default {
    async listEntryPoints(): Promise<string[]> {
        const registry = await getRegistry()
        return registry.entryPoints
    },

    async exists(entryPointName: string): Promise<boolean> {
        const registry = await getRegistry()
        return registry.exists(entryPointName)
    },

    async getEntryPointSchema(entryPointName: string): Promise<ISchema> {
        const registry = await getRegistry()
        return registry.getEntryPointSchema(entryPointName)
    },

    async getEntryPointMarkdownDoc(entryPointName: string): Promise<string[]> {
        const registry = await getRegistry()
        return registry.getMarkdown(entryPointName)
    }
}
