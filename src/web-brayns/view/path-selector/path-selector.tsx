import React from "react"

import PathBar from './path-bar'
import PathList from './path-list'
import FS from '../../service/fs'
import castString from '../../../tfw/converter/string'

import "./path-selector.css"


interface IBookmark {
    name: string,
    path: string
}

interface IPathSelectorProps {
    dir: string,
    // If path is not a folder, it is different from `dir`.
    path: string,
    //The path cannot be outside the root.
    root: string,
    files: { name: string, size: number }[],
    dirs: string[],
    onFolderClick: (path: string) => void,
    onFileClick: (path: string) => void,
    className?: string
    // bookmarks: IBookmark[],
    // onAddBookmarkClick: (path: string) => void,
    // onRemoveBookmarkClick: (path: string) => void
}

export default class PathSelector extends React.Component<IPathSelectorProps, {}> {
    handleFileClick = async (name: string) => {
        const fullPath = await FS.getDirName(this.props.path)
        console.info("path, fullPath=", this.props.path, fullPath);
        this.props.onFileClick(concatPath(fullPath, name))
    }

    handleBarClick = async (name: string) => {
        this.props.onFolderClick(name)
    }

    handleFolderClick = async (name: string) => {
        const fullPath = await FS.getDirName(this.props.path)
        const finalPath = concatPath(fullPath, name)
        console.info({
            path: this.props.path, fullPath, name, finalPath
        })
        this.props.onFolderClick(finalPath)
    }

    render() {
        const { dir, path, root, files, dirs } = this.props;
        const className = "webBrayns-view-PathSelector "
            + castString(this.props.className, '')

        return (<div className={className}>
            <PathBar path={path} root={root} onClick={this.handleBarClick}/>
            <PathList files={files}
                      dirs={dirs}
                      path={dir}
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
