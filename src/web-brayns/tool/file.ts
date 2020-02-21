export default {
    readData,
    readText,
    readCSV
}


async function readCSV(file: File): Promise<Array<string[]>> {
    try {
        const text = await readText(file)
        const rows = text.split(/[\n\r]+/)
        const filteredRows = rows
            .map(row => row.trim())
            .filter(row => row.length > 0)

        if (filteredRows.length === 0) return []

        const firstRow = filteredRows[0]
        const separators = [',', ';', '\t', '|', '/']
        const candidates: Array<[string, number]> = separators
            .map(sep => [sep, firstRow.split(sep).length])
        candidates.sort((a, b) => b[1] - a[1])
        // The best separator is the one that splits the most.
        const separator = candidates[0][0]

        return filteredRows
            .map( row => row.split(separator).map(item => item.trim()))
    } catch (ex) {
        console.error(ex)
        console.info("file=", file)
        throw ex
    }
}


async function readText(file: File) {
    try {
        const data = await readData(file)
        const decoder = new TextDecoder('utf-8')
        const text = decoder.decode(data)
        return text
    } catch (ex) {
        console.error(ex)
        console.info("file=", file)
        throw ex
    }
}

async function readData(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (evt) => {
            try {
                if (!evt || !evt.target) return
                const data = evt.target.result as ArrayBuffer
                console.info("data=", data);
                resolve(data)
            } catch (ex) {
                reject(ex)
            }
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
    })
}
