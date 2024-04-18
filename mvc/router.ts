import authController from './auth/controller'
import dataController from './data/controller'
import formsController from './forms/controller'
import usersController from './users/controller'
import mpesaController from './mpesa/controller'

const router = createRouter()

/** Import your controllers and add them to the app routes below in the same pattern */
router.use("/auth/**", authController)
router.use("/data/**", dataController)
router.use("/forms/**", formsController)
router.use("/users/**", usersController)
router.use("/mpesa/**", mpesaController)

/** This has to be the last route */
router.use("/**", defineEventHandler(event => {
    log.warn(`Unknown route: [${event.method}] ${event.path} was attempted to be accessed`)
    return useHttpEnd(event, null, 404)
}))

export default useBase("/api/v1", router.handler)