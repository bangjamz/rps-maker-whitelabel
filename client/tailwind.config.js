/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Professional color palette - Navy & Slate theme
                primary: {
                    50: '#f4f7fb',
                    100: '#e4ebf5',
                    200: '#c3d5ea',
                    300: '#91b5db',
                    400: '#588fc8',
                    500: '#316eb1',
                    600: '#00295f', // Main Brand Color
                    700: '#00224f',
                    800: '#001c40',
                    900: '#001736',
                    950: '#000f24',
                },
                accent: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
            }
        },
    },
    plugins: [],
}
