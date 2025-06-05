import { Schema, Document } from "mongoose"

function deleteAtPath(obj: any, path: string[], index: number): void {
  const key = path[index]
  if (index === path.length - 1) {
    if (obj && obj.hasOwnProperty(key)) {
      delete obj[key]
    }
    return
  }
  if (obj && obj.hasOwnProperty(key)) {
    deleteAtPath(obj[key], path, index + 1)
  }
}

function toJson(schema: Schema<Document>): void {
  // Retrieve existing toJSON options if they exist
  const toJSONOptions = schema.get("toJSON")

  // Define a default transform function or use existing one
  const transform = (doc: Document, ret: any, options: any) => {
    // Iterate over schema paths and delete private fields
    Object.keys(schema.paths).forEach((path) => {
      const schemaType = schema.paths[path]
      if (schemaType && schemaType.options && schemaType.options.private) {
        deleteAtPath(ret, path.split("."), 0)
      }
    })

    // Convert `_id` to `id` and remove other fields
    if (ret._id) {
      ret.id = ret._id.toString()
      delete ret._id
    }
    delete ret.__v
    delete ret.createdAt
    delete ret.updatedAt
  }

  // Set or update the toJSON options on the schema
  schema.set("toJSON", {
    ...toJSONOptions,
    transform: transform,
  })
}

export default toJson
