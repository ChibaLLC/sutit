import {defineEventHandler, H3Event, type Router} from "h3";
import {useBase} from "h3";
import {ulid} from "ulid";

export function useHttpEnd(event: H3Event, data: APIResponse | null, status?: number) {
    if (data) return event.respondWith(new Response(JSON.stringify(data), {
        status: status ?? 200,
        headers: {'Content-Type': 'application/json'}
    }))
    return event.respondWith(new Response(null, {status: status ?? 200}))
}

export class Stream {
    private readonly _event: H3Event | undefined;
    private readonly headersSent: boolean = false;
    private readonly identity: string | null = null;

    constructor(event: H3Event, identity: string) {
        this._event = event;
        this.flushHeaders()
        this.headersSent = true;
        this.identity = identity;
    }

    private flushHeaders() {
        if (!this._event) throw new Error('Event is not defined')
        if (this.headersSent) return;
        this._event.node.res.setHeader('Content-Type', 'text/event-stream');
        this._event.node.res.setHeader('Cache-Control', 'no-cache');
        this._event.node.res.setHeader('Connection', 'keep-alive');
        this._event.node.res.flushHeaders();
        this.send({
            statusCode: Status.noContent
        } as APIResponse)
    }

    send(chunk: APIResponse) {
        this._event!.node.res.write(JSON.stringify(chunk));
    }

    end() {
        this._event!.node.res.end();
    }

    get id() {
        return this.identity
    }
}

export async function useSSE(event: H3Event, id: string | null = null) {
    id = id || ulid()
    return new Stream(event, id)
}

export function useController(folderName: string, router: Router) {
    router.use('/**', defineEventHandler((event: H3Event) => {
        log.warn(`Unknown route: [${event.method}] ${event.path} was attempted to be accessed`)
        return useHttpEnd(event, null, 404)
    }))

    return useBase(`/${folderName}`, router.handler)
}

export function createResponse({ statusCode = 200, data, headers, statusMessage }: {
    statusCode?: number;
    statusMessage?: string;
    data?: any,
    headers?: Record<string, string>
}) {
    let inferred: Record<string, string> = {}
    switch (typeof data) {
        case 'string':
            inferred = { 'Content-Type': 'text/plain' }
            break
        case 'object':
            inferred = { 'Content-Type': 'application/json' }
            data = JSON.stringify(data)
            break
        case 'number':
        case 'boolean':
        case "bigint":
        case "symbol":
            inferred = { 'Content-Type': 'text/plain' }
            data = data.toString()
            break
        case 'function':
            const result = data()
            if (result instanceof Response) return result
            return createResponse({ statusCode, data: result, headers: headers })
        default:
            inferred = {}
    }

    return new Response(data, {
        status: statusCode,
        statusText: statusMessage || undefined,
        headers: new Headers({ ...headers, ...inferred })
    })
}

export function safeEventHandler(func: (event: H3Event) => any){
    const safe = (event: H3Event) => {
        try {
            return func(event)
        } catch (error: any) {
            log.error(error)
            return createError({
                statusCode: 500,
                data: error,
                message: error?.message ||  "Unknown Internal Server Error"
            })
        }
    }
    return defineEventHandler(safe)
}