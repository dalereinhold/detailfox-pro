/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // The Foundation (Deepest layers)
        background: {
          base: "#09090b",       // Zinc 950 - Main page background
          surface: "#18181b",    // Zinc 900 - Cards, Sidebars
          elevated: "#27272a",   // Zinc 800 - Modals, Tooltips, Hover states
        },
        
        // Text Colors
        foreground: {
          primary: "#fafafa",     // Zinc 50 - Main headings
          secondary: "#a1a1aa",   // Zinc 400 - Subheaders, muted text
          tertiary: "#71717a",     // Zinc 500 - Placeholder text, disabled
        },

        // Accents & Interaction
        brand: {
          primary: "#22c55e",     // Green 500 - Main buttons/actions
          secondary: "#ec4899",   // Pink 500 - Secondary accents
          success: "#22c55e",     // Green 500
          warning: "#f59e0b",     // Amber 500
          danger: "#ef4444",       // Red 500
        },

        // Borders & Dividers
        border: {
          default: "#27272a",      // Zinc 800
          subtle: "#3f3f46",       // Zinc 700
        },

        // Interactive States
        input: {
          bg: "#121214",           // Slightly darker than surface
          border: "#27272a",
        }
      },
    },
  },
  plugins: [],
};
