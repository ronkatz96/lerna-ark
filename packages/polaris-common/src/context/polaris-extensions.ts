import { PolarisWarning } from './polaris-warning';

export interface PolarisExtensions {
    globalDataVersion: number;
    irrelevantEntities?: any;
    warnings?: PolarisWarning[];
}
