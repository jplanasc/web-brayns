export default {
    padNumber(value: number, size: number = 6, fillWith: string = '0'): string {
        let text = `${value}`;
        while (text.length < size) {
            text = fillWith.charAt(0) + text;
        }
        return text;
    },

    clamp(value: number, min: number = 0, max: number = 1) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }
}
