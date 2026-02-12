import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"



// token generation

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}


// const generateAccessAndRefreshToken = async (userId) => {
//     try {
//         console.log("TOKEN GEN USER ID:", userId);

//         const user = await User.findById(userId);
//         console.log("TOKEN GEN USER:", user);

//         const accessToken = user.generateAccessToken();
//         const refreshToken = user.generateRefreshToken();

//         user.refreshToken = refreshToken;
//         await user.save({ validateBeforeSave: false });

//         return { accessToken, refreshToken };
//     } catch (error) {
//         console.error("REAL TOKEN ERROR 👇");
//         console.error(error);
//         throw error; // IMPORTANT: rethrow original error
//     }
// };


//register Logic
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {

        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [
            { username: username.toLowerCase() },
            { email: email.toLowerCase() }
        ]
    });

    if (existedUser) {
        throw new ApiError(400, "User already exists")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(400, "something went wrong")
    }


    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


})

//login logic

const loginUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

    if ((!email && !username) || !password) {
        throw new ApiError(400, "Email or username and password are required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });


    if (!user) {
        throw new ApiError(400, "Register the user first")
    }


    const isMatch = await user.isPasswordCorrect(password);

    if (!isMatch) {
        throw new ApiError(400, "The password is incorrect")
    }


    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully")
        )


})


// logout user

const loggedOutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, "User logged out successfully")
        )



})


// refresh access token


const refreshAccessToken = asyncHandler(async (req, res) => {


    const token = req.cookies.refreshToken || req.body.refreshToken;


    if (!token) {
        throw new ApiError(401, "Unauthorized")
    }


    try {
        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id)


        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        if (token !== user?.refreshToken) {
            throw new ApiError(401, "Invalid Access Token")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(decodedToken._id)


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken
                    },
                    "Access Token Refreshed Successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }
})


// get current user

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "User fetched successfully")
    );
});




export { registerUser, loginUser, loggedOutUser, refreshAccessToken, getCurrentUser }