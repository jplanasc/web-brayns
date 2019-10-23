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

export default class  extends React.Component<IInputPathProps, IInputPathState> {
    constructor( props: IInputPathProps ) {
        super( props );
        this.state = {
            path: Storage.get(this.storageKey, ''),
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
            console.log("foldersOnly = ", this.props.foldersOnly)
            const root = await FS.getRoot()
            this.setState({ root })
            const { path } = this.state
            const fixedPath = (await FS.exists(path)) ? path : root
            this.handleChange(fixedPath)
        }
        catch(ex) {
            console.error("[view/input-path/componentDidMount()]", ex)
        }
    }

    private checkValidity = Debouncer(async () => {
        const foldersOnly = castBoolean(this.props.foldersOnly, false)
        const { path } = this.state

        if (foldersOnly) {
            // Current path must be an existing directory.
            const isValidPath = await FS.isDir(path)
            console.info("isValidPath=", isValidPath);
            this.setState({ isValidPath })
        } else {
            // Current path must be an existing file.
            const isValidPath = await FS.isFile(path)
            this.setState({ isValidPath })
        }
    }, 300)

    handleChange = async (path: string) => {
        const dir = await FS.getDirName(path)
        this.setState({
                loading: true,
                path,
                dir,
                isValidPath: false
            },
            this.checkValidity
        )

        try {
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
                    wide={true}/>
                <Button
                    label="Load"
                    enabled={isValidPath}
                    onClick={this.handleFileClick}/>
            </div>
            <hr/>
            <PathSelector
                className={loading ? 'loading' : 'ready'}
                dir={dir}
                root={root}
                files={files}
                dirs={dirs}
                foldersOnly={foldersOnly}
                onFolderClick={this.handleChange}
                onFileClick={this.handleChange}/>
        </div>
    }
}
