/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#00E676',
                'primary-dark': '#00C853',
                secondary: '#2979FF',
                accent: '#FFD740',
                'dark-bg': '#1A1A2E',
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
