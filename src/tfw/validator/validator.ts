export default {
    isFloat, isInteger
}

function isFloat(v: string): boolean {
    return !isNaN(parseFloat(v))
}

function isInteger(v: string): boolean {
    return !isNaN(parseInt(v))
}
