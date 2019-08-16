import React from "react"
import { Provider } from 'react-redux'

import Input from '../../../tfw/view/input'
import PathSelector from '../path-selector'
import State from '../../state'
import LocalStorage from '../../service/local-storage'


const Storage = new LocalStorage("input-path");

interface IInputPathProps {
    onChange: (path: string) => void
}

interface IInputPathState {
    path: string
}

export default class  extends React.Component<IInputPathProps, IInputPathState> {
    constructor( props: IInputPathProps ) {
        super( props );
        this.state = { path: '' }

        this.handleChange(
            Storage.get("path", '/gpfs/bbp.cscs.ch/project/proj3/resources/meshes/astrocytes/GLIA_000099.h5_decimated.off')
        )
    }

    handleChange = (path: string) => {
        const handler = this.props.onChange;
        this.setState({ path });
        Storage.set('path', path);
        if (typeof handler !== 'function') return;
        handler(path);
    }

    render() {
        return <div>
            <Input
                label="Please type a model path"
                size={100}
                value={this.state.path}
                onChange={this.handleChange}
                wide={true}/>
            <Provider store={State.store}>
                <PathSelector onFileClick={this.handleChange}/>
            </Provider>
        </div>
    }
}
