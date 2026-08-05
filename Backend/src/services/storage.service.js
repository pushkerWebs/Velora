import ImageKit from "@imagekit/nodejs";
import { CONFIG } from "../config/config.js";


const client = new ImageKit({
    privateKey: CONFIG.IMAGEKIT_PRIVATE_KEY,

})

export async function uploadFile(buffer,fileName,folder){
    const result = await client.files.upload({
        file:await ImageKit.toFile(buffer)    ,
        fileName,
        folder
    })
    return result
}