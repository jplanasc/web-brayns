import React from "react"

import PathBar from './path-bar'
import PathList from './path-list'
import castString from '../../../tfw/converter/string'

import "./path-selector.css"


interface IBookmark {
    name: string,
    path: string
}

interface IPathSelectorProps {
    dir: string,
    //The path cannot be outside the root.
    root: string,
    files: { name: string, size: number }[],
    dirs: string[],
    onFolderClick: (path: string) => void,
    onFileClick: (path: string) => void,
    className?: string,
    foldersOnly: boolean
    // bookmarks: IBookmark[],
    // onAddBookmarkClick: (path: string) => void,
    // onRemoveBookmarkClick: (path: string) => void
}

export default class PathSelector extends React.Component<IPathSelectorProps, {}> {
    handleFileClick = (fileName: string) => {
        this.props.onFileClick(concatPath(this.props.dir, fileName))
    }

    handleBarClick = (folderPath: string) => {
        this.props.onFolderClick(folderPath)
    }

    handleFolderClick = (folderName: string) => {
        const finalPath = concatPath(this.props.dir, folderName)
        this.props.onFolderClick(finalPath)
    }

    render() {
        const { dir, root, files, dirs, foldersOnly } = this.props;
        const className = "webBrayns-view-PathSelector "
            + castString(this.props.className, '')

        return (<div className={className}>
            <PathBar dir={dir} root={root} onClick={this.handleBarClick}/>
            <PathList files={files}
                      dirs={dirs}
                      foldersOnly={foldersOnly}
                      onFileClick={this.handleFileClick}
                      onFolderClick={this.handleFolderClick}/>
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
