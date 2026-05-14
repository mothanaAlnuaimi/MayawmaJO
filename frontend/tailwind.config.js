/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        success: '#16A34A',
        warning: '#F97316',
        danger: '#DC2626',
        background: '#F8FAFC',
        card: '#FFFFFF',
        'text-main': '#0F172A',
        'text-secondary': '#64748B',
        border: '#E2E8F0',
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
