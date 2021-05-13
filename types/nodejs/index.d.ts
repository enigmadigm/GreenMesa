declare namespace NodeJS {
    interface Global {
        xlg: XlgObj;
    }
}

declare const xlg: XlgObj;

interface XlgObj {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log(e: any): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(e: any, err?: Error | undefined): void;
}