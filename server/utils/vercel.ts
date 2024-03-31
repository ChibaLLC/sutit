function checkVercel() {
    return !!(process.env.VERCEL || process.env.NOW_REGION);
}

export const isVercel = checkVercel();