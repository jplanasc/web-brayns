import React from "react"

import KeyFrames from './key-frames'
import { IKeyFrame } from '../../../types'

import "./movie.css"

interface IMovieProps {
    keyFrames: IKeyFrame[]
}

export default class Movie extends React.Component<IMovieProps, {}> {
    constructor( props: IMovieProps ) {
        super( props );
    }

    render() {
        return (<div className="webBrayns-view-panel-Movie">
            <p>Coming soon...</p>
            <KeyFrames keyFrames={this.props.keyFrames}/>
        </div>)
    }
}
