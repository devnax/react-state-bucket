export type BucketOptions = {
    store?: "memory" | "session" | "local" | "url";
};
export declare const createBucket: <IT extends {
    [key: string]: any;
}>(initial: IT, option?: BucketOptions) => {
    (): {
        set: <T extends keyof IT>(key: T, value: IT[T]) => void;
        get: <T extends keyof IT>(key: T) => IT[T];
        delete: <T extends keyof IT>(key: T) => void;
        clear: () => void;
        getState: () => IT;
        setState: (state: Partial<IT>) => void;
        isChange: <T extends keyof IT>(key: T) => boolean | undefined;
        getChanges: () => string[];
        clearChanges: () => void;
    };
    set: <T extends keyof IT>(key: T, value: IT[T]) => void;
    get: <T extends keyof IT>(key: T) => IT[T];
    delete: <T extends keyof IT>(key: T) => void;
    clear: () => void;
    getState: () => IT;
    setState: (state: Partial<IT>) => void;
    isChange: <T extends keyof IT>(key: T) => boolean | undefined;
    getChanges: () => string[];
    clearChanges: () => void;
};
