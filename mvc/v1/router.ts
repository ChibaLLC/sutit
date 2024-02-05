import authController from "./auth/controller"
import faceBookController from "./facebook/controller"
import formsController from "./forms/controller"
import mpesaController from "./mpesa/controller"
import type {H3Event} from "h3";
import type {APIResponse} from "~/types";

const router = createRouter()

router.use("/status", defineEventHandler((event: H3Event) => {
    const response = {} as APIResponse
    response.statusCode = 200
    response.body = "OK"
    return response
}))

router.use("/auth/*", authController)
router.use("/facebook/*", faceBookController)
router.use("/forms/*", formsController)
router.use("/mpesa/*", mpesaController)

export default baseRouter("/api/v1", router)