export const getCommonResponse = (
    status: number,
    message: string | any,
    data: any,
    total_records?: Number | any
) => {
    return {
        status: status.toString(),
        message,
        total_records,
        data,
    };
};

export const checkIdOrNull = (value: any) => {
    return value || value === null || (value && value.toString().trim()) === "";
}

export function generateFileUrl(filename: string): string {
    return `http://localhost:3000/uploads/${filename}`;
}
