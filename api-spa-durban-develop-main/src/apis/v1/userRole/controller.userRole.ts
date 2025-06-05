// src/controllers/userController.ts
import { Request, Response } from "express"
import userRole from "./schema.userRole"
import { AuthenticatedRequest } from "../../../utils/interface"

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  // Implement your logic to create a user
  let created = await userRole.create({ ...req.body })
  return res.status(201).json({
    message: "User created successfully",
    data: created,
    success: true,
  })
}
export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  // Implement your logic to create a user
  // let result = await userRole.aggregate([
  //   {
  //     $match: {
  //       roleName: "Admin",
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "user",
  //       foreignField: "_id",
  //       as: "user",
  //       pipeline: [
  //         {
  //           $project: {
  //             name: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  // ]);
  let totalCount = await userRole.countDocuments({ roleName: "Admin" }).exec()

  // let result = await userRole
  //   .find({ roleName: "Admin" })
  //   .limit(100)
  //   .lean()
  //   .populate({
  //     path: "user",
  //     model: "user",
  //     select: "firstName lastName",
  //   })
  //   .exec();
  const pipeline = [
    { $match: { roleName: "Admin" } },
    {
      $lookup: {
        from: "users", // The collection to join with
        localField: "user", // Field from the current collection
        foreignField: "_id", // Field from the 'users' collection
        as: "userData", // Alias for the joined data
      },
    },
    { $limit: 100 }, // Limit the number of results
    {
      $project: {
        _id: 1,
        roleName: 1,
        user: { $arrayElemAt: ["$userData", 0] }, // Assuming one-to-one relationship
      },
    },
  ]

  // Perform the aggregation pipeline
  let result = await userRole.aggregate(pipeline).exec()

  return res.status(200).json({
    message: "successfully",
    data: result,
    totalCount: totalCount,
    success: true,
  })
}
