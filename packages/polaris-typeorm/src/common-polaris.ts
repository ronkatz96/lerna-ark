const {performance} = require('perf_hooks');
export const runAndMeasureTime = async (run: any) => {
    let t0 = performance.now();

    let returnValue = await run();

    let t1 = performance.now();

    return {returnValue: returnValue, time: t1 - t0};
};

export interface PolarisContext {
    dataVersion?: number;
    realityId?: number;
    globalDataVersion?: number;
    irrelevantEntities?: any;
    includeLinkedOper?: boolean;
}

export interface TypeORMConfig {
    softDelete?: {
        allow?: boolean;
        returnEntities?: boolean;
    }
}