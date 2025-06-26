export interface RequestHandler {
    handle(request: unknown): Promise<unknown>; 
}

export type AuthenticatedRequest = { userId: string }

export enum Currency {
    GBP = 'GBP',
}
