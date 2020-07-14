import { PolarisWarning } from './polaris-warning';
import { IrrelevantEntitiesResponse } from '..';

export interface PolarisExtensions {
    globalDataVersion: number;
    irrelevantEntities?: IrrelevantEntitiesResponse;
    warnings?: PolarisWarning[];
    totalCount?: number;
    snapResponse?: {
        snapshotMetadataId: string;
        pagesIds: string[];
    };
    prefetchBuffer?: any[];
}
