import React from "react"

import Touchable from '../../../../tfw/view/touchable'
import Icon from '../../../../tfw/view/icon'
import List from '../../../../tfw/view/list'

import "./path-list.css"

interface IPathListProps {
    // Must be the real path, not a file!
    path: string,
    files: { name: string, size: number }[],
    dirs: string[],
    // Complete path.
    onFileClick: (path: string) => void,
    // Complete path.
    onFolderClick: (path: string) => void
}

export default class PathList extends React.Component<IPathListProps, {}> {
    constructor( props: IPathListProps ) {
        super( props );
    }

    renderDir = (name: string) => {
        const { onFolderClick } = this.props;

        return <div className="folder-button thm-bg0">
          <Touchable key={name}
                     onClick={() => onFolderClick(name)}>
              <Icon content="folder" size="18px"/>
              <div className="label" title={name}>{name}</div>
          </Touchable>
        </div>
    }

    renderFile = (file: { name: string, size: number}) => {
        const { onFileClick } = this.props;
        const { name, size } = file

        return <div className="folder-button thm-bg0">
            <Touchable key={file.name}
                     onClick={() => onFileClick(name)}>
                <Icon content="file" size="18px"/>
                <div className="label" title={name}>{name}</div>
                <div className="size">{getHumanReadableSize(size)}</div>
            </Touchable>
        </div>

    }

    render() {
        const { files, dirs } = this.props;

        console.info("files=", files);

        return (<div className="webBrayns-view-PathList">
            <div>
                <h1>{`Folders (${dirs.length})`}</h1>
                <List itemHeight={28}
                      height="60vh"
                      items={dirs.sort()}
                      mapper={this.renderDir}/>
            </div>
            <div>
                <h1>{`Files (${files.length})`}</h1>
                <List itemHeight={28}
                    height="60vh"
                    items={files.sort(byName)}
                    mapper={this.renderFile}/>
            </div>
        </div>)
    }
}


function getHumanReadableSize(size: number, unit: string=''): JSX.Element {
    if (unit.length > 0) {
        return <span className={unit.toLowerCase()}>{`${size} ${unit}`}</span>
    }

    if (size < 1024) return getHumanReadableSize(Math.floor(size * 1000) * 0.001, 'Kb')
    size = Math.floor(size / 1024)
    if (size < 1024) return getHumanReadableSize(size, 'Kb')
    size = Math.floor(size / 1024)
    if (size < 1024) return getHumanReadableSize(size, 'Mb')
    size = Math.floor(size / 1024)
    if (size < 1024) return getHumanReadableSize(size, 'Gb')
    size = Math.floor(size / 1024)
    return getHumanReadableSize(size, 'Tb')
}


function byName(a: { name: string }, b: { name: string }) {
    const A = a.name
    const B = b.name
    if (A < B) return -1
    if (A > B) return +1
    return 0
}
