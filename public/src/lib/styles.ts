type display = "inline" | "block" | "flex" | "inline-flex" | "inline-block"
type variant = { [key: string]: unknown }

interface border {
    color: string
    width: number
    style: "solid" | string
}

interface directions<T> {
    top: T
    left: T
    right: T
    bottom: T
}

interface Style {
    display: display
    border: border | directions<border | "none"> | "none"
    padding: directions<string>
    margin: directions<string>
    color: string
    background: {
        color: string
    }
    width: string
    height: string
}

function applyProperty<K extends {}>(object: K, property: keyof K, value?: string) {
    object[property] = <typeof object[keyof K]><unknown>value || object[property];
}
/*
function hasDirections (O: variant): O is directions<unknown> {
    if (O.top || O.bottom || O.left || O.right) return true;
    else return false;
}*/

export default function applyStyle (e: HTMLElement, style: Partial<Style>) {
    applyProperty(e.style, "display", style.display);
    applyProperty(e.style, "width", style.width);
    applyProperty(e.style, "height", style.height);
    applyProperty(e.style, "color", style.color);
    applyProperty(e.style, "backgroundColor", style.background?.color);
    
    if (typeof style.border == "string") {
        applyProperty(e.style, "border", style.border);
    } //else if (style.border?.color)
}

