import { Init } from "../../lib/dom";
import { Window } from "../WindowManager";

export default class ImagePreview extends Window {
    protected parent?: Init;
    constructor () { super(PreviewTemplate) }

    OnPop() {}

    RenderComponent() {
        return {};
    }
    
    PostRender() {}
    preDestroy() {}
}

type PreviewTemplate = { src: string }
function PreviewTemplate (options: PreviewTemplate) {
    return (`<img src="${options.src}" class="pfp"></img>`);
}