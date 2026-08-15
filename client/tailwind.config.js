/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#FBF7EC',
          100: '#F5EDD0',
          200: '#EAD9A1',
          300: '#DFC172',
          400: '#D4A943',
          500: '#C9A84C',
          600: '#B8922A',
          700: '#9A7A22',
          800: '#7C621B',
          900: '#5E4A14',
        },
        charcoal: {
          50:  '#F5F5F5',
          100: '#EBEBEB',
          200: '#D6D6D6',
          300: '#ADADAD',
          400: '#858585',
          500: '#5C5C5C',
          600: '#3D3D3D',
          700: '#2D2D2D',
          800: '#1C1C1E',
          900: '#0F0F10',
        },
        cream: '#FAF7F0',
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
