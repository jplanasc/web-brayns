const BBP_WORKFLOW_URL = 'https://bbp-workflow-oauth-petitjea.ocp.bbp.epfl.ch/launch/bbp_workflow.circuit.BraynsCircuitViewer/'

export default async (token: string, allocationTimeInMinutes: number): Promise<string> => {
    const job = {
        "circuit-path": '/gpfs/bbp.cscs.ch/project/proj42/circuits/CA1/20191025/CircuitConfig',
        density: 0.5,
        exclusive: false,
        "cpu-per-task": 18,
        mem: '16G',
        time: '10:00',
        account: 'proj42'
        //modules: "brayns/latest"
    }

    const response = await fetch(BBP_WORKFLOW_URL, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${token}`
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(job) // body data type must match "Content-Type" header
    })
    if (!response.ok) {
        throw Error(`#${response.status}: Unable to reach BBP Workflow server!\n${response.statusText}`)
    }
    const json = await response.json()
    console.info("json=", json);
    switch (json.status) {
        case 500: throw Error(json.errorMessage)
    }
    throw Error("It works!")
    return json.stringify()
}
