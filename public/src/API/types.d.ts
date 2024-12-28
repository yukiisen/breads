type singupInput = loginInput & {
    rePassword: string
    email?: string
}

type loginInput = {
    username: string
    password: string
}

type availableName = {
    exists: boolean
    error: boolean
}

type mail = string
type base64 = string

interface ProfileEditShema {
    username: string
    name: string
    picture?: base64
    bio: string | null
    email: mail
}

namespace API {
    interface ProfileData {
        username: string
        name: string
        bio: string
        picture: string
        email: string
        verified: boolean
        github: boolean
    }
}

