import FS from './fs'

export interface IReport {
    name: string,
    target: string
}

export interface ICircuitSection {
    type: string,
    name: string,
    properties: { [key: string]: string }
}

export default {
    parseCircuitFromFile, parseCircuitFromText
}


async function parseCircuitFromFile(path: string): Promise<ICircuitSection[]> {
    const result = await FS.getContent( path )

    console.info("result=", result);
    if (typeof result !== 'string') {
        throw result
    }
    const circuitContent: string = result
    return parseCircuitFromText(circuitContent)
}

function parseCircuitFromText(circuitContent: string): ICircuitSection[] {
    const circuit: ICircuitSection[] = []
    let currentSection: ICircuitSection = { type: '', name: '', properties: {} }
    // outside of a section?
    let outside = true
    let lineNumber = 0

    const lines = circuitContent.split("\n")
    for (const line of lines) {
        lineNumber++
        const trimedLine = line.trim()
        if (trimedLine.charAt(0) === '{') {
            if (!outside) {
                throw Error(`Unexpected "{" at line ${lineNumber}!`)
            }
            outside = false
            continue
        }
        if (trimedLine.charAt(0) === '}') {
            if (outside) {
                throw Error(`Unexpected "}" at line ${lineNumber}!`)
            }
            outside = true
            continue
        }

        const { key, val } = parseProp(trimedLine)
        if (key.length === 0) continue

        if (outside) {
            currentSection = { type: key, name: val, properties: {} }
            circuit.push(currentSection)
        } else {
            currentSection.properties[key] = val
        }
    }

    return circuit
}


function parseProp(text: string): { key: string, val: string } {
    let spcPos = text.indexOf(' ')
    let tabPos = text.indexOf('\t')
    if (spcPos < 0) spcPos = text.length
    if (tabPos < 0) tabPos = text.length
    const pos = Math.min(spcPos, tabPos)
    return {
        key: text.substr(0, pos).trim(),
        val: text.substr(pos).trim()
    }
}
