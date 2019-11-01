/**
 * There is a web-service called RRM that make it possible to allocate nodes
 * on BB5, start braynsService and retrieve it's address.
 */

const RRM_URL = "https://bbp.epfl.ch/viz/rrm/session/"

export default {
    closeSession, getSessionId, getStatus, sleep, startBraynsServiceAndGetHostname
}

/**
 * PUT: https://bbp.epfl.ch/viz/launcher/api/rrm/session/schedule?session_id=RETURNED_IN_PREVIOUS_REQUEST
 * {"id":"","params":" ","environment":"OMP_NUM_THREADS=2","modules":"nix/viz/brayns",
 * "queue":"interactive","nb_cpus":12,"nb_gpus":0,"nb_nodes":1,"project":"proj3",
 * "exclusive":false,"reservation":"","graceful_exit":true,"wait_until_running":false,
 * "allocation_time":60,"cluster":"bbpv1.epfl.ch","uc":"'cpu|volta|nvme'"}
 */
async function startBraynsServiceAndGetHostname(sessionId: string, minutes = 60) {
    try {
        const url = `${RRM_URL}schedule?session_id=${sessionId}`
        const params: RequestInit = {
            method: 'PUT',
            // mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'include', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': 'PUT'
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify({
                id: "",
                params: "--plugin braynsCircuitExplorer",
                environment: "OMP_THREAD_LIMIT=1",
                modules: "viz/latest brayns/latest",
                queue: "prod",  // We should use "interactive"...
                nb_cpus: 12,
                nb_gpus: 0,
                nb_nodes: 1,
                project: "proj3",
                exclusive: false,
                reservation: "",
                graceful_exit: true,
                wait_until_running: false,
                allocation_time: minutes,
                cluster: "bbpv1.epfl.ch",
                uc: "'cpu|volta|nvme'"
            })
        }
        const response = await fetch(url, params)
        const text = await response.text()
        const data = JSON.parse(text)
        if (typeof data.contents === 'string') {
            throw data.contents
        }
        return `${data.host}:${data.host_port}`
    }
    catch (ex) {
        console.error(`startBraynsServiceAndGetHostname("${sessionId}")`, ex)
        throw ex
    }
}

async function closeSession(sessionId: string) {
    try {
        const url = `${RRM_URL}session/?session_id=${sessionId}`
        const params: RequestInit = {
            method: 'DELETE',
            // mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'include', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': 'PUT'
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer' // no-referrer, *client
        }
        const response = await fetch(url, params)
        const text = await response.text()
        const data = JSON.parse(text)
        return `${data.host}:${data.host_port}`
    }
    catch (ex) {
        console.error(`closeSession("${sessionId}")`, ex)
        throw ex
    }
}

async function getStatus(sessionId: number) {
    try {
        const response = await fetch(`${RRM_URL}/status?session_id=${sessionId}`)
        const text = await response.text()
        const status = JSON.parse(text)
        if (status.code === 0) throw "Session has been cancelled!"
        if (status.code === 7) throw status.description
        console.info("status=", status);
        return status
    }
    catch (ex) {
        console.error("[getStatus]", ex)
        throw ex
    }
}

/**
 * POST: https://bbp.epfl.ch/viz/launcher/api/rrm/session/
 * body: {"owner":"bbpvizsoa","configuration_id":"brayns_generic"}
 */
async function getSessionId() {
    try {
        const params: RequestInit = {
            method: 'POST',
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'omit', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify({
                owner: "bpvizsoa",
                configuration_id: "brayns_generic"
            })
        }
        console.info("params=", params);
        const response = await fetch(`${RRM_URL}`, params)
        const text = await response.text()
        console.info("text=", text);
        const data = JSON.parse(text)
        return data.session_id
    }
    catch (ex) {
        console.error("[getSessionId]", ex)
        throw ex
    }
}


async function sleep(millisec: number) {
    return new Promise(resolve => {
        window.setTimeout(resolve, millisec)
    })
}
