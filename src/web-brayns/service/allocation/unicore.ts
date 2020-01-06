import Async from '../../tool/async'
import UrlArgs from '../../../tfw/url-args'
import Dialog from "../../../tfw/factory/dialog"

const UNICORE_URL = 'https://bbpunicore.epfl.ch:8080/BB5-CSCS/rest/core'
const RX_HOSTNAME = /[a-z0-9.-]+:[0-9]+/gi

export default async (token: string, allocationTimeInMinutes: number): Promise<string> => {
    const { jobId, jobURL } = await Dialog.wait(
        "Contacting UNICORE...",
        contactingUnicore(token)
    )
    await Dialog.wait(
        "Waiting for an available node on BB5...",
        waitForJobStatus(jobURL, token)
    )
    const hostname = await Dialog.wait(
        "Brayns service is starting...",
        waitForBraynsToBeUpAndRunning(jobId, token)
    )
    return hostname
}


async function contactingUnicore(token: string): Promise<{ jobId: string, jobURL: string }> {
    const urlArgs = UrlArgs.parse()
    const account = urlArgs.account || "proj3"
    const partition = urlArgs.partition || "prod"
    const job = {
        Executable: `
        echo $(hostname -f):5000 > hostname &&
        source /etc/profile &&
        module purge &&
        module load brayns/1.0.1/serial &&
        module load ffmpeg/4.2 &&
        export OMP_THREAD_LIMIT=1 &&
        /gpfs/bbp.cscs.ch/home/nroman/software/install/linux-rhel7-x86_64/gcc-6.4.0/brayns-testingci-ciwzm6/bin/braynsService \
            --http-server :5000 \
            --plugin braynsCircuitExplorer \
            --plugin braynsCircuitInfo \
            --sandbox-path /gpfs/bbp.cscs.ch/project`,
        Project: account,
        Resources: {
            Nodes: 1,
            Queue: partition,
            QoS: "longjob",
            Runtime: "8h"
            // TODO in unicore:
            // CPU number
            // Memory
            // Constraints
            // Exclusive allocation ?
            // by default we get the one below (which sucks)
            // TRES=cpu=1,mem=256M,node=1,billing=1

        }
    }

    console.info("job=", job);
    const response = await fetch(`${UNICORE_URL}/jobs`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(job) // body data type must match "Content-Type" header
    })

    if (response.ok === false) {
        console.info("response=", response);
        throw "Allocation failed due to UNICORE error!"
    }
    return extractJobIdAndURL(response.headers)
}


async function waitForJobStatus(jobURL: string, token: string) {
    while (true) {
        await Async.sleep(500)
        const status = await getJobStatus(jobURL, token)
        //console.info("result=", result);
        console.info("status=", status);
        if (status === "RUNNING" || status === 'SUCCESSFUL') return status
    }
}


/**
 * Example of "Location" header:
 * https://bbpunicore.epfl.ch:8080/BB5-CSCS/rest/core/jobs/be1d27bd-9063-4b33-869a-f8b2274ea792
 */
function extractJobIdAndURL(headers: any): { jobId: string, jobURL: string } {
    const jobURL = headers.get('Location')
    if (!jobURL) {
        console.info("headers=", headers);
        throw `Header "Location" is missing!`
    }
    const pos = jobURL.indexOf("/jobs/")
    const jobId = jobURL.substring(pos + "/jobs/".length)
    return { jobId, jobURL }
}


async function readFileContent(jobId: string, token: string, filename: string) {
    try {
        const response = await fetch(`${UNICORE_URL}/storages/${jobId}-uspace/files/${filename}`, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Accept': 'application/octet-stream',
                'Authorization': `Bearer ${token}`
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer' // no-referrer, *client
        })
        if (!response.ok) {
            throw `Unable to retrieve file "${filename}": ${response.statusText}`
        }
        const content = await response.text()
        return content
    }
    catch (ex) {
        // Exception can occur if the file is not yet available.
        // For this, we return `null` in this case and just ignore the error.
        return null
    }
}


async function getJobStatus(jobURL: string, token: string) {
    const response = await fetch(jobURL, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer' // no-referrer, *client
    })
    if (!response.ok) {
        console.error(`Unable to get status: ${response.statusText}`)
        return "ERROR"
    }
    const result = await response.json()
    const status = result.status
    return status
}


async function waitForBraynsToBeUpAndRunning(jobId: string, token: string): Promise<string> {
    while (true) {
        const hostname = await readFileContent(jobId, token, "hostname")
        if (hostname) {
            if (!RX_HOSTNAME.test(hostname)) {
                throw `We were expecting to receive a hostname, but we got "${hostname}"!`
            }
            return hostname
        }
        await Async.sleep(1000)
    }
}
