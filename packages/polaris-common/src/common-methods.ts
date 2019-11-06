import { performance } from 'perf_hooks';

export const runAndMeasureTime = async (run: any) => {
    const t0 = performance.now();
    const returnValue = await run();
    const t1 = performance.now();
    return { returnValue, elapsedTime: t1 - t0 };
};
