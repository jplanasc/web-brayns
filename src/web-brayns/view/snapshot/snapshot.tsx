import React from "react"

import Checkbox from '../../../tfw/view/checkbox'
import Combo from '../../../tfw/view/combo'
import Input from '../../../tfw/view/input'
import Flex from '../../../tfw/layout/flex'

import { ISnapshot } from '../../types'

export const RESOLUTIONS: {[key: string]: [number,number]} = {
    fullHD: [1920,1080],
    thumbnail: [160,120],
    presentation: [800,600],
    ultraHD: [3840,2160]
}

export const SAMPLINGS: {[key: string]: number} = {
    medium: 50,
    quick: 1,
    low: 10,
    high: 250,
    ultra: 1250
}


interface IProps extends ISnapshot {
    onFilenameChange: (filename: string) => void,
    onSizeKeyChange: (key: string) => void,
    onWidthChange: (width: number) => void,
    onHeightChange: (width: number) => void,
    onSamplesKeyChange: (key: string) => void,
    onSamplesChange: (samples: number) => void,
    onLandscapeChange: (value: boolean) => void
}

function res(name: string): string {
    const resolution = RESOLUTIONS[name];
    if (!resolution) return '';
    const [w,h] = resolution;
    return `(${w} x ${h})`
}

export default class Snapshot extends React.Component<IProps, {}> {
    constructor( props: IProps ) {
        super( props );
    }

    handleWidthChange = (width: string) => {
        const value = parseInt(width, 10);
        if (isNaN(value)) return;
        this.props.onWidthChange(value);
    }

    handleHeightChange = (height: string) => {
        const value = parseInt(height, 10);
        if (isNaN(value)) return;
        this.props.onHeightChange(value);
    }

    handleSizeKeyChange = (size: string) => {
        this.props.onSizeKeyChange(size);
        const resolution = RESOLUTIONS[size];
        if (!resolution) return '';
        const [w,h] = resolution;
        this.props.onWidthChange(w)
        this.props.onHeightChange(h)
    }

    handleSamplesChange = (samples: string) => {
        const value = parseInt(samples, 10);
        if (isNaN(value)) return;
        this.props.onSamplesChange(value);
    }

    handleSamplesKeyChange = (key: string) => {
        this.props.onSamplesKeyChange(key);
        const samples = SAMPLINGS[key]
        if (!samples) return
        this.props.onSamplesChange(samples)
    }

    handleFilenameChange = (filename: string) => {
        this.props.onFilenameChange(filename);
    }

    handleLandscapeChange = (value: boolean) => {
        this.props.onLandscapeChange(value)
    }

    render() {
        const p = this.props;

        return (<div className="webBrayns-dialog-screenshot">
            <Input wide={true}
                   label="File name"
                   value={`${p.filename}`}
                   onChange={this.handleFilenameChange}/>
            <Combo value={p.sizeKey} wide={true} onChange={this.handleSizeKeyChange}>
                <div key="ultraHD">Ultra HD <em>{res("ultraHD")}</em></div>
                <div key="fullHD">Full HD <em>{res("fullHD")}</em></div>
                <div key="presentation">Presentation <em>{res("presentation")}</em></div>
                <div key="thumbnail">Thumbnail <em>{res("thumbnail")}</em></div>
                <div key="custom">Custom...</div>
            </Combo>
            <Flex>
                <Input label="Width" value={`${p.width}`}
                       enabled={p.sizeKey === 'custom'}
                       onChange={this.handleWidthChange}/>
                <Input label="Height" value={`${p.height}`}
                       enabled={p.sizeKey === 'custom'}
                       onChange={this.handleHeightChange}/>
                <Checkbox label="landscape"
                          value={this.props.landscape}
                          onChange={this.handleLandscapeChange}/>
            </Flex>
            <Combo value={p.samplesKey} wide={true} onChange={this.handleSamplesKeyChange}>
                <div key="quick">Quick and dirty</div>
                <div key="low">Low quality</div>
                <div key="medium">Medium quality</div>
                <div key="high">High quality</div>
                <div key="ultra">Very high quality</div>
                <div key="custom">Custom...</div>
            </Combo>
            <Input wide={true}
                   label="Sampling"
                   value={`${p.samples}`}
                   enabled={p.samplesKey === 'custom'}
                   onChange={this.handleSamplesChange}/>
        </div>)
    }
}
