import { $, Init } from "../../lib/dom";
import { Window } from "../WindowManager";

export default class ImagePreview extends Window {
    protected parent?: Init;
    constructor () { super(PreviewTemplate) }

    OnPop() {}

    RenderComponent() {
        const { src } = <HTMLImageElement>$(".profile img.pfp").e
        return { src };
    }
    
    PostRender() {}
    preDestroy() {}
}

type PreviewTemplate = { src: string }
function PreviewTemplate (options: PreviewTemplate) {
    return (`<img src="${options.src.replace(/(min|mid)/i, "original")}" class="pfp preview window"></img>`);
}