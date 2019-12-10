/**
 * Circuits queryings.
 */
import Scene from '../../scene'
import castInteger from '../../../tfw/converter/integer'

export default {
    listGIDs, listReports, listTargets,
    getAfferentGIDs, getEfferentGIDs, getProjectionGIDs
}

/**
 * Return a list of cells IDs given a list of targets.
 */
async function listGIDs(circuitPath: string, targets: string[] = []): Promise<(number|BigInt)[]> {
    const result = (await Scene.request("ci-get-cell-ids", {
        path: circuitPath, targets
    })) as { ids: number[] }
    if (Array.isArray(result.ids)) {
        return result.ids.map(castInteger)
    }
    throw result
}

/**
 * Return a list of reports provided by this circuit.
 * Can be an empty array if the circuit has no simulation embeded.
 */
async function listReports(circuitPath: string): Promise<string[]> {
    const result = (await Scene.request("ci-get-reports", {
        path: circuitPath
    })) as { reports: string[] }
    if (Array.isArray(result.reports)) {
        return result.reports
    }
    throw result
}

/**
 * Return a list of targets provided by this circuit.
 */
async function listTargets(circuitPath: string): Promise<string[]> {
    const result = (await Scene.request("ci-get-targets", {
        path: circuitPath
    })) as { targets: string[] }
    if (Array.isArray(result.targets)) {
        return result.targets
    }
    throw result
}

/**
 * Return a list of IDs of cells that reach for the `sourcesGIDs`.
 */
async function getAfferentGIDs(circuitPath: string, sourcesGIDs: (number|BigInt)[]): Promise<(number|BigInt)[]> {
    const result = (await Scene.request("ci-get-afferent-cell-ids", {
        path: circuitPath, sources: sourcesGIDs
    })) as { ids: string[] }
    if (Array.isArray(result.ids)) {
        return result.ids.map(castInteger)
    }
    throw result
}

/**
 * Return a list of IDs of cells that are reached by the `sourcesGIDs`.
 */
async function getEfferentGIDs(circuitPath: string, sourcesGIDs: (number|BigInt)[]): Promise<(number|BigInt)[]> {
    const result = (await Scene.request("ci-get-efferent-cell-ids", {
        path: circuitPath, sources: sourcesGIDs
    })) as { ids: string[] }
    if (Array.isArray(result.ids)) {
        return result.ids.map(castInteger)
    }
    throw result
}

async function getProjectionGIDs(circuitPath: string,
                                 sourcesGIDs: (number|BigInt)[],
                                 projection: string) {
    const result = (await Scene.request("ci-get-projection-efferent-cell-ids", {
        path: circuitPath, sources: sourcesGIDs, projection
    })) as { ids: string[] }
    if (Array.isArray(result.ids)) {
        return result.ids.map(castInteger)
    }
    throw result
}

export interface IReport {
    name: string,
    target: string
}

export interface ICircuitSection {
    type: string,
    name: string,
    properties: { [key: string]: string }
}
