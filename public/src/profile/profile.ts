import { $ } from "../lib/dom";
import { createGetURL } from "../lib/helpers";
import { url } from "../lib/url";

import { AppComponent } from "../classes/Component";
import { WindowManager } from "../classes/WindowManager";

import Post from "../classes/Post";
import EditProfile from "../classes/windows/EditProfile";

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
        
        console.log(this);
    }

    initializeWindowManager () {
        const EditProfileWindow = this.WindowManager.CreateWindow(new EditProfile);
        this.tokens.push(["editprofile", EditProfileWindow]);
        if (url.current(["/profile/", "/profile"])) { 
            this.bindAction('#edit', () => { this.WindowManager.display(EditProfileWindow) }) 
        };

        // this function only displays the dialog in the page, remove it after testing.
        tests(this);
    }

    async getUserPosts (username: string): Promise<UserPosts> {
        const res = await fetch(createGetURL("/API/posts", { method: "user", username }));
        if (res.status === 200) return await res.json();
        return [];
    }
}

$.ready(() => new App);

function tests (app: App) { app.WindowManager.display(app.tokens[0][1]); }