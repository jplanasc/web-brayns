import * as React from "react"
import ReactDOM from 'react-dom'
import Icon from "../view/icon"
import Flex from "../layout/flex"
import EscapeHandler from "../escape-handler"
import castString from "../converter/string"
import castBoolean from "../converter/boolean"
import "./dialog.css"

import Button from "../view/button"


import Intl from "../intl";
const _ = Intl.make(require("./dialog.yaml"));

export default {
    /**
    * @param {string|React.ReactElement<any>} message
    * @param {()=>void|null} onClose
    */
    alert,
    /**
    * @param {string} caption - Title and button caption.
    * @param {any} content - Content to display.
    * @return Promise<boolean> Confirmed or not?
    */
    confirm,
    // See alert(...)
    error,
    show,
    wait
};

type IBackgroundEnum = "none" | "dark" | "light"
type IAlignEnum = "TR" | "TL" | "BR" | "BL" | ""

interface IOptions {
    onClose?: () => void;
    closeOnEscape?: boolean;
    icon?: string;
    title?: string;
    content?: string | React.ReactElement<any>;
    footer?: React.ReactElement<any>[] | React.ReactElement<any> | null;
    maxWidth?: number;
    background?: IBackgroundEnum,
    align?: IAlignEnum
}

/**
 * Ensure a string is an enum for modal alignement.
 */
function castAlign(value: any, defaultValue: IAlignEnum): IAlignEnum {
    switch (value) {
        case "TL": return "TL"
        case "TR": return "TR"
        case "BL": return "BL"
        case "BR": return "BR"
        default: return defaultValue
    }
}

/**
 * Ensure a string is an enum for modal background.
 */
function castBackground(value: any, defaultValue: IBackgroundEnum): IBackgroundEnum {
    switch (value) {
        case "none": return "none"
        case "dark": return "dark"
        case "light": return "light"
        default: return defaultValue
    }
}


class Dialog {
    _screen: HTMLElement;
    _options: IOptions;
    footer: React.ReactElement<any>[] | React.ReactElement<any> | null = null;

    constructor(options: IOptions = {}) {
        this._options = Object.assign({
            closeOnEscape: true,
            footer: <Button
                icon="close"
                label = { _('close') }
                flat={ true}
                onClick={() => this.hide()}/>
        }, options);
        this._options.align = castAlign(this._options.align, "")
        this._options.background = castBackground(this._options.background, "dark")
        this._options.closeOnEscape = castBoolean(this._options.closeOnEscape, true)
        this.footer = this._options.footer || null
        const screen = document.createElement("div")
        const classNames = [
            "tfw-factory-dialog",
            `align-${this._options.align}`,
            `background-${this._options.background}`
        ]
        screen.className = classNames.join(" ");
        document.body.appendChild(screen);
        this._screen = screen;
        this.hide = this.hide.bind(this);
        if (this._options.closeOnEscape) {
            EscapeHandler.add(() => this._hide());
        }
    }

    set onClose(slot: () => void) {
        this._options.onClose = slot;
    }

    show() {
        const opt = this._options;
        const title = castString(opt.title, "").trim();
        const icon = castString(opt.icon, "").trim();
        let footer: React.ReactElement<any> | null =
            this.footer ? (<footer className= "thm-bg2 thm-ele-button">{
                this.footer
            }</footer>) : null;
            let header = null;
        if (title.length > 0) {
            header = (
                <header className= "thm-bgPD">
                    { icon.length > 0 ? <Icon content={ icon } /> : null}
                    <div>{title}</div>
                </header>
            )
        }

        ReactDOM.render((
            <div
                className="thm-ele-dialog thm-bg1"
                style={{
                    maxWidth: typeof opt.maxWidth === 'number' ? `${opt.maxWidth}px` : "auto"
                }}>
                {header}
                <div>{opt.content}</div>
                {footer}
            </div>
        ), this._screen);
        setTimeout(() => this._screen.classList.add("show"), 10);
    }

    hide() {
        if (!this._options.closeOnEscape) {
            this._hide();
        } else {
            EscapeHandler.fire();
        }
    }

    _hide() {
        const screen = this._screen;
        screen.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(screen);
        }, 200);
        const onClose = this._options.onClose;
        if (typeof onClose === 'function') {
            requestAnimationFrame(onClose);
        }
    }
}

function alert(content: string | React.ReactElement<any>,
               onClose: (() => void) | undefined = undefined): Promise<void> {
    return new Promise((resolve, reject) => {
        const dialog = new Dialog({ onClose: resolve, content, maxWidth: 420 });
        const close = () => {
            try {
                resolve();
            }
            catch( ex ) {
                console.error("Error in the resolution of tfw/factory/dialog/alert!", ex)
                reject( ex );
            }
            finally {
                dialog.hide();
            }
        }
        dialog.footer = (<Button
            icon="close"
            label={_('close')}
            flat={true}
            onClick={close} />);
        dialog.show();
    });
}

function error(content: string | React.ReactElement<any>,
               onClose: (() => void) | undefined = undefined): Promise<void> {
    return new Promise((resolve, reject) => {
        const dialog = new Dialog({ onClose: resolve, content, maxWidth: 420 });
        const close = () => {
            try {
                resolve();
            }
            catch( ex ) {
                console.error("Error in the resolution of tfw/factory/dialog/error!", ex)
                reject( ex );
            }
            finally {
                dialog.hide();
            }
        }
        dialog.footer = (<Button
            icon="close"
            label={_('close')}
            flat={true}
            onClick={close} />);
        dialog.show();
    });
}

/**
 * ```
 * const isConfirmed = await Dialog.confirm("Delete file", <p>Are you sure?</p>);
 * ```
 * @param caption - Title and button caption.
 * @param content - Content to display.
 */
function confirm( caption: string,
                  content: string | React.ReactElement<any>): Promise<boolean> {
    return new Promise( resolve => {
        const dialog = new Dialog({ title: caption, content });
        const close = (confirmed: boolean) => {
            dialog.hide();
            // Wait a bit to prevent the click from going to the next window.
            window.setTimeout(
                () => resolve( confirmed ),
                300
            )
        };
        dialog.onClose = () => close(false);
        const btnCancel = (<Button
            key="cancel"
            flat={true}
            label={_("cancel")}
            onClick={() => close(false)}/>);
        const btnOK = (<Button
            key="ok"
            warning={true}
            label={caption}
            onClick={() => close(true)}/>);
        dialog.footer = [ btnCancel, btnOK ];
        dialog.show();
    });
}

function show(options: IOptions): Dialog {
    const dialog = new Dialog(options);
    dialog.show();
    return dialog;
}

async function wait(label: string, task: Promise<any>, blocking: boolean = true): Promise<any> {
    if (!blocking) {
        return await task;
    }
    const content = (
        <Flex dir="row" justifyContent="flex-start" alignItems="center" >
            <Icon content="wait" animate={true}/>
            <div>{label}</div>
        </Flex>
    );
    const dialog = new Dialog({ content, footer: null, closeOnEscape: false });
    dialog.show();
    const close = dialog.hide.bind( dialog );
    return new Promise( (resolve, reject) => {
        task.then(
            (result: any) => {
                close();
                resolve( result );
            },
            (error: any) => {
                console.error( error );
                close();
                reject( error );
            }
        );
    });
}
