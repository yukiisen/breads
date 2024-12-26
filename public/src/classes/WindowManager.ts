import { $, Init } from "../lib/dom";
import { Component, TemplateFunction } from "./Component";


// TODO: hopefully, if you consider coming back one day, 
// please write some comments because I don't understand a shit even though I just wrote this now.
export class WindowManager {
    private windows: [symbol, Window][] = [];
    private activeWindow: Window | null = null;
    constructor (private parent: Init = $("section.dialogues"), private animationDuration: number = 200) {
        this.parent.setProperty("animationDuration", this.animationDuration + 'ms');
        this.parent.on("click", ({ target }) => {
            if (target === this.parent.e) {
                this.activeWindow!.init?.toggleClass('visible');
                setTimeout(() => {
                    this.hideParent(); 
                    this.activeWindow!.remove(); 
                    this.activeWindow = null; 
                }, animationDuration - 50);
            }
        });
    }

    private showParent () { this.parent.class = ["visible"] }
    private hideParent () { this.parent.e.classList.remove('visible') }

    display (token: symbol) {
        const window = (this.windows.find(([ id ]) => id === token) || [])[1];
        if (!window) return false;
        window.render(this.parent);
        if (!window.rendered) throw new Error("Window not rendered!");
        this.showParent();
        setTimeout(() => window.init?.toggleClass('visible'), this.animationDuration - 50);
        window.OnPop();
        this.activeWindow = window;
        return true;
    }

    CreateWindow <T extends Window>(window: T): symbol {
        const windowIdentifier = Symbol();
        this.windows.push([windowIdentifier, window]);
        return windowIdentifier;
    }
}

export abstract class Window extends Component {
    constructor (template: TemplateFunction) {
        super(template);
    }

    abstract OnPop (): void
}