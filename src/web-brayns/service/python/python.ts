import Scene from '../../scene'

export default {
    async exec(serviceName: string, params: any = ""): Promise<any> {
        try {
            //console.info("[Python]", serviceName, params);
            const data = new FormData();
            data.append("i", JSON.stringify(params))
            data.append("h", JSON.stringify(Scene.host))
            const
                url = `/cgi-bin/${serviceName}.py`,
                init: RequestInit = { method: "POST", body: data, credentials: "include" },
                response = await fetch(url, init);
            if (response.ok) {
                const text = await response.text();
                try {
                    const output = JSON.parse(text);
                    //console.info("[Python]", serviceName, " => ", output);
                    return output;
                }
                catch( ex ) {
                    throw Error(text);
                }
            }
            throw {
                code: response.status,
                text: response.statusText
            }
        }
        catch (ex) {
            console.error(`Error calling Python service "${serviceName}": `, ex)
            console.error("...input arguments were: ", params)
            throw ex
        }
    }
}
