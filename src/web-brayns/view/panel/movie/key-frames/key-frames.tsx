import React from "react"

import "./key-frames.css"

interface IKeyFramesProps {
    keyFrames: IKeyFrame[]
}

export default class KeyFrames extends React.Component<IKeyFramesProps, {}> {
    constructor( props: IKeyFramesProps ) {
        super( props );
    }

    render() {
        return (<div className="webBrayns-view-panel-movie-KeyFrames">
        </div>)
    }
}
