import Async from '../../tool/async'

const UNICORE_URL = 'https://bbpunicore.epfl.ch:8080/BB5-CSCS/rest/core'
const RX_HOSTNAME = /[a-z0-9.-]+:[0-9]+/gi

export default async (token: string, allocationTimeInMinutes: number): Promise<string> => {
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
        Project: 'proj3',
        Runtime: allocationTimeInMinutes * 60
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


    const { jobId } = extractJobIdAndURL(response.headers)

    while (true) {
        const hostname = await readFileContent(jobId, token, "hostname")
        if (hostname) {
            if (!RX_HOSTNAME.test(hostname)) {
                throw Error(`We were expecting to receive a hostname, but we got "${hostname}"!`)
            }
            return hostname
        }
        Async.sleep(500)
    }
}


/**
 * Example of "Location" header:
 * https://bbpunicore.epfl.ch:8080/BB5-CSCS/rest/core/jobs/be1d27bd-9063-4b33-869a-f8b2274ea792
 */
function extractJobIdAndURL(headers: any) {
    const jobURL = headers.get('Location')
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
            throw Error(`Unable to retrieve file "${filename}": ${response.statusText}`)
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
        throw "Blabla"
    }
    const content = await response.json()
    return content
}
