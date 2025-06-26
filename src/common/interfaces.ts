export interface RequestHandler {
    handle(request: unknown): Promise<unknown>; 
}

export type AuthenticatedRequest = { userId: string }