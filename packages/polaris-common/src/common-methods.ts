import { performance } from 'perf_hooks'
export const runAndMeasureTime = async (run: any) => {
    let t0 = performance.now();

    let returnValue = await run();

    let t1 = performance.now();

    return {returnValue: returnValue, time: t1 - t0};
};
