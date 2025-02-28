import { $ } from "../lib/dom";
import { Component, ReplaceTypes, BindFunction } from "./Component";

import generatePostComponent from "../../templates/post";

interface PostStructure extends Component {
    liked: boolean
    saved: boolean
    mine: boolean
    postedSince: string
    bigNumToString(num: number): string
    calculateDuration(): string
    RenderComponent(): { post: ReplaceTypes<PostAPIResponse, Date, string>, bigNumToString(num: number): string }
    // DOM interactions:
    like: BindFunction
    save: BindFunction
}

export default class Post extends Component implements PostStructure {
    
    liked: boolean
    saved: boolean
    mine: boolean
    postedSince: string
    
    constructor (private options: PostAPIResponse, protected parent: ReturnType<typeof $>) {
        super(generatePostComponent, 0.5);
        this.liked = options.liked;
        this.saved = options.saved;
        this.mine = options.mine;
        this.postedSince = this.calculateDuration();
    }

    preDestroy(): void {}
    
    PostRender() {
        this.bindAction(".like", this.like);
        this.bindData(".like .count", this.options, "likes");
        this.bindData(".comment .count", this.options, "comments");
        this.bindData(".quote .count", this.options, "reposts");
        this.bindData(".reach .count", this.options, "views");
    }

    RenderComponent () {
        return {
            post: {
                ...this.options,
                content: this.options.content.split("\\n").join("\n"),
                date: this.postedSince
            },
            bigNumToString: this.bigNumToString
        };
    }

    like (e: EventTarget) {}
    save (e: EventTarget) {}

    bigNumToString (num: number) {
        if (num > 1000000) return (num/1000000).toFixed(1) + "M";
        else if (num > 1000) return (num/1000).toFixed(1) + "K";
        else return num.toString();
    }

    calculateDuration () {
        const postMoment = moment(this.options.date);
        const difference = moment().diff(postMoment, "seconds");
        const dur = moment.duration(difference, "seconds");

        if (dur.asYears() >= 1) return dur.asYears().toFixed(0) + " years ago";
        else if (dur.asMonths() > (5/31)) return postMoment.format("DD MMM");
        else if (dur.asDays() > 1.9) return dur.asDays().toFixed(0) + " days ago";
        else if (dur.asDays() > 23/24) return "yesterday";
        else if (dur.asHours() > 12) return postMoment.format("HH:mmA");
        else if (dur.asMinutes() > 60 ) return dur.asHours().toFixed(0) + " hours ago";
        else if (dur.asMinutes() > 1) return dur.asMinutes().toFixed(0) + " minutes ago";
        else return dur.asSeconds() + " seconds ago";
    }
}