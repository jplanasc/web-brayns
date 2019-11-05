export default {
    /**
     * Return a string of the form "1' 07.32''" which means 1 minute and 7.32 seconds.
     */
    time(seconds: number) {
        const sec = seconds % 60
        const min = Math.floor((seconds - sec) / 60)
        return `${min}' ${sec.toFixed(2)}''`
    }
}
