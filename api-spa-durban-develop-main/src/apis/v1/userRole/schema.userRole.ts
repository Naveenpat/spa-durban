// model schema starts here
import mongoose from "mongoose"

const userRoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)
// userRoleSchema.index({ roleName: 1, user: 1 });

const searchKeys = ["firstName", "lastName"]
const userRole = mongoose.model("userRole", userRoleSchema)
module.exports.searchKeys = [...searchKeys]
export default userRole
// model schema ends here
