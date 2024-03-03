import {defineEventHandler, H3Event, type Router} from "h3";
import {type APIResponse, Status} from "~/types";
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

    get identifier() {
        return this.identity
    }
}

export async function useSSE(event: H3Event) {
    const id = ulid()
    const stream = new Stream(event, id)
    return {stream, id}
}

export function useController(folderName: string, router: Router) {
    router.use('/**', defineEventHandler((event: H3Event) => {
        useFileLogger(`Unknown route: [${event.method}] ${event.path} was attempted to be accessed`, {type: 'debug'})
        return useHttpEnd(event, null, 404)
    }))

    return useBase(`/${folderName}`, router.handler)
}