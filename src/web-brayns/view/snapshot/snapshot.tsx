import React from "react"
import Tfw from 'tfw'

const Checkbox = Tfw.View.Checkbox
const Combo = Tfw.View.Combo
const Input = Tfw.View.Input
const Flex = Tfw.Layout.Flex

const castInteger = Tfw.Converter.Integer

import { ISnapshot } from '../../types'

export const RESOLUTIONS: {[key: string]: [number,number]} = {
    fullHD: [1920,1080],
    thumbnail: [160,120],
    presentation: [800,600],
    ultraHD: [3840,2160]
}

function figureOutSizeKey(width: number, height: number) {
    for (const resolutionKey of Object.keys(RESOLUTIONS)) {
        const [w, h] = RESOLUTIONS[resolutionKey]
        if (w === width && h === height) return resolutionKey
        if (w === height && h === width) return resolutionKey
    }
    return "custom"
}

export const SAMPLINGS: {[key: string]: number} = {
    medium: 50,
    quick: 1,
    low: 10,
    high: 250,
    ultra: 1250
}

function figureOutSamplesKey(samples: number) {
    for (const samplesKey of Object.keys(SAMPLINGS)) {
        const s = SAMPLINGS[samplesKey]
        if (s === samples) return samplesKey
    }
    return "custom"
}


interface IProps {
    initValue: ISnapshot,
    hidePathInput: boolean,
    onChange: (snapshot: ISnapshot) => void
}

interface IState {
    filename: string,
    widthText: string,
    heightText: string,
    samplesText: string,
    sizeKey: string,
    samplesKey: string,
    landscape: boolean
}

function res(name: string): string {
    const resolution = RESOLUTIONS[name];
    if (!resolution) return '';
    const [w,h] = resolution;
    return `(${w} x ${h})`
}

export default class Snapshot extends React.Component<IProps, IState> {
    constructor( props: IProps ) {
        super( props );
        const v = props.initValue
        this.state = {
            filename: v.filename,
            widthText: `${v.width}`,
            heightText: `${v.height}`,
            samplesText: `${v.samples}`,
            sizeKey: figureOutSizeKey(v.width, v.height),
            samplesKey: figureOutSamplesKey(v.samples),
            landscape: v.width > v.height
        }
        this.fire()
    }

    private fire = () => {
        const { filename, widthText, heightText, samplesText, landscape } = this.state
        this.props.onChange({
            filename,
            width: castInteger(widthText, 0),
            height: castInteger(heightText, 0),
            samples: castInteger(samplesText, 0),
            landscape
        })
    }

    handleFilenameChange = (filename: string) => {
        this.setState({ filename })
        this.fire()
    }

    handleWidthChange = (widthText: string) => {
        this.setState({ widthText })
        const value = parseInt(widthText, 10);
        if (isNaN(value)) return;
        this.fire()
    }

    handleHeightChange = (heightText: string) => {
        this.setState({ heightText })
        const value = parseInt(heightText, 10);
        if (isNaN(value)) return;
        this.fire()
    }

    handleSamplesChange = (samplesText: string) => {
        this.setState({ samplesText })
        const value = parseInt(samplesText, 10);
        if (isNaN(value)) return;
        this.fire()
    }

    handleSizeKeyChange = (sizeKey: string) => {
        this.setState({ sizeKey })
        const resolution = RESOLUTIONS[sizeKey]
        if (!resolution) return
        const [w,h] = resolution
        this.setState({
            widthText: `${w}`,
            heightText: `${h}`
        }, this.fire)
    }

    handleSamplesKeyChange = (samplesKey: string) => {
        this.setState({ samplesKey })
        const samples = SAMPLINGS[samplesKey]
        if (!samples) return
        this.setState(
            { samplesText: `${samples}` },
            this.fire
        )
    }

    handleLandscapeChange = (landscape: boolean) => {
        this.setState({ landscape })
        const width = parseInt(this.state.widthText, 10)
        const height = parseInt(this.state.heightText, 10)
        if ((landscape && height > width) || (!landscape && width > height)) {
            this.setState(
                {
                    widthText: `${height}`,
                    heightText: `${width}`
                },
                this.fire
            )
        }
    }

    render() {
        const {
            filename, widthText, heightText, samplesText, landscape, sizeKey, samplesKey
        } = this.state

        return (<div className="webBrayns-dialog-screenshot">
            {
                !this.props.hidePathInput &&
                <Input wide={true}
                       label="File name"
                       value={`${filename}`}
                       onChange={this.handleFilenameChange}/>
            }
            <Combo value={sizeKey} wide={true} onChange={this.handleSizeKeyChange}>
                <div key="ultraHD">Ultra HD <em>{res("ultraHD")}</em></div>
                <div key="fullHD">Full HD <em>{res("fullHD")}</em></div>
                <div key="presentation">Presentation <em>{res("presentation")}</em></div>
                <div key="thumbnail">Thumbnail <em>{res("thumbnail")}</em></div>
                <div key="custom">Custom...</div>
            </Combo>
            <Flex>
                <Input label="Width" value={`${widthText}`}
                       enabled={sizeKey === 'custom'}
                       onChange={this.handleWidthChange}/>
                <Input label="Height" value={`${heightText}`}
                       enabled={sizeKey === 'custom'}
                       onChange={this.handleHeightChange}/>
                <Checkbox label="landscape"
                          value={landscape}
                          onChange={this.handleLandscapeChange}/>
            </Flex>
            <Combo value={samplesKey} wide={true}
                   onChange={this.handleSamplesKeyChange}>
                <div key="quick">Quick and dirty</div>
                <div key="low">Low quality</div>
                <div key="medium">Medium quality</div>
                <div key="high">High quality</div>
                <div key="ultra">Very high quality</div>
                <div key="custom">Custom...</div>
            </Combo>
            <Input wide={true}
                   label="Sampling"
                   value={`${samplesText}`}
                   enabled={samplesKey === 'custom'}
                   onChange={this.handleSamplesChange}/>
        </div>)
    }
}
