/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        'white-primary': '#FFFFFF',
        'black-primary': '#000000',

        // Header / Top Bar
        'header-primary': '#2196F3',
        'header-gradient-start': '#2196F3',
        'header-gradient-end': '#42A5F5',

        // Sidebar colors
        'sidebar-main': '#1565C0',
        'sidebar-sub': '#0D47A1',
        'sidebar-hover': '#1976D2',
        'sidebar-active-bg': '#E3F2FD',
        'sidebar-active-text': '#0D47A1',
        'sidebar-accent': '#64B5F6',
        'sidebar-sub-text': '#BBDEFB',

        // Accent colors
        'accent-primary': '#64B5F6',
        'accent-highlight': '#00F2FF',

        // Text colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#BBDEFB',
        'text-disabled': '#A1A1A1',
        'text-muted': '#90A4AE',

        // Icon colors
        'icon-default': '#90A4AE',
        'icon-active': '#FFFFFF',

        // Button colors
        'btn-primary': '#1976D2',
        'btn-hover': '#1565C0',

        // Graph colors (keep existing)
        'graph-primary': '#FF6384',
        'graph-secondary': '#FFCD56',
        'graph-tertiary': '#4BC0C0',
      }
    },
  },
  plugins: [],
}
