/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OPGT Brand Colors - Based on Identity Guide
        'verde-escuro': '#707f54',
        'verde-claro': '#8b9b4c',
        'terra': '#b0804d',
        // Dashboard (solicitado)
        'verde-cadastro': '#3D5A45',
        'terra-ambar': '#96694A',

        // Semantic color aliases
        primary: {
          DEFAULT: '#3D5A45',  // Verde-cadastro
          light: '#5A7A63',    // variação suave
          dark: '#2F4636',     // hover
        },
        secondary: {
          DEFAULT: '#96694A',  // Terra-ambar
          light: '#B0825D',
          dark: '#7A543B',
        },

        // UI Colors
        bg: {
          DEFAULT: '#ffffff',
          alt: '#f8f9f6',      // Leve tom esverdeado
          dark: '#1a1f14',     // Fundo escuro baseado no verde
        },

        // Text colors
        text: {
          DEFAULT: '#1a1f14',
          secondary: '#4a5240',
          muted: '#7a8570',
          light: '#f8f9f6',
        },

        // Border
        border: {
          DEFAULT: '#d4dbc8',
          light: '#e8ece2',
          dark: '#b0b89e',
        },

        // Accent for CTAs
        accent: {
          DEFAULT: '#b0804d',
          hover: '#8a6339',
        },
      },
      fontFamily: {
        sans: [
          'IBM Plex Sans',
          'Bahnschrift',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'IBM Plex Sans',
          'Bahnschrift',
          'sans-serif',
        ],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['1.25rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(112, 127, 84, 0.08)',
        'medium': '0 4px 16px rgba(112, 127, 84, 0.12)',
        'strong': '0 8px 32px rgba(112, 127, 84, 0.16)',
        'card': '0 1px 3px rgba(112, 127, 84, 0.06), 0 4px 12px rgba(112, 127, 84, 0.08)',
        'card-hover': '0 4px 12px rgba(112, 127, 84, 0.12), 0 8px 24px rgba(112, 127, 84, 0.14)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #707f54 0%, #8b9b4c 100%)',
        'gradient-terra': 'linear-gradient(135deg, #b0804d 0%, #c99a6b 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #f8f9f6 0%, #ffffff 100%)',
      },
    },
  },
  plugins: [],
}
