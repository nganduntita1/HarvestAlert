import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Risk level colors for consistency
        risk: {
          low: '#22c55e',    // green-500
          medium: '#eab308', // yellow-500
          high: '#ef4444',   // red-500
        },
      },
    },
  },
  plugins: [],
}
export default config
