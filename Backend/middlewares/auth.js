import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    // this token we will generate from the utils folder.
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHandler("User Not Authorized", 401));
    }

    // this will make sure check that the TOKEN is generated from our SECRET key after that he will able to authrized.
    // this decoded will contain the USER_ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // first we find our user and then after it we will save he user in our model.
    req.user = await User.findById(decoded.id);

    next();
});