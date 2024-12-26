import sharp from "sharp";
import winston from "./logger";
import path from "path";
import config from "../config.json";
const { mid, min } = config.IMAGES

const TEMP = "./temp";
const imageTypes = [ "avif", "webp", "jpeg", "jpg", "png", "svg", "gif" ];

type returnMethod = { accepted: boolean; reason?: string | undefined; }

/**
 * A function to edit the profile pictures before storing them.
 * 
 * should create a cropped image with a size based on the ```config.json``` file and original size.
 * */ 
export async function handleProfileUpload(filename: Buffer, newName: string): Promise<returnMethod>
export async function handleProfileUpload (filename: string | Buffer, newName?: string): Promise<returnMethod> {
    if (typeof filename !== "string" && !newName) return { accepted: false, reason: "invalid input" };
    
    const input = sharp((typeof filename == "string")? path.join(TEMP, filename): filename);

    if (!newName) newName = filename.slice(0, filename.lastIndexOf(".")) + ".webp";
    else newName = `${newName}.webp`;

    try {
        let { width, height, format } = await input.metadata();
            [width, height] = [width || 200, height || 200];

        if (!imageTypes.includes(format || "")) return { accepted: false, reason: "unsupported format" };

        const side = Math.min(width, height);
        const image = input.webp().extract({
            // A square shape.
            width: side,
            height: side,
            top: +((height - side)/2).toFixed(0),
            left: +((width - side)/2).toFixed(0)
        });

        // output files.
        await image.toFile(path.join("./uploads/profiles/original/", newName));
        await image.resize(mid, mid).toFile(path.join("./uploads/profiles/mid/", newName));
        await image.resize(min, min).toFile(path.join("./uploads/profiles/min/", newName));
    } catch (error) {
        winston.error(<Error>error);
        return { accepted: false, reason: "internal error" };
    }

    return { accepted: true };
}

// Resizes only images larger than 1080p (This shouldn't apply to images under 5 megabytes)
export async function handlePostImages (filename: string, newName?: string): Promise<returnMethod> {
    const input = sharp(path.join(TEMP, filename)).webp();

    if (!newName) newName = filename.slice(0, filename.lastIndexOf(".")) + ".webp";
    else newName = `${newName}.webp`;

    try {
        let { width, height, format } = await input.metadata();
            [width, height] = [width || 200, height || 200];

        if (!imageTypes.includes(format || "")) return { accepted: false, reason: "unsupported format" };

        if (width > 1920 || height > 1080) {
            const multiplier = (width/1920)
            input.resize(width/multiplier, height/multiplier);
        }

        // output files.
        await input.toFile(path.join("./uploads/posts/images/", newName));
    } catch (error) {
        winston.error(<Error>error);
        return { accepted: false, reason: "internal error" };
    }
    
    return { accepted: true };
}