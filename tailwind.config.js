/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Base surfaces
        bg: {
          base: '#111315',
          surface: '#1A1D21',
          elevated: '#22262C',
          overlay: '#2A2F37',
        },
        // Borders
        border: {
          subtle: '#2A2F37',
          DEFAULT: '#353B44',
          strong: '#4A525E',
        },
        // Text
        text: {
          primary: '#E8EAED',
          secondary: '#9BA3AF',
          muted: '#5C6470',
          inverse: '#111315',
        },
        // Model accent colors
        gpt: {
          DEFAULT: '#7C5CFF',
          dim: '#7C5CFF26',
          hover: '#9478FF',
          border: '#7C5CFF66',
        },
        gemini: {
          DEFAULT: '#1DB954',
          dim: '#1DB95426',
          hover: '#24D960',
          border: '#1DB95466',
        },
        claude: {
          DEFAULT: '#FF8A3D',
          dim: '#FF8A3D26',
          hover: '#FF9F5C',
          border: '#FF8A3D66',
        },
        // Semantic status colors
        status: {
          idle: '#5C6470',
          thinking: '#60A5FA',
          executing: '#A78BFA',
          done: '#34D399',
          error: '#F87171',
        },
      },
      // Custom animations for agent status indicators
      animation: {
        'spin-slow': 'spin 2.5s linear infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      // Fixed widths for layout zones
      width: {
        sidebar: '120px',
        'detail-panel': '420px',
      },
      // Consistent border radius scale
      borderRadius: {
        card: '10px',
        badge: '5px',
      },
      // Box shadows tuned for dark backgrounds
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5)',
        panel: '0 0 0 1px #2A2F37, -4px 0 24px rgba(0,0,0,0.4)',
        'gpt-ring': '0 0 0 1.5px #7C5CFF',
        'gemini-ring': '0 0 0 1.5px #1DB954',
        'claude-ring': '0 0 0 1.5px #FF8A3D',
      },
    },
  },
  plugins: [],
}
