import ApiError from "./apiError"
const errorRes = (err: {
  statusCode?: number
  message?: string
  errors?: { [key: string]: { message?: string } }
}) => {
  let i = 1,
    error_msg = "Something went wrong.",
    statusCode = err.statusCode ?? 500
  if (!err.message) {
    for (const key in err.errors) {
      if (err.errors[key]?.message)
        error_msg += `${i++}.${err.errors[key].message}`
    }
  } else {
    error_msg = err.message
  }

  return {
    statusCode,
    resData: {
      message: error_msg,
      status: false,
      data: null,
      code: "ERR",
      issue: "SOME_ERROR",
    },
  }
}

const catchErr = (err: any) => {
  let i = 1,
    error_msg = "Something went wrong.",
    statusCode = err?.statusCode ?? 500
  if (!err.message) {
    for (const key in err.errors) {
      if (err.errors[key]?.message)
        error_msg += `${i++}.${err.errors[key].message}`
    }
  } else {
    error_msg = err.message
  }
  return {
    statusCode,
    resData: {
      message: error_msg,
      status: false,
      data: null,
      code: "ERR",
      issue: "SOME_ERROR",
    },
  }
}

export { errorRes, catchErr }
