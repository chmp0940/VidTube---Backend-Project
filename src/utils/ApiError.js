class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
    // The stack property in an error object contains the stack trace, which is a string that provides information about the sequence of function calls that led to the error. This is useful for debugging purposes.
  ) {
    super(message); //constructor called from error class
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.suceess = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    }
    // This checks if a stack value is provided when the ApiError instance is created.
    // If a stack value is provided, it assigns this value to this.stack. This allows you to manually set the stack trace if you have a specific one you want to use.
    else {
      Error.captureStackTrace(this, this.constructor);
    }
    //f no custom stack trace is provided, Error.captureStackTrace ensures that the stack trace is automatically captured from the point where the ApiError is instantiated(instance of class (creating object of class)). This helps in debugging by showing the sequence of function calls that led to the error.
  }
}

export { ApiError };
