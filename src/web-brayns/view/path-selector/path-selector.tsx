import React from "react"

import PathBar from './path-bar'
import PathList from './path-list'

import "./path-selector.css"


interface IBookmark {
    name: string,
    path: string
}

interface IPathSelectorProps {
    path: string,
    //The path cannot be outside the root.
    root: string,
    files: string[],
    folders: string[],
    onFolderClick: (path: string) => void,
    onFileClick: (path: string) => void
    // bookmarks: IBookmark[],
    // onAddBookmarkClick: (path: string) => void,
    // onRemoveBookmarkClick: (path: string) => void
}

export default class PathSelector extends React.Component<IPathSelectorProps, {}> {
    render() {
        const {
            path, root, files, folders,
            onFileClick, onFolderClick
        } = this.props;
        console.info("path, root, files, folders=", path, root, files, folders);
        return (<div className="webBrayns-view-PathSelector">
            <PathBar path={path} root={root} onClick={onFolderClick}/>
            <PathList files={files}
                      folders={folders}
                      onFileClick={(name: string) => onFileClick(concatPath(path, name))}
                      onFolderClick={(name: string) => {
                          console.log("CLICK", concatPath(path, name))
                          onFolderClick(concatPath(path, name))
                      }}/>
        </div>)
    }
}


/**
 * Concat a path, taking care of the separator.
 */
function concatPath(path: string, filename: string): string {
    if (path.endsWith("/")) return `${path}${filename}`
    return `${path}/${filename}`
}
