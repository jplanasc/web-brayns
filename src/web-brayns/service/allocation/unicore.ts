const UNICORE_URL = 'https://bbpunicore.epfl.ch:8080/BB5-CSCS/rest/core'

export default async (token: string, allocationTimeInMinutes: number): Promise<string> => {
    const job = {
        Executable: "hostname >> hostname && source /etc/profile && /gpfs/bbp.cscs.ch/home/petitjea/scripts/nadir.sh",
        Project: 'proj3'
    }

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
    const json = await response.json()
    console.info("json=", json);
    switch (json.status) {
        case 500: throw Error(json.errorMessage)
    }
    throw Error("It works!")
    return json.stringify()
}
