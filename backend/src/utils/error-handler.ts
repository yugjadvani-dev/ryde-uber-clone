export class AppError extends Error {
    statusCode: number;
    status: string;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    }
}

export const handleError = (error: any, res: Response) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
};