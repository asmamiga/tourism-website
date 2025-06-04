import { extendTheme } from '@chakra-ui/react';

// Moroccan-inspired color palette
const colors = {
  brand: {
    primary: '#00843D',    // Moroccan green (flag color)
    secondary: '#C4161C',  // Moroccan red (flag color)
    accent: '#FFA500',     // Orange (sunset/desert inspired)
    light: '#F9F7F2',      // Light sand color
    dark: '#2D3748',       // Dark blue-gray
    yellow: '#FFD700',     // Gold accent
    blue: '#1A74C7',       // Moroccan blue (from pottery/tiles)
    tan: '#E2D2B2',        // Sand color
  },
};

// Typography
const fonts = {
  heading: "'Montserrat', sans-serif",
  body: "'Poppins', sans-serif",
};

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'md',
    },
    variants: {
      primary: {
        bg: 'brand.primary',
        color: 'white',
        _hover: {
          bg: 'brand.primary',
          opacity: 0.9,
          transform: 'translateY(-2px)',
          boxShadow: 'md',
        },
        transition: 'all 0.3s ease',
      },
      secondary: {
        bg: 'brand.secondary',
        color: 'white',
        _hover: {
          bg: 'brand.secondary',
          opacity: 0.9,
          transform: 'translateY(-2px)',
          boxShadow: 'md',
        },
      },
      outline: {
        borderColor: 'brand.primary',
        color: 'brand.primary',
        _hover: {
          bg: 'brand.light',
          transform: 'translateY(-2px)',
          boxShadow: 'sm',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        boxShadow: 'md',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        _hover: {
          transform: 'translateY(-5px)',
          boxShadow: 'lg',
        },
      },
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: '700',
      lineHeight: '1.2',
    },
  },
};

// Global styles
const styles = {
  global: {
    body: {
      bg: 'brand.light',
      color: 'gray.800',
    },
    a: {
      color: 'brand.primary',
      _hover: {
        textDecoration: 'none',
        color: 'brand.secondary',
      },
    },
  },
};

// Breakpoints
const breakpoints = {
  sm: '320px',
  md: '768px',
  lg: '960px',
  xl: '1200px',
  '2xl': '1536px',
};

// Create the theme
const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
  breakpoints,
});

export default theme;
