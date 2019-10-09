import Storage from '../tfw/storage'

export default {
    get(key: string, defaultValue: any) {
        return Storage.local.get(prefix(key), defaultValue)
    },
    set(key: string, value: any) {
        return Storage.local.set(prefix(key), value)
    }
}

function prefix(key: string) {
    return `web-brayns::${key}`
}
