import React from "react"

import Button from '../../../../tfw/view/button'

import "./path-list.css"

interface IPathListProps {
    files: string[],
    folders: string[],
    onFileClick: (name: string) => void,
    onFolderClick: (name: string) => void
}

export default class PathList extends React.Component<IPathListProps, {}> {
    constructor( props: IPathListProps ) {
        super( props );
    }

    render() {
        const { files, folders, onFileClick, onFolderClick } = this.props;
        return (<div className="webBrayns-view-PathList">
            <div className="thm-bg1">{
                folders.sort().map((name: string) => (
                    <Button key={name}
                            small={true}
                            flat={true}
                            wide={false}
                            warning={true}
                            icon="folder"
                            onClick={() => onFolderClick(name)}
                            label={name}/>
                ))
            }</div>
            <div className="thm-bg2">{
                files.sort().map((name: string) => (
                    <Button key={name}
                            small={true}
                            flat={true}
                            wide={false}
                            icon="file"
                            onClick={() => onFileClick(name)}
                            label={name}/>
                ))
            }</div>
        </div>)
    }
}
