import React from "react"

import Debouncer from '../../../tfw/debouncer'
import Input from '../../../tfw/view/input'
import Button from '../../../tfw/view/button'
import PathSelector from '../path-selector'
import FS from '../../service/fs'
import LocalStorage from '../../service/local-storage'
import castBoolean from '../../../tfw/converter/boolean'

import './input-path.css'

const Storage = new LocalStorage("input-path");

interface IInputPathProps {
    // Where to store the last selected path.
    storageKey: string
    foldersOnly?: boolean
    onLoadClick: (path: string) => void
}

interface IInputPathState {
    dir: string,
    path: string,
    root: string,
    files: { name: string, size: number }[],
    dirs: string[],
    loading: boolean,
    isValidPath: boolean
}

export default class extends React.Component<IInputPathProps, IInputPathState> {
    constructor(props: IInputPathProps) {
        super(props);
        this.state = {
            path: '',
            dir: '',
            root: '',
            files: [],
            dirs: [],
            loading: false,
            isValidPath: false
        }
    }

    private get storageKey() {
        return `path/${this.props.storageKey}`
    }

    async componentDidMount() {
        try {
            const root = await FS.getRoot()
            console.info("root=", root);
            const path = Storage.get(this.storageKey, root)
            console.info("path=", path);
            const exists = await FS.exists(path)
            console.info("exists=", exists);
            const fixedPath = exists ? path : root
            console.info("fixedPath=", fixedPath);
            this.setState(
                { root, path: fixedPath },
                () => this.handleChange(fixedPath)
            )
        }
        catch (ex) {
            console.error("[view/input-path/componentDidMount()]", ex)
        }
    }

    private checkValidity = Debouncer(async () => {
        try {
            const foldersOnly = castBoolean(this.props.foldersOnly, false)
            const { path } = this.state

            if (foldersOnly) {
                // Current path must be an existing directory.
                const isValidPath = await FS.isDir(path)
                this.setState({ isValidPath })
            } else {
                // Current path must be an existing file.
                const isValidPath = await FS.isFile(path)
                this.setState({ isValidPath })
            }
        }
        catch (ex) {
            console.error("[webBrayns/view/inputPath]", Error(ex))
        }
    }, 300)

    handleChange = async (path: string) => {
        try {
            const dir = await FS.getDirName(path)
            this.setState({
                loading: true,
                path,
                dir,
                isValidPath: false
            },
                this.checkValidity
            )

            const content = await FS.listDir(dir)
            this.setState({
                files: content.files,
                dirs: content.dirs
            })
        }
        catch (ex) {
            console.error("Unable to list dir...", ex)
        }
        finally {
            this.setState({ loading: false })
        }
    }

    handleFileChange = (path: string) => {
        this.setState({ path }, this.handleFileClick)
    }

    handleFileClick = () => {
        Storage.set(this.storageKey, this.state.path);
        this.props.onLoadClick(this.state.path)
    }

    render() {
        const { dir, path, root, files, dirs, loading, isValidPath } = this.state
        const foldersOnly = castBoolean(this.props.foldersOnly, false)

        return <div className="webBrayns-view-inputPath">
            <div className="flex">
                <Input
                    size={100}
                    value={path}
                    onChange={this.handleChange}
                    onEnterPressed={this.handleFileClick}
                    wide={true} />
                <Button
                    label="Load"
                    enabled={isValidPath}
                    onClick={this.handleFileClick} />
            </div>
            <hr />
            <PathSelector
                className={loading ? 'loading' : 'ready'}
                dir={dir}
                root={root}
                files={files}
                dirs={dirs}
                foldersOnly={foldersOnly}
                onFolderClick={this.handleChange}
                onFileClick={this.handleFileChange} />
        </div>
    }
}
