import EditProfileComponent from "../../../templates/edit-profile";

import { $ } from "../../lib/dom";
import { createGetURL } from "../../lib/helpers";
import { Window } from "../WindowManager";

export default class EditProfile extends Window {
    readonly fs = new FileReader;
    protected parent?: ReturnType<typeof $>;

    /** this is true when the username is available only */
    allowed = false;

    // this is probably useless and you should replace it 
    // or implement it in a different way to prevent memory leaks.
    profile!: ProfileEditShema

    constructor () { super(EditProfileComponent); this.fs.onloadend = this.updatePreview.bind(this) }

    OnPop(): void {}
    
    preDestroy(): void {
        // remove listeners.
        this.init!.$('.preview').off("click", () => this.init!.$("#imagePicker").e.click());
        this.init!.$("#imagePicker").off("change", (e) => this.onFileChange((<HTMLInputElement>e.target).files));
        this.init!.off("submit", (e) => e.preventDefault());
        this.init!.$("#username").off("input", (e) => this.onUsername((<HTMLInputElement>e.target).value));
    }
    
    RenderComponent(): { [key: string]: unknown; } { return {} }

    PostRender() {
        // add listeners for file handling.
        this.init!.$('.preview').on("click", () => this.init!.$("#imagePicker").e.click());
        this.init!.$("#imagePicker").on("change", (e) => this.onFileChange((<HTMLInputElement>e.target).files));
        // set the preview to the user's pfp
        this.init!.$('.preview').setProperty(
            "backgroundImage", 
            `url("${($(".profile .metadata .pfp").e as HTMLImageElement).src}")`
        );
        this.init!.on("submit", (e) => e.preventDefault());
        this.bindAction("#save", this.submitData.bind(this));

        this.init!.$("#username").on("input", (e) => this.onUsername((<HTMLInputElement>e.target).value));
        this.init!.$(".username label").display(false);

        this.fetchData();
    }

    async onUsername (name: string) {
        if (name == this.profile.username) {
            this.allowed = true;
            this.init!.$(".username label").display(false);
            return;
        }

        const res = await fetch(createGetURL("/API/nameavailable", { name }));

        if (res.status !== 200) {
            this.allowed = false;
            this.init!.$(".username label").display(false);
            return;
        }

        const { exists } = await res.json();

        if (!exists) {
            this.allowed = true;
            this.init!.$(".username label").display(false);
        } else {
            this.allowed = false;
            this.init!.$(".username label").display(true);
        }
    }

    async fetchData () {
        const res = await fetch("/API/profile");
        const resBody: API.ProfileData = await res.json();

        this.profile = {
            username: resBody.username,
            name: resBody.name,
            picture: undefined,
            email: resBody.email,
            bio: resBody.bio
        }

        this.init!.$("#username").value = (this.profile.username);
        this.init!.$("#name").value = (this.profile.name);
        this.init!.$("#bio").value = (this.profile.bio || "");
        this.init!.$("#email").value = (this.profile.email);

        if (resBody.verified) this.init?.$("#verify").text("Account Verified").e.setAttribute("disabled", "");
    }

    onFileChange (files: FileList | null) {
        if (!files) return;
        this.fs.readAsDataURL(files[0]);
    }

    updatePreview () {
        const data = this.profile.picture = this.fs.result as string;
        this.init!.$('.preview').setProperty("backgroundImage", `url("${data}")`);
    }

    async submitData () {
        const data: ProfileEditShema = <ProfileEditShema>{};
        if (!this.init?.$("#username").value) return;

        for (const key in this.profile) {
            if (key == "picture") continue;
            data[key as keyof ProfileEditShema] = this.init?.$(`#${key}`).value || "";
        }

        data.picture = this.profile.picture || "";

        const req = JSON.stringify(data);

        const res = await fetch("/API/profile", {
            method: "PATCH",
            body: req,
            headers: {
                'content-type': 'application/json',
            }
        });

        if (res.status == 200) {
            
        } else { location.reload() }
    }
}