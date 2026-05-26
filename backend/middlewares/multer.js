import multer from "multer";
import fs from "fs";

let storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        if (!fs.existsSync("./public")) {
            fs.mkdirSync("./public", { recursive: true });
        }
        cb(null,"./public")
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})

const upload = multer({storage})

export default upload