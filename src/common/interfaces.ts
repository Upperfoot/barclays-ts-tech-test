export interface RequestHandler {
    handle(request: unknown): Promise<unknown>; 
}