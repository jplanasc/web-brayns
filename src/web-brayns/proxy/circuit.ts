/**
 * Represent a circuit.
 */
import CircuitService from '../service/circuit'

export class Circuit {
    readonly path: string
    readonly targetsPromise: Promise<string[]>

    constructor(path: string) {
        this.path = path
        this.targetsPromise = CircuitService.listTargets(path)
    }
}

const CIRCUITS = new Map<string, Circuit>()

export default {
    create(path: string): Circuit {
        if (CIRCUITS.has(path)) {
            const cachedCircuit = CIRCUITS.get(path)
            if (!cachedCircuit) throw Error("Problem!")
            return cachedCircuit
        }
        const circuit = new Circuit(path)
        CIRCUITS.set(path, circuit)
        return circuit
    }
}
