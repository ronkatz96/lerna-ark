const {performance} = require('perf_hooks');
export const runAndMeasureTime = async (run) => {
    let t0 = performance.now();

    let returnValue = await run();   // <---- The function you're measuring time for

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