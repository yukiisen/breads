import EventEmmiter from "../classes/EventEmmiter";

type ProfileEvents = {
    "profile.update": () => void
}

export const ProfileEvents = new EventEmmiter<ProfileEvents>