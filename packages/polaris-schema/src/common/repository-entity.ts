export interface RepositoryEntity {
    id: string;
    deleted: boolean;
    createdBy: string;
    creationTime: Date;
    lastUpdatedBy?: string;
    lastUpdateTime?: Date;
    realityId: number;
}
