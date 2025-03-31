const defaultTheme = require('tailwindcss/defaultTheme')

const colors = [ "red", "green", "blue", "yellow", "purple", "pink", "indigo", "gray", "violet", "orange" ]

function variantsSafelist(colors, numbers = [ 100, 200, 300, 400, 500, 700, 800 ]) {
	const variants = [ 'bg', 'text', 'hover:bg', 'focus:bg', 'focus:ring', 'ring' ];
	let safelist = [];

	for (let color of colors) {
		for (let variant of variants) {
			for (let number of numbers) {
				safelist.push(`${variant}-${color}-${number}`);
			}
		}
	}

	return safelist;
}

module.exports = {
	theme: {
		extend: {
			fontFamily: {
				sans: [ 'Inter var', ...defaultTheme.fontFamily.sans ],
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-out',
				'fade-out': 'fadeOut 0.5s ease-out',
			},
			keyframes: {
				fadeIn: {
					'0%': {
						opacity: '0',
					},
					'100%': {
						opacity: '1',
					},
				},
				fadeOut: {
					'0%': {
						opacity: '1',
					},
					'100%': {
						opacity: '0',
					},
				}
			}
		},
	},

	safelist: [
		...variantsSafelist(colors)
	]
}
