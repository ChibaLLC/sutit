const router = createRouter()

router.use("/callback", defineEventHandler((event) => {
    console.log(event)

    return "OK"
}))

export default useController("mpesa", router)