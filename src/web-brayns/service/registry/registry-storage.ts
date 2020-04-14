import Tfw from 'tfw'

const Storage = new Tfw.Storage.PrefixedLocalStorage("brayns/registry")

export default {
    get() { return Storage.get("schemas", null) },
    set(registry: any) { Storage.set("schemas", registry) }
}
