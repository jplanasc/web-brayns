import React from "react"
import { Client as BraynsClient } from "brayns"

import ImageStream from './web-brayns/view/image-stream'

import "./app.css"


interface IAppProps {
    brayns: BraynsClient
}

export default class App extends React.Component<IAppProps, {}> {
    constructor( props: IAppProps ) {
        super( props );
    }

    render() {
        return (<div className="App">
            <div className="view thm-ele-nav">
                <ImageStream brayns={this.props.brayns}/>
            </div>
        </div>)
    }
}
