import React from "react"

import Label from '../../../tfw/view/label'
import Gesture from '../../../tfw/gesture'
import Color from '../../../tfw/color'

import "./range.css"

// Left and right margins for the range.
const MARGIN = 16;

interface IRangeProps {
    label?: string,
    min: number,
    max: number,
    color: string,    // CSS color string
    onChange: (min: number, max: number) => void
}

export default class Range extends React.Component<IRangeProps, {}> {
    private readonly refCanvas: React.RefObject<HTMLCanvasElement> = React.createRef();
    private ctx: CanvasRenderingContext2D | null = null;
    // -1 left bound, +1 right bound, 0 center (to move both bounds).
    private selection: number = 0;

    constructor( props: IRangeProps ) {
        super( props );
    }

    componentDidMount() {
        const canvas = this.refCanvas.current;
        if (!canvas) return;

        this.ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        canvas.setAttribute("width", `${rect.width}`);
        Gesture(canvas).on({
            down: this.handleDown,
            pan: this.handlePan
        });

        this.paint();
    }

    handleDown = (evt) => {
        const x = this.getX(evt);
        const { min, max, onChange } = this.props;
        const A = Math.abs(min - x);
        const B = Math.abs(max - x);
        const M = Math.abs(x - (max + min) / 2);

        if (A < M) {
            if (A < B) this.selection = -1;
            else this.selection = +1;
        }
        // M < A
        else {
            if (M <= B) this.selection = 0;
            else this.selection = +1;
        }
        this.moveTo(x);
    }

    moveTo(x: number) {
        const { min, max, onChange } = this.props;
        const { selection } = this;

        if (selection === -1) {
            onChange(clamp(x, 0, max), max);
        }
        else if (selection === +1) {
            onChange(min, clamp(x, min, 1));
        }
        else {
            const shift = (max - min) / 2;
            let A = x - shift;
            let B = x + shift;
            if (A < 0) {
                B -= A;
                A = 0;
            }
            else if (B > 1) {
                A += B - 1;
                B = 1;
            }
            onChange(A, B);
        }
    }

    handlePan = (evt) => {
        const x = this.getX(evt);
        this.moveTo(x);
    }

    getX(evt) {
        const canvas = this.refCanvas.current;
        if (!canvas) return 0;

        const rect = canvas.getBoundingClientRect();
        return (evt.x - MARGIN) / (rect.width - 2 * MARGIN);
    }

    paint() {
        const ctx = this.ctx;
        if (!ctx) return;
        const { canvas } = ctx;

        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        canvas.width = w;
        canvas.height = h;

        ctx.clearRect(0, 0, w, h);
        const space = w - 2 * MARGIN;
        if (space < MARGIN) return;   // Too narrow to paint anything useful.

        ctx.strokeStyle = "#333";
        ctx.fillStyle = "#999";
        ctx.beginPath();
        ctx.rect(MARGIN, 0, space, h);
        ctx.fill();
        ctx.stroke();

        const { min, max } = normalize(this.props.min, this.props.max);
        const a = MARGIN + space * min;
        const b = MARGIN + space * max;
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#000");
        grad.addColorStop(1, this.props.color);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.rect(a,0, b - a, h);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "#fff5";
        ctx.rect(a,0, b - a, h * .5);
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(w,0);
        ctx.moveTo(0,h);
        ctx.lineTo(w,h);
        ctx.stroke();

    }

    componentDidUpdate() {
        this.paint();
    }

    render() {
        return (<div className="webBrayns-view-Range">
            <div style={{ margin: `0 ${MARGIN}px`}}>
                <Label label={this.props.label} />
            </div>
            <canvas ref={this.refCanvas} height="32"></canvas>
        </div>)
    }
}


function clamp(v: number, min: number = 0, max: number = 1): number {
    if (v < min) return min;
    if (v > max) return max;
    return v;
}


function normalize(min: number, max: number): { min: number, max: number } {
    let a = clamp(min);
    let b = clamp(max);
    if (a > b) {
        const tmp = a;
        a = b;
        b = tmp;
    }

    return { min: a, max: b };
}
