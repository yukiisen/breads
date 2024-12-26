import { $ } from "../lib/dom";

export type TemplateFunction = <T extends {}>(Options: T) => string
type Init = ReturnType<typeof $>
type variant = { [key: string]: unknown }
type BindingList = { Init: Init, Obj: { [key: string]: string | number }, property: string }[]

const DOM = new DOMParser();

let GlobalLoaded = false;

$.ready(() => { GlobalLoaded = true });

export abstract class Component {
    rendered: boolean = false;
    init?: Init

    private loopinterval: number | null = null;
    private BindingList: BindingList = [];
    protected abstract parent?: Init

    constructor (private template: TemplateFunction, private updateRate: number = 5) {}


    // TODO: implement auto unsubscribe to prevent memory leaks.
    /**
     * Binds ```action``` to the current component then adds it as a listener to ```selector``` 
     * @returns Whether the binding was successful
     */
    bindAction (selector: string, action: (target: EventTarget) => void, ev: keyof HTMLElementEventMap = "click"): boolean {
        // the component must be rebddered in order to be able to use this function.
        // the second condition is there to remove the ```undefined``` type.
        if ( !this.rendered || !this.init ) return false;

        const func = action.bind(this);
        this.init.$(selector).on(ev, (e) => {
            func(e.target!);
        });

        return true;
    }

    /**Binds a variable to a DOM element */
    bindData <T extends {}>(selector: string, Obj: T, property: keyof T) {
        if ( !this.rendered || !this.init ) return false;
        const Init = this.init.$(selector);
        this.BindingList.push({ Init, Obj, property: <string>property });
        return true;
    }

    /** Must be overriden to return the required options for the template's compilation.*/
    abstract RenderComponent(): { [key: string]: unknown }

    /**Triggered after rendering the component */
    abstract PostRender(): void

    /**
     * @param parent optional parent element to render the component within, not required unless you're using a different design pattern.
     * You probably should consider using a real front end framework instead of this weird code.
     */
    render (parent: typeof this.parent = this.parent) {
        if (!parent) return false;
        if (this.rendered) return true;

        const options = this.RenderComponent();
        const postStr = this.template(options);
        const postElement = <HTMLElement>DOM.parseFromString(postStr, "text/html").body.firstChild!.cloneNode(true);

        parent.append(postElement);

        this.init = $(postElement);
        this.rendered = true;

        this.startLoop();
        this.PostRender();
        return true;
    }

    abstract preDestroy (): void
    /**
     * Removes the Component from the DOM
     * 
     * You must call this method first if you plan for re-rendering the Component.
     */
    remove () {
        if ( !this.rendered || !this.init ) return;
        this.preDestroy();
        this.init.e.remove();
        this.rendered = false;
        if (this.loopinterval) clearInterval(this.loopinterval);
        this.loopinterval = null;
        delete this.init;
    }
    
    /**Can be overriden for more realtime updates like re-fetching data. */
    // TODO: this will usually be async, make sure it's supported.
    protected update () {}

    private startLoop () {
        if (this.updateRate < 0) return;
        this.loopinterval = window.setInterval(async () => {
            for (const bind of this.BindingList) {
                if (bind.Obj[bind.property] != bind.Init.Text) bind.Init.text(bind.Obj[bind.property].toString());
            }

            await Promise.resolve(this.update());
        }, this.updateRate * 1000);
    }

    OnMessage (message: any) {}
}


/**Similar to ```Component``` but used with the whole page, Doesn't require a template or rendering since It uses the existing dom elements in the document. */
export abstract class AppComponent {
    private loopinterval: number | null = null;
    private BindingList: BindingList = [];

    init: Init = $(document.body);

    /**Override this method if you need to make some async calls within the class, otherwise just use the constructor. */
    async onInit (): Promise<void> {}

    constructor (private updateRate: number = 5) {
        this.onInit().then(this.startLoop.bind(this));
    }

    /**Binds a variable to a DOM element */
    bindData <T extends {}>(selector: string, Obj: T, property: keyof T) {
        if ( !GlobalLoaded ) return false;
        const Init = this.init.$(selector);
        this.BindingList.push({ Init, Obj, property: <string>property });
        return true;
    }

    bindAction (selector: string, action: (target: EventTarget) => void, ev: keyof HTMLElementEventMap = "click"): boolean {
        if ( !GlobalLoaded ) return false;

        const func = action.bind(this);
        this.init.$(selector).on(ev, (e) => {
            func(e.target!);
        });

        return true;
    }

    protected update () {}

    private startLoop () {
        if (this.updateRate < 0) return;
        this.loopinterval = window.setInterval(async () => {
            for (const bind of this.BindingList) {
                if (bind.Obj[bind.property] != bind.Init.Text) bind.Init.text(bind.Obj[bind.property].toString());
            }

            await Promise.resolve(this.update());
        }, this.updateRate * 1000);
    }
}

export type ReplaceTypes<T, Replace, ReplaceBy> = { [key in keyof T]: T[key] extends Replace? ReplaceBy : T[key] }
export type BindFunction = (e: EventTarget) => void