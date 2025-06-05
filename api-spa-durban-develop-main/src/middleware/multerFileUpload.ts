import multer, { FileFilterCallback } from "multer"
import path from "path"
import fs from "fs"
import { Request, Response, NextFunction } from "express"
import { v4 as uuidv4 } from "uuid"
import {
  imageMimetype,
  videoMimetype,
  documentMimeType,
  allMimetype,
} from "../helper/mimeTypes"
import { AllFileTypeEnum } from "../utils/enumUtils"

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    req.body = JSON.parse(JSON.stringify(req.body))

    const folderName = req.baseUrl.replace("/", "")
    const newFilePath = path.join(__dirname, "../../public/uploads")

    if (!fs.existsSync(newFilePath)) {
      fs.mkdirSync(newFilePath, { recursive: true })
    }

    cb(null, newFilePath) // Make sure 'newFilePath' is a valid string path
  },
  filename: (req, file, cb) => {
    const uuid = uuidv4()
    cb(null, `${file.fieldname}-${uuid}${path.extname(file.originalname)}`)
  },
})

//img error start
let errorFiles = []

export const imgError = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  errorFiles = []
  next()
}
//img error end

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const { fileType } = req.body
  const fileData = file.mimetype
  let mimeTypeToCheck: string[] = []

  switch (fileType) {
    case AllFileTypeEnum.image:
      mimeTypeToCheck = imageMimetype
      break
    case AllFileTypeEnum.video:
      mimeTypeToCheck = videoMimetype
      break
    case AllFileTypeEnum.document:
      mimeTypeToCheck = documentMimeType
      break
    default:
      mimeTypeToCheck = allMimetype
      break
  }

  if (!mimeTypeToCheck.includes(fileData)) {
    return cb(new Error(`Only ${fileType?.toLowerCase()} files are allowed!`))
  }

  cb(null, true)
}

export const fileUpload = multer({
  storage,
  fileFilter,
  // limits: {
  //   fileSize: 1024 * 1024 * 5, // 5MB file size limit
  // },
})

export const removeFile = (req: Request, res: Response, next: NextFunction) => {
  next()
}
