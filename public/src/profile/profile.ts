import { $, _$ } from "../lib/dom";
import { createGetURL } from "../lib/helpers";

import { AppComponent } from "../classes/Component";
import { WindowManager } from "../classes/WindowManager";
import { ProfileEvents } from "./events";

import Post from "../classes/Post";
import EditProfile from "../classes/windows/EditProfile";
import ImagePreview from "../classes/windows/ImagePreview";

class App extends AppComponent {
    readonly postsContainer = $(".posts");
    readonly Posts = new Set<Post>();
    readonly WindowManager = new WindowManager

    PostsData: UserPosts = [];
    username!: string;
    tokens: [string, symbol][] = [];

    constructor () { super(0.5); }

    async onInit () {
        this.username = $(".namex p").content.split("").slice(1).join("");
        this.PostsData = await this.getUserPosts(this.username);
        
        this.PostsData.forEach(post => {
            const self = new Post(post, this.postsContainer);
            self.render();
            this.Posts.add(self);
        });
        
        if (this.Posts.size == 0) {
            $(".profile").class = ["notfull"];
        }

        this.initializeWindowManager();

        ProfileEvents.on("profile.update", this.reloadProfile, this);
        
        console.log(this);
    }

    initializeWindowManager () {
        const EditProfileWindow = this.WindowManager.CreateWindow(new EditProfile);
        this.tokens.push(["editprofile", EditProfileWindow]);
        const ImagePreviewWindow = this.WindowManager.CreateWindow(new ImagePreview);
        this.tokens.push(["pfpPreview", ImagePreviewWindow]);


        this.bindAction(".profile .pfp", () => this.WindowManager.display(ImagePreviewWindow));
        if ($.exists("#edit")) this.bindAction('#edit', () => { this.WindowManager.display(EditProfileWindow) });
    }

    async getUserPosts (username: string): Promise<UserPosts> {
        const res = await fetch(createGetURL("/API/posts", { method: "user", username }));
        if (res.status === 200) return await res.json();
        return [];
    }

    async reloadProfile () {
        try {
            const profile: API.ProfileData = await fetch("/API/profile").then(res => res.json());
            $(".namex p").text(`@${profile.username}`);
            $(".namex h2").text(profile.name);
            $(".bio pre").text(profile.bio);
            $._("img.pfp, .pfp img").do(_ => {
                const image = _.e as HTMLImageElement;
                const { src } = image;
                image.src = image.src.replace(src.match(/\/(original|min|mid)\/(\w+)/i)![2], profile.picture);
            });
        } catch (error) {
            console.error(error);
        }
    }
}

$.ready(() => new App);