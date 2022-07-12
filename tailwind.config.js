/** @type {import('tailwindcss').Config} */

module.exports = {
	content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				'source-sans': ['Source Sans Pro', 'sans-serif'],
			},
			boxShadow: {
				border: '0 0 0 5px rgba(59, 130, 246, 0.25)',
			},
		},
	},
	plugins: [],
};
