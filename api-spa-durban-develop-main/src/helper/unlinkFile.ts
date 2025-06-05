import fs from "fs"
import path from "path"
import config from "../../config/config" // Adjust the import based on your config file's structure

interface UnlinkFileResponse {
  status: boolean
  message: string
}

export const unlinkFile = async (
  fileUrl: string
): Promise<UnlinkFileResponse> => {
  if (fileUrl && fileUrl !== "") {
    try {
      if (fs.existsSync(fileUrl)) {
        await fs.promises.unlink(fileUrl)
        return { status: true, message: "All Ok" }
      }
      return { status: false, message: "File not found." }
    } catch (error: any) {
      return { status: false, message: `Error deleting file: ${error.message}` }
    }
  }
  return { status: false, message: "File path is required to delete." }
}
