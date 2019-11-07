export default { sleep }

/**
 * Resolve after the specified number of `milliseconds`.
 */
function sleep(milliseconds: number) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds))
}
