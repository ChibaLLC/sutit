function checkVercel() {
    return !!(process.env.VERCEL || process.env.NOW_REGION);
}

/** Detect whether the app is running on Vercel */
export const isVercel = checkVercel();