import { Request, Response } from "express";
import httpStatus from "http-status";
import ApiError from "../../../../utilities/apiError";
import catchAsync from "../../../../utilities/catchAsync";
import { AuthenticatedRequest } from "../../../utils/interface";
import config from "../../../../config/config";
import { authService, tokenService, userService } from "../service.index";
import { compare } from "bcrypt";

//------------------------------------------------------------

// login user
const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const deviceId = authService.fetchDeviceId(req);
  // Get user
  const { user, outletsData } = await authService.loginUserWithEmailAndPassword(
    email,
    password
  );

  //create tokens and set to redis and send response
  let resposeData = await authService.authenticationProvider(
    user,
    deviceId,
    outletsData
  );
  return res.status(httpStatus.OK).send(resposeData);
});

const loginAuto = catchAsync(async (req: Request, res: Response) => {
  const { bookingUserId } = req.body;

  const deviceId = authService.fetchDeviceId(req);
  // Get user
  const { user, outletsData } = await authService.loginUserWithBookingUserId(
    bookingUserId
  );

  //create tokens and set to redis and send response
  let resposeData = await authService.authenticationProvider(
    user,
    deviceId,
    outletsData
  );
  return res.status(httpStatus.OK).send(resposeData);
});
//------------------------------------------------------------

//get new access token
const refreshTokens = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const deviceId = authService.fetchDeviceId(req);
    const token = authService.fetchToken(req);
    //create tokens and set to redis and send response
    let resposeData = await authService.refreshAuth(token, deviceId);
    return res.status(httpStatus.OK).send(resposeData);
  }
);
//------------------------------------------------------------

//register
const register = catchAsync(async (req: Request, res: Response) => {});
//------------------------------------------------------------

//logout
const logout = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const logOutAll: boolean = req.body.logOutAll || false;

  const deviceId = authService.fetchDeviceId(req);

  const token = authService.fetchToken(req);

  const tokenDoc = (await tokenService.verifyToken(
    token,
    config.jwt_secret_access
  )) as { Id: string };

  const userId = tokenDoc.Id;
  let loggedOutStatus = await authService.logout(userId, deviceId, logOutAll);
  return res.status(httpStatus.OK).send(loggedOutStatus);
});

//------------------------------------------------------------

//forgotPassword
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  let { email } = req.body;
  // Get user and sent otp on the email
  const result = await authService.forgotPassword(email);
  return res.status(httpStatus.OK).send(result);
});
//------------------------------------------------------------

//resetPassword
const resetPassword = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const { Id } = req.userData;
    const deviceId = authService.fetchDeviceId(req);

    if (!Id) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    let updatedResult = await authService.changePassword(
      deviceId,
      Id,
      req.body.newPassword
    );
    return res.status(httpStatus.OK).send(updatedResult);
  }
);
//------------------------------------------------------------

//changePassword
const changePassword = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let { currentPassword } = req.body;

    if (!req.userData) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const { Id } = req.userData;
    const deviceId = authService.fetchDeviceId(req);
    let foundUser: any = await userService?.getUserById(Id);
    let isCorrectPass = await compare(currentPassword, foundUser?.password);
    if (!isCorrectPass) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid current password");
    }
    if (!Id) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }
    let updatedResult = await authService.changePassword(
      deviceId,
      Id,
      req.body.newPassword
    );
    return res.status(httpStatus.OK).send(updatedResult);
  }
);
//------------------------------------------------------------

//sendVerificationEmail
const sendVerificationEmail = catchAsync(
  async (req: Request, res: Response) => {}
);
//------------------------------------------------------------

//verifyEmail
const verifyEmail = catchAsync(async (req: Request, res: Response) => {});
//------------------------------------------------------------

export default {
  login,
  refreshTokens,
  register,
  logout,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  changePassword,
  loginAuto,
};
