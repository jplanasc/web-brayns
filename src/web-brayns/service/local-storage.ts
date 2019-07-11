import Storage from '../../tfw/storage'

export default class localStorage {
    constructor(private prefix: string = '') {}

    get(key: string, defaultValue: any): any {
        return Storage.local.get(this.key(key), defaultValue);
    }

    set(key: string, val: any) {
        Storage.local.set(this.key(key), val);
    }

    private key(key: string): string {
        if (this.prefix.length === 0) return key;
        return `${this.prefix}:\t${key}`;
    }
}
