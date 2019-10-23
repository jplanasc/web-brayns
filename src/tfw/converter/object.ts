export default function castObject(v: any, defaultValue: {} = {}): {} {
    if (typeof v !== 'object') return defaultValue;
    if (Array.isArray(v)) return defaultValue;
    return v;
}
