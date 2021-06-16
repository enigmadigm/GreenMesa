declare namespace NodeJS {
    interface Global {
        xlg: XlgObj;
    }
}

declare const xlg: XlgObj;

interface XlgObj {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log(message?: any, ...optionalParams: any[]): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(message?: any, ...optionalParams: any[]): void;
}