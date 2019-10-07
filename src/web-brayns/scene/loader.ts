interface ILoader {
    name: string,
    extensions: string[],
    properties: {}
}

export default class Loader {
    private loaders: Map<string, ILoader[]> = new Map()

    init(params: ILoader[]) {
        const loaders = this.loaders
        console.info("[loader/init()] params=", params);
        loaders.clear()
        params.forEach((loader: ILoader) => {
            loader.extensions.forEach((ext: string) => {
                if (loaders.has(ext)) {
                    const loadersForThisExt = loaders.get(ext)
                    if (Array.isArray(loadersForThisExt)) {
                        loadersForThisExt.push(loader)
                    }
                } else {
                    loaders.set(ext, [loader])
                }
            })
        })
        console.info("this.loaders=", this.loaders);
    }

    /**
     * Get the list of all loaders that can take car of file "path".
     */
    listLoadersForPath(path: string): ILoader[] {
        const loaders: ILoader[] = []

        for (const ext of this.loaders.keys()) {
            if (path.endsWith(ext)) {
                const loadersForThisExt = this.loaders.get(ext)
                if (!Array.isArray(loadersForThisExt)) continue
                loaders.push( ...loadersForThisExt )
            }
        }
        return loaders
    }
}
