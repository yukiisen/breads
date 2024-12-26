interface StorageProviderConfig {
    UPLOAD_FILES: boolean
}

interface appConfig {
    LOGGER: {
        EXCLUDEDROUTES: string[]
    }

    UPLOADS: {
        resizePostedImages: boolean
        profilePictureLimit: string
        postedImageLimit: string
        postedImageSafeLimit: number
        postedVideosLimit: string
    }

    IMAGES: {
        min: number
        mid: number
    }

    STORAGE_PROVIDER: keyof appConfig['PROVIDERS']

    PROVIDERS: {
        GitHub: StorageProviderConfig & {
            UPLOAD_CONFIG: {
                USERNAME: string,
                REPOSITORY: string,
                TOKEN: string
            }
        }

        Drive?: StorageProviderConfig & {
            login_info: {
                email: string
                password: string
            }
        }
    }

    SESSIONSECRETS: string[]
}