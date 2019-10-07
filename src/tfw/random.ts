export default {
    pick, int, float
}


function pick(elements: any[]): any {
    return elements[int(elements.length)]
}


/**
 * Return an integer between `min` and `max - 1` included.
 * If `max` is undefined, return an integer betwee 0 and `min - 1`
 */
function int(min: number, max: number | undefined = undefined) {
    return Math.floor(float(min, max))
}


/**
 * Return a float between `min` and `max - 1` included.
 * If `max` is undefined, return a float betwee 0 and `min - 1`
 */
function float(min: number, max: number | undefined = undefined) {
    if (typeof max === 'undefined') {
        max = min;
        min = 0;
    }
    return min + Math.random() * (max - min)
}
