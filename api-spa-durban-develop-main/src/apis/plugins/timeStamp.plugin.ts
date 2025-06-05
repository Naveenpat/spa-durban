import { getFormattedTimestamp } from "../../utils/utils"
import { Schema } from "mongoose"

// Plugin to add createdAt and updatedAt fields to a schema
function timeStamp(schema: Schema): void {
  // Add the fields to the schema
  schema.add({
    createdAt: { type: String, default: getFormattedTimestamp },
    updatedAt: { type: String, default: getFormattedTimestamp },
  })

  // Middleware to update the updatedAt field on document save
  schema.pre("save", function (next) {
    const now = getFormattedTimestamp()
    ;(this as any).updatedAt = now
    if (!(this as any).createdAt) {
      ;(this as any).createdAt = now
    }
    next()
  })
}

export default timeStamp
