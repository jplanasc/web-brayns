/**
 * Communication to Brayns service is made through WebSocket.
 */
import Listeners from '../../tfw/listeners'

interface IQuery {
    id: string,
    resolve: (data: {}) => void
}

interface IQueries {
    [key: string]: IQuery
}

type TReadyListener = (ready: boolean) => void
type TUpdateListener = (method: string, params: {}) => void
type TBinaryListener = (data: any) => void

export default class BraynsService {
    debug: boolean = false
    private ws: WebSocket | undefined
    private autogeneratedId: number = 1
    private queries: IQueries = {}
    readonly readyListeners: Listeners<TReadyListener> = new Listeners<TReadyListener>()
    readonly updateListeners: Listeners<TUpdateListener> = new Listeners<TUpdateListener>()
    readonly binaryListeners: Listeners<TBinaryListener> = new Listeners<TBinaryListener>()

    constructor(private host: string) {}

    async connect(): Promise<boolean> {
        const host = `ws://${this.host}/ws`

        return new Promise((resolve) => {
            const handleResolve = () => {
                ws.removeEventListener('open', handleResolve)
                resolve(true)
            }
            const handleReject = (evt: any) => {
                console.error(`Unable to connect to ${host}!`, evt)
                ws.removeEventListener('close', handleReject)
                ws.removeEventListener('error', handleReject)
                resolve(false)
            }

            // The protocol ("rocjets") is mandatory otherwise Brayns will ignore you.
            const ws = new WebSocket(host, ["rockets"])
            ws.binaryType = 'arraybuffer'
            ws.addEventListener('open', this.handleOpen)
            ws.addEventListener('open', handleResolve)
            ws.addEventListener('message', this.handleMessage)
            ws.addEventListener('close', this.handleClose)
            ws.addEventListener('close', handleReject)
            ws.addEventListener('error', this.handleError)
            ws.addEventListener('error', handleReject)
            this.ws = ws
        })
    }

    exec(method: string, params: any={}) {
        return new Promise((resolve, reject) => {
            try {
                const id = btoa(`${this.autogeneratedId++}`)
                this.log("id, method, params=", id, method, params);
                const protocol = {
                    jsonrpc: "2.0",
                    id,
                    method,
                    params
                }
                if (!this.ws) return;
                this.queries[id] = { id, resolve }
                this.ws.send(JSON.stringify(protocol));
            }
            catch( ex ) {
                console.error("WS: ", ex)
                reject(ex)
            }
        })
    }

    private log(message: string) {
        if (!this.debug) return
        console.log(message)
    }

    private handleOpen = (event: Event) => {
        this.readyListeners.fire(true)
    }

    private handleMessage = (event: MessageEvent) => {
        if (typeof event.data === 'string') {
            this.handleStringMessage(event.data)
        } else {
            this.binaryListeners.fire(event.data)
        }
    }

    private handleStringMessage(text: string) {
        try {
            const data = JSON.parse(text)
            const { id, method, result, params } = data;
            if (typeof id === 'undefined') {
                this.handleUpdate(method, params)
            }
            else {
                this.handleResponse(id, result);
            }
        }
        catch (ex) {
            console.error("Unable to parse websocket incoming message:", ex)
            console.error("    text = ", text)
        }
    }

    private handleUpdate(method: string, params: {}) {
        this.updateListeners.fire(method, params)
    }

    private handleResponse(id: string, params: string) {
        this.log("id, params=", id, params);
        const query = this.queries[id]
        if (typeof query === 'undefined') {
            // Just ignore this message because it is not a response to any of ours queries.
            return;
        }

        delete this.queries[id]
        query.resolve(params);
    }

    private handleClose = (event: Event) => {
        console.log('### [WS] Close:', event)
        this.readyListeners.fire(false)
        window.setTimeout(() => this.connect(), 150)
    }

    private handleError = (event: Event) => {
        console.log('### [WS] Error:', event)
    }
}
