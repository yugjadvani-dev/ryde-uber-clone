// class ApiError extends Error {
//     constructor(statusCode: number, message = "Something went wrong", errors = [], stack = "") {
//         super(message);
//         this.statusCode = statusCode;
//         this.data = null
//         this.message = message;
//         this.success = false;
//         this.errors = errors;
//
//         if (stack) {
//             this.stack = stack
//         } else {
//             Error.captureStackTrace(this, this.constructor)
//         }
//     }
// }
//
// export default ApiError;


interface ApiError {
    statusCode: number;
    data: any;
    message: string;
    success: boolean;
    errors: any[];
    stack: string;
}

class ApiError extends Error implements ApiError {
    constructor(statusCode: number, message = "Something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError