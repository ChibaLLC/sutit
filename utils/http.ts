import {H3Event} from "h3";
import {type APIResponse, Status} from "~/types";

export async function useHttpResponse(event: H3Event, data?: Object, status: number = 200): Promise<void> {
    const response = {} as APIResponse
    response.statusCode = status
    response.body = data

    await event.respondWith(new Response(JSON.stringify(response), {status: status}))
}

export function useHttpEnd(event: H3Event, data: Object | null, status?: number): void {
    const end = () => {
        event.node.res.statusCode = status ?? 204
        event.node.res.end()
    }

    if (!data) return end()

    useHttpResponse(event, data, status ?? 200)
        .then(end)
        .catch((err) => {
            console.error(err || 'Unable to end request; useHttpEnd')
            end()
        })
}

class Stream {
    private readonly _event: H3Event | undefined;

    constructor(event: H3Event) {
        this._event = event;
        this.flushHeaders()
    }

    private flushHeaders() {
        if (!this._event) throw new Error('Event is not defined')
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