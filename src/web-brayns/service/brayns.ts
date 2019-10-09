/**
 * Communication to Brayns service is made through WebSocket.
 */
import Listeners from '../../tfw/listeners'

interface IQuery {
    id: string,
    resolve: (data: any) => void
    reject: (data: { code: number, message: string }) => void
}

interface IQueries {
    [key: string]: IQuery
}

interface ISubscribers {
    [key: string]: Listeners<{}>
}

type IAsyncExecResolve = {status: "cancel" | "error" | "ok", message: any}

interface IAsyncQuery {
    cancel: () => void,
    progress: Listeners<(label: string, progress: number) => void>,
    promise: Promise<IAsyncExecResolve>
}


export default class BraynsService {
    debug: boolean = false
    private ws: WebSocket | undefined
    private autogeneratedId: number = 1
    private queries: IQueries = {}
    readonly readyListeners = new Listeners<boolean>()
    readonly binaryListeners = new Listeners<ArrayBuffer>()
    readonly subscribers: ISubscribers = {}
    private host = ""

    async connect(hostname: string): Promise<boolean> {
        this.host = hostname
        const url = `ws://${hostname}/ws`

        return new Promise((resolve) => {
            const handleResolve = () => {
                ws.removeEventListener('open', handleResolve)
                resolve(true)
            }
            const handleReject = (evt: any) => {
                console.error(`Unable to connect to ${url}!`, evt)
                ws.removeEventListener('close', handleReject)
                ws.removeEventListener('error', handleReject)
                resolve(false)
            }

            // The protocol ("rocjets") is mandatory otherwise Brayns will ignore you.
            const ws = new WebSocket(url, ["rockets"])
            // This is very IMPORTANT! With blobs,
            // we have weird bugs when trying to get the videostreaming messages.
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
                //this.log({ id, method, params });
                const protocol = {
                    jsonrpc: "2.0",
                    id,
                    method,
                    params
                }
                if (!this.ws) return;
                this.queries[id] = { id, resolve, reject }
                this.ws.send(JSON.stringify(protocol));
            }
            catch( ex ) {
                console.error("WS: ", ex)
                reject(ex)
            }
        })
    }

    execAsync(method: string, params: any={}): IAsyncQuery {
        const that = this
        const listeners = new Listeners<{ label: string, progress: number }>()
        const id = btoa(`${this.autogeneratedId++}`)

        const promise = new Promise((resolve, reject) => {
            const ws = that.ws
            if (!ws) {
                reject("Brayns is not connected!")
                return
            }
            const onProgress = (arg: {amount: number, operation: string}) => {
                listeners.fire({
                    label: arg.operation || "Loading...",
                    progress: arg.amount
                })
            }
            const onMessage = (arg: any) => {
                that.unsubscribe("progress", onProgress)
                resolve({
                    status: "ok",
                    message: arg
                })
            }
            const onError = (arg: { code: number, message: string}) => {
                if (arg.code === -31002) {
                    resolve({ status: "cancel", message: arg.message })
                } else {
                    reject(arg)
                }
            }
            that.subscribe("progress", onProgress)

            const protocol = {
                jsonrpc: "2.0",
                id,
                method,
                params
            }

            that.queries[id] = { id, resolve: onMessage, reject: onError }
            ws.send(JSON.stringify(protocol));
        })

        return {
            cancel() {
                const ws = that.ws
                if (!ws) return
                ws.send(JSON.stringify({
                    jsonrpc: "2.0",
                    method: "cancel",
                    params: { id }
                }));
            },
            get progress(): Listeners<{ label: string, progress: number }> { return listeners },
            get promise() { return promise }
        }
    }

    /**
     * Brayns service will notify us on updates.
     * You can subscribe to receive updates for a specific method.
     */
    subscribe(method: string, listener: (arg: any) => void) {
        if (!this.subscribers[method]) {
            this.subscribers[method] = new Listeners<{}>()
        }
        this.subscribers[method].add(listener)
    }

    /**
     * Unsubscribe for specific updates.
     */
    unsubscribe(method: string, listener: (arg: any) => void) {
        if (!this.subscribers[method]) return
        this.subscribers[method].remove(listener)
    }

    get hostname() { return this.host }

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
            const { id, method, result, params, error } = data;
            if (typeof id === 'undefined') {
                this.handleUpdate(method, params)
            }
            else if (typeof error !== 'undefined'){
                this.handleResponseError(id, error)
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
        const listeners = this.subscribers[method];
        if (!listeners) return
        listeners.fire(params)
    }

    private handleResponse(id: string, params: string) {
        const query = this.queries[id]
        if (typeof query === 'undefined') {
            // Just ignore this message because it is not a response
            // to any of our queries.
            return;
        }

        delete this.queries[id]
        query.resolve(params);
    }

    private handleResponseError(id: string, error: any) {
        const query = this.queries[id]
        if (typeof query === 'undefined') {
            // Just ignore this message because it is not a response
            // to any of our queries.
            return;
        }

        delete this.queries[id]
        query.reject({
            code: error.code || 0,
            message: error.message || "Unknown error!"
        });
    }

    private handleClose = (event: Event) => {
        console.log('### [WS] Close:', event)
        this.readyListeners.fire(false)
        window.setTimeout(() => this.connect(), 150)
    }

    private handleError = (event: Event) => {
        console.error('### [WS] Error:', event)
    }
}
