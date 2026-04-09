/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0C831F',
                    50: '#E8F5E8',
                    100: '#C8E6C9',
                    500: '#0C831F',
                    600: '#0A6B19',
                    700: '#085413',
                },
                secondary: {
                    DEFAULT: '#F8F8F8',
                    50: '#FFFFFF',
                    100: '#F8F8F8',
                },
                accent: {
                    yellow: '#FFC233',
                    red: '#E23744',
                    orange: '#FF6B35',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
            },
        },
    },
    plugins: [],
}
