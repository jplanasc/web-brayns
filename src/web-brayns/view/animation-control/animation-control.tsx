import React from "react"

import Debouncer from '../../../tfw/debouncer'
import Button from '../../../tfw/view/button'
import Slider from '../../../tfw/view/slider'
import Combo from '../../../tfw/view/combo'
import Icon from '../../../tfw/view/icon'
import Util from '../../../tfw/util'
import State from '../../state'
import Scene from '../../scene'

import "./animation-control.css"

interface IAnimationControlProps {
    current?: (number /* Integer */);
    delta?: (number /* Integer */);
    dt?: number;
    frameCount?: (number /* Integer */);
    playing?: boolean;
    unit?: string;
}

interface IAnimationControlState {
    speedKey: string  // "NORMAL" | "x2" | "x4" | "x8" | "x16" | "x32"
}

export default class AnimationControl extends React.Component<IAnimationControlProps, IAnimationControlState> {
    constructor( props: IAnimationControlProps ) {
        super( props );
        this.state = { speedKey: speedToKey(props.delta || 1) }
    }

    handleCurrentChange = (current: number) => {
        const params = { current };
        State.dispatch(State.Animation.update(params));
        this.setAnimationParameters(params);
    }

    setAnimationParameters = Debouncer((params: IAnimationControlProps) => {
        Scene.Api.setAnimationParameters(params);
    }, 300)

    handleSpeedChange = (speedKey: string) => {
        this.setState({ speedKey });
        State.dispatch(State.Animation.update({ delta: keyToSpeed(speedKey) }));
    }

    shift(delta: number) {
        const current = this.props.current || 1;
        const frameCount = this.props.frameCount || 1;
        const speed = keyToSpeed(this.state.speedKey);
        const nextValue = Util.clamp(current + speed * delta, 1, frameCount);
        if (nextValue !== current) {
            const params = { current: nextValue };
            State.dispatch(State.Animation.update(params));
            this.setAnimationParameters(params);
        }
    }

    handleNextClick = () => { this.shift(1); }
    handleNext2Click = () => { this.shift(10); }
    handlePrevClick = () => { this.shift(-1); }
    handlePrev2Click = () => { this.shift(-10); }

    render() {
        const p = this.props;
        const current = p.current || 0;
        const frameCount = p.frameCount || 0;
        if (frameCount < 2) return null;

        const percent = Math.floor(.5 + 100 * (p.current || 0) / frameCount);
        return (<div className="webBrayns-view-AnimationControl thm-bgPD-C">
            <div className="thm-bgPD flex">
                <Icon content="skip-prev2" enabled={current > 1}
                    onClick={this.handlePrev2Click}/>
                <Icon content="skip-prev" enabled={current > 1}
                    onClick={this.handlePrevClick}/>
                <Button icon="play" small={true}/>
                <Icon content="skip-next" enabled={current < frameCount}
                    onClick={this.handleNextClick}/>
                <Icon content="skip-next2" enabled={current < frameCount}
                    onClick={this.handleNext2Click}/>
            </div>
            <div className="label">
                <b>{p.current}</b>
                <span className='hint'>{` / ${frameCount} (${p.unit})`}</span>
            </div>
            <Slider min={0} max={frameCount}
                    value={p.current || 0}
                    step={1}
                    text={`${percent} %`}
                    onChange={this.handleCurrentChange} />
            <Combo value={this.state.speedKey} label="Speed" onChange={this.handleSpeedChange}>
                <div key="NORMAL">x1</div>
                <div key="x2">x2</div>
                <div key="x4">x4</div>
                <div key="x8">x8</div>
                <div key="x16">x16</div>
                <div key="x32">x32</div>
            </Combo>
        </div>)
    }
}


// The speed is the number of frames to skip to go to the next one.
// In Brayns' animation parameters, it is own by the parameter `delta`.
const SPEEDS: [string,number][] = [
    ["NORMAL", 1],
    ["x2", 2],
    ["x4", 4],
    ["x8", 8],
    ["x16", 16],
    ["x32", 32]
]

function speedToKey(speed: number): string {
    const item = SPEEDS.find(x => x[1] === speed);
    if (!item) return "NORMAL";
    return item[0];
}

function keyToSpeed(key: string): number {
    const item = SPEEDS.find(x => x[0] === key);
    if (!item) return 1;
    return item[1];
}