//higher order function takes function
//The asyncHandler function is a higher-order function designed to handle asynchronous route handlers in Express.js. It simplifies error handling for asynchronous code by automatically catching errors and passing them to the next middleware (typically an error-handling middleware)

const asyncHandler=(reqestHandler)=>{
 return (req,res,next)=>{
Promise.resolve(reqestHandler(req,res,next)).catch((err)=> next(err))
 }
}

export {asyncHandler}