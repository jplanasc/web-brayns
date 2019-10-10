import React from "react"
import { Provider } from 'react-redux'

import Input from '../../../tfw/view/input'
import Button from '../../../tfw/view/button'
import PathSelector from '../path-selector'
import State from '../../state'
import LocalStorage from '../../service/local-storage'

import './input-path.css'

const Storage = new LocalStorage("input-path");

interface IInputPathProps {
    onLoadClick: (path: string) => void
}

interface IInputPathState {
    path: string
}

export default class  extends React.Component<IInputPathProps, IInputPathState> {
    constructor( props: IInputPathProps ) {
        super( props );
        this.state = { path: Storage.get("path", '') }
        this.handleChange(this.state.path)
    }

    handleChange = (path: string) => {
        this.setState({ path });
        Storage.set('path', path);
    }

    handleClick = () => {
        this.props.onLoadClick(this.state.path)
    }

    render() {
        return <div className="webBrayns-view-inputPath">
            <div className="flex">
                <Input
                    label="Please type a model path"
                    size={100}
                    value={this.state.path}
                    onChange={this.handleChange}
                    onEnterPressed={this.handleClick}
                    wide={true}/>
                <Button label="Load" onClick={this.handleClick}/>
            </div>
            <hr/>
            <Provider store={State.store}>
                <PathSelector onFileClick={this.handleChange}/>
            </Provider>
        </div>
    }
}
