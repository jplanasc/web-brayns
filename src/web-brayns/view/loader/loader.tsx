import React from "react"
import LoaderService from '../../service/loader'

export interface ILoaderProps {
    path: string,
    onChange: (params: {
        path: string,
        loader_name: string,
        loader_properties: { [key: string]: any }
    }) => void,
    onValidation: (valid: boolean) => void
}

/**
 * Brayns has many different loaders.
 * Some of them need extra data only the user can provide.
 * This component has no input at all because most of the loaders
 * don't need properties. But you can extend this class for Circuit for instance.
 *
 * Just call `fireUpdate(loader_properties)` method
 */
export default class DefaultLoaderView<TState={}> extends React.Component<ILoaderProps, TState> {
    async componentDidMount() {
        this.fireUpdate()
    }

    protected async fireUpdate(loaderProperties: { [key: string]: any }={}, loaderName?: string) {
        const { path, onChange } = this.props
        let loader_name = "mesh"
        if (!loaderName) {
            const loaders = await LoaderService.getLoadersForFilename(path)
            if (Array.isArray(loaders) && loaders.length > 0) {
                loader_name = loaders[0].name
            }
        }
        onChange({ path, loader_name, loader_properties: loaderProperties })
    }

    render(): JSX.Element | null {
        return null
    }
}
