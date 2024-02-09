import {defineEventHandler, H3Event, type Router} from "h3";
import {type APIResponse, Status} from "~/types";
import {useBase} from "h3";

export function useHttpEnd(event: H3Event, data: APIResponse | null, status?: number) {
    if (data) return event.respondWith(new Response(JSON.stringify(data), {status: status ?? 200, headers: {'Content-Type': 'application/json'}}))
    return event.respondWith(new Response(null, {status: status ?? 200}))
}

export class Stream {
    private readonly _event: H3Event | undefined;
    private headersSent: boolean = false;

    constructor(event: H3Event) {
        this._event = event;
        this.flushHeaders()
        this.headersSent = true;
    }

    private flushHeaders() {
        if (!this._event) throw new Error('Event is not defined')
        if(this.headersSent) return;
        this._event.node.res.setHeader('Content-Type', 'text/event-stream');
        this._event.node.res.setHeader('Cache-Control', 'no-cache');
        this._event.node.res.setHeader('Connection', 'keep-alive');
        this._event.node.res.flushHeaders();

        this._event.node.res.writeHead(Status.success); // will this error due to flushHeaders?
        this._event.node.res.write(JSON.stringify({
            statusCode: Status.noContent
        } as APIResponse))
    }

    send(chunk: any) {
        if (typeof chunk !== 'string') chunk = JSON.stringify(chunk);
        this._event!.node.res.write(chunk);
    }

    end() {
        this._event!.node.res.end();
        this._event!.node.res.destroy();
    }
}

export function useSSE(event: H3Event): Stream {
    return new Stream(event)
}

export function useController(folderName: string, router: Router) {
    router.use('/*', defineEventHandler((event: H3Event) => {
        useFileLogger(`Unknown route: [${event.method}] ${event.path} was attempted to be accessed`, {type: 'debug'})
        return useHttpEnd(event, null, 404)
    }))

    return useBase(`/${folderName}`, router.handler)
}

export function baseRouter(base: string, router: Router) {
    router.use("/*", defineEventHandler((event: H3Event) => {
        useFileLogger(`Unknown route: [${event.method}] ${event.path} was attempted to be accessed`, {type: 'debug'})
        return useHttpEnd(event, null, 404)
    }))

    return useBase(base, router.handler)
}