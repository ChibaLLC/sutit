/** @type {import('tailwindcss').Config} */
const config = {
    theme: {
        extend: {
            colors: {
                "navy": "#3d5a80",
                "sky": "#98c1d9",
                "light": "#e0fbfc",
                "peach": "#ee6c4d",
                "dark": "#293241"
            },
            fontFamily: {
                'mulish': ['"Mulish"', 'sans-serif'],
                'serif': ['"DM Serif Display"', 'serif'],
                'sans': ['"DM Sans"', 'sans-serif'],
                'mono': ['"DM Mono"', 'monospace'],
            }
        },
    },
    plugins: [],
};

export default config;
