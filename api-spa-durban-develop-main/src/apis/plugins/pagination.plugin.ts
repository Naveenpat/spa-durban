import { Schema, Document, PipelineStage } from "mongoose"
import { DateFilter, FilterByItem, RangeFilter } from "../../utils/interface"

interface PaginateOptions {
  sortBy?: string
  populate?: string
  limit?: number
  page?: number
  search?: Object
  dateFilter?: DateFilter | undefined
  filterBy?: FilterByItem | undefined
  rangeFilterBy?: RangeFilter | undefined
  additionalQuery?: PipelineStage[]
  isPaginationRequired?: boolean | undefined
}

interface PaginateResult<T extends Document> {
  data: T[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
}

function paginate<T extends Document>(schema: Schema<T>): void {
  schema.statics.paginate = async function (
    filter: Record<string, any> = {},
    options: PaginateOptions = {}
  ): Promise<PaginateResult<T>> {
    // Merge search query with existing filter

    let deletedCheck = { isDeleted: false }

    const finalFilter = {
      ...deletedCheck,
      ...filter,
      ...options.search,
      ...options.dateFilter,
      ...options.filterBy,
      ...options.rangeFilterBy,
    }

    const additionalQuery: PipelineStage[] = options.additionalQuery || []

    const pipeline: PipelineStage[] = [{ $match: finalFilter }]

    if (options.sortBy) {
      const sortingCriteria = options.sortBy.split(",").map((sortOption) => {
        const [key, order] = sortOption.split(":")
        return { [key]: order === "desc" ? -1 : 1 }
      })
      pipeline.push({ $sort: Object.assign({}, ...sortingCriteria) })
    } else {
      pipeline.push({ $sort: { createdAt: 1 } })
    }

    options.limit = options.limit ? Number(options.limit) : 10
    let limit = options.limit && options.limit > 0 ? options.limit : 10
    const page = options.page && options.page > 0 ? options.page : 1
    const skip = (page - 1) * limit

    const countPipeline: PipelineStage[] = [
      { $match: finalFilter },
      { $count: "totalResults" },
    ]
    const countPromise = this.aggregate(countPipeline).exec()
    const [countResults] = await Promise.all([countPromise])

    pipeline.push({ $skip: skip })
    options.isPaginationRequired =
      options.isPaginationRequired !== undefined &&
      options.isPaginationRequired !== null
        ? options.isPaginationRequired
        : true

    if (options.isPaginationRequired === true) {
      pipeline.push({ $limit: limit })
    } else {
      if (
        countResults &&
        countResults.length &&
        countResults[0]?.totalResults
      ) {
        pipeline.push({ $limit: countResults[0]?.totalResults })
      } else {
        pipeline.push({ $limit: limit })
      }
    }

    // Add additionalQuery stages after limit
    pipeline.push(...additionalQuery)
    //
    const docsPromise = this.aggregate(pipeline).exec()

    const [docs] = await Promise.all([docsPromise])

    const totalResults =
      countResults.length > 0 ? countResults[0].totalResults : 0
    const totalPages = Math.ceil(totalResults / limit)

    return {
      data: docs,
      page,
      limit,
      totalPages,
      totalResults,
    }
  }
}

export { paginate, PaginateOptions, PaginateResult }
