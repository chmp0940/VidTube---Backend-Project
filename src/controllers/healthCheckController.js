import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// This is an asynchronous function wrapped with asyncHandler. The asyncHandler ensures that any errors thrown inside the healthcheck function are caught and passed to the next middleware.

const healthcheck = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,"OK","Health check passed"))  // creating Object for api response as it has class and passing the necessary arguements
}) ;
 export {healthcheck}

 // The function returns a response with a status code of 200 (OK).
// It sends a JSON response created using the ApiResponse class:
// new ApiResponse(200, "OK", "Health check passed") creates an instance of ApiResponse with:
// statusCode: 200
// data: "OK"
// message: "Health check passed"