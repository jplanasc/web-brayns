import React from "react"
import { Provider } from 'react-redux'

import Input from '../../../tfw/view/input'
import Button from '../../../tfw/view/button'
import PathSelector from '../path-selector'
import FS from '../../service/fs'
import LocalStorage from '../../service/local-storage'

import './input-path.css'

const Storage = new LocalStorage("input-path");

interface IInputPathProps {
    onLoadClick: (path: string) => void
}

interface IInputPathState {
    dir: string,
    path: string,
    root: string,
    files: { name: string, size: number }[],
    dirs: string[],
    loading: boolean
}

export default class  extends React.Component<IInputPathProps, IInputPathState> {
    constructor( props: IInputPathProps ) {
        super( props );
        this.state = {
            path: Storage.get('path', ''),
            dir: '',
            root: '',
            files: [],
            dirs: [],
            loading: false
        }
    }

    async componentDidMount() {
        const root = await FS.getRoot()
        this.setState({ root })
        this.handleChange(this.state.path)
    }

    handleChange = async (path: string) => {
        const { root } = this.state
        if (!FS.exists(path)) {
            path = root
        }

        Storage.set('path', path);
        const dir = await FS.getDirName(path)
        this.setState({ loading: true, path, dir })

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
        this.props.onLoadClick(this.state.path)
    }

    render() {
        const { dir, path, root, files, dirs, loading } = this.state

        return <div className="webBrayns-view-inputPath">
            <div className="flex">
                <Input
                    label="Please type a model path"
                    size={100}
                    value={this.state.path}
                    onChange={this.handleChange}
                    onEnterPressed={this.handleFileClick}
                    wide={true}/>
                <Button label="Load" onClick={this.handleFileClick}/>
            </div>
            <hr/>
            <PathSelector
                className={loading ? 'loading' : 'ready'}
                dir={dir}
                path={path}
                root={root}
                files={files}
                dirs={dirs}
                onFolderClick={this.handleChange}
                onFileClick={this.handleChange}/>
        </div>
    }
}
