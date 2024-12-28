type variant = {
    [key: string]: unknown
}

type display = "inline" | "block" | "flex" | "inline-flex" | "inline-block" | "grid"

/**Only for usage as a type. */
export class Init {
    private _display: boolean | string;
    public e: HTMLElement;
    constructor (private Element: HTMLElement, private selector?: string) {
        this._display = true;
        this.e = Element;
    }

    /**@deprecated use ```Init.prototype.content``` instead */
    get Text () {
        return this.Element.innerText;
    }

    get content () {
        return this.Element.innerText;
    }

    get HTML () {
        return this.Element.innerHTML;
    }

    get value () {
        if (this.Element instanceof HTMLInputElement || this.Element instanceof HTMLTextAreaElement) return this.Element.value;
        else return '';
    }

    set value (value: string) {
        (this.Element as HTMLInputElement).value = value;
    }

    get Display () {
        return this._display;
    }

    display (display: boolean | display) {
        switch (display) {
            case false:
                this.Element.style.display = 'none';
            break;

            case true:
                this.Element.style.display = 'block';
            break;

            default:
                this.Element.style.display = display;
            break;
        }

        this._display = display;
        
        return this;
    }
    
    importantDisplay (display: boolean | display) {
        switch (display) {
            case false:
                this.Element.style.display = 'none !important';
            break;

            case true:
                this.Element.style.display = 'block !important';
            break;

            default:
                this.Element.style.display = display + ' !important';
            break;
        }

        this._display = display;
        
        return this;
    }

    text (content: string) {
        this.Element.innerText = content;
        return this;
    }

    append (child: HTMLElement | this | string | Node) {
        if (child instanceof Init) {
            this.Element.appendChild(child.Element);
        } else if (typeof child !== "string") {
            this.Element.appendChild(child);
        } else {
            this.Element.innerHTML += child;
        }

        return this;
    }

    prepend (child: HTMLElement | this | string | Node) {
        if (child instanceof Init) {
            this.Element.prepend(child.Element);
        } else if (typeof child !== "string") {
            this.Element.prepend(child);
        } else {
            this.Element.innerHTML = child + this.Element.innerHTML;
        }
        
        return this;
    }

    clone () {
        return new Init(this.Element.cloneNode() as HTMLElement, this.selector);
    }

    setJSON (json: variant) {
        this.Element.setAttribute('json', JSON.stringify(json));
        return this;
    }

    getJSON (): variant {
        return JSON.parse(this.Element.getAttribute('json') || '{}');
    }

    on <K extends keyof HTMLElementEventMap>(event: K, handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void) {
        this.Element.addEventListener(event, handler);
    }

    once <K extends keyof HTMLElementEventMap>(event: K, handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void) {
        this.Element.addEventListener(event, handler, { once: true });
    }

    off <K extends keyof HTMLElementEventMap>(event: K, handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void) {
        this.Element.removeEventListener(event, handler);
    }

    setProperty <K extends keyof CSSStyleDeclaration>(property: K, value: CSSStyleDeclaration[K]) {
        this.Element.style[property] = value;
        return this;
    }

    removeProperty <K extends keyof CSSStyleDeclaration>(property: K) {
        this.Element.style[property] = '' as CSSStyleDeclaration[K];
        return this;
    }

    set class (className: string[]) {
        this.Element.classList.add(...className);
    }

    get class () {
        return Array.from(this.Element.classList);
    }

    toggleClass (classname: string) {
        this.Element.classList.toggle(classname);
        return this;
    }

    $ (selector: string) {
        const e = <HTMLElement>(this.selector? document : this.Element).querySelector((this.selector? this.selector + ' ' : '') + selector);
        return new Init(e, (this.selector? this.selector + ' ' : '') + selector);
    }
}

class Inits extends Array<Init> {
    constructor (parts: Init[], arrayLength: number = 0) {
        super(arrayLength);

        this.push(...parts);
    }

    do (cb: (e: Init) => void) {
        this.forEach(e => cb(e));
    }
}

export function _$(selector: string) {
    const e = <NodeListOf<HTMLElement>>document.querySelectorAll(selector);
    const result: Init[] = [];

    e.forEach(e => {
        result.push(new Init(e, selector));
    });

    return new Inits(result);
}

export function $ (selector: string | HTMLElement) {
    if (typeof selector == "string") {
        const e = document.querySelector<HTMLElement>(selector)!;
        return new Init(e, selector);
    } else {
        return new Init(selector);
    }
    
}

$.exists = (selector: string) => Boolean(document.querySelector(selector));

$.ready = function (listener: () => void) {
    window.addEventListener("DOMContentLoaded", listener);
}

$._ = (selector: string) => _$(selector);

