// types/api.response.ts

export interface ApiResponse<T> {
    resultType: "SUCCESS";
    error: null;
    data: T;
}

export interface ApiErrorResponse {
    resultType: "FAILED"; // ← matches app.ts
    error: {
        errorCode: string;
        reason: string;
        data?: unknown; // ← optional extra context (e.g. validation fields)
    };
    data: null;
}

// Union type for any controller return value
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

export const success = <T>(data: T): ApiResponse<T> => ({
    resultType: "SUCCESS",
    error: null,
    data,
});

export const fail = (
    errorCode: string,
    reason: string,
    data?: unknown,
): ApiErrorResponse => ({
    resultType: "FAILED",
    error: {
        errorCode,
        reason,
        ...(data !== undefined && { data }),
    },
    data: null,
});
