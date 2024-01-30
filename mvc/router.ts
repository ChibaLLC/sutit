import {H3Event, defineEventHandler} from 'h3';

const router = createRouter();

router.use('/:version/[...path]', defineEventHandler((event: H3Event) => {
    const version = event.context.params?.version || null;

    if (!version) return useHttpEnd(event, "No REST version defined", 400)

    switch (version) {
        case 'v1':
            return require('./v1').default(event)
        default:
            return useHttpEnd(event, "REST version not found", 404)
    }
}))

export default useBase('/api', router.handler);