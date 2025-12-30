class ApiError extends Error {
    statusCode: number;
    constructor(
        statusCode: number,
        message = "Something went wrong",
    ) {
        super(message)
        this.statusCode = statusCode,
        Error.captureStackTrace(this, this.constructor);
    }
}

export { ApiError }