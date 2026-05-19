export interface ApiResponse<T> {
    resultType: "SUCCESS";
    error: null;
    data: T;
}
export const success = <T>(data: T): ApiResponse<T> => ({
    resultType: "SUCCESS",
    error: null,
    data,
});

export interface ApiErrorResponse {
    resultType: "FAIL";
    error: {
        errorCode: string;
        reason: string;
    };
    data: null;
}

export const fail = (errorCode: string, reason: string): ApiErrorResponse => ({
    resultType: "FAIL",
    error: {
        errorCode,
        reason,
    },
    data: null,
});
