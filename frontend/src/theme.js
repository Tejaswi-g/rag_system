import { createTheme } from '@mui/material/styles';

// Option B Color Palette
// Primary Light Mode
// Background: #FAFAF7, Surface: #FFFFFF, Primary: #0F172A, Accent: #0EA5E9, Secondary: #10B981, Muted: #E5E7EB, Text: #111827

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#0F172A' : '#F8FAFC',
      light: '#334155',
      dark: '#020617',
      contrastText: mode === 'light' ? '#FFFFFF' : '#0F172A',
    },
    secondary: {
      main: '#10B981', // Emerald
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0EA5E9', // Sky blue
      light: '#38BDF8',
      dark: '#0284C7',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    success: {
      main: '#22C55E',
    },
    background: {
      default: mode === 'light' ? '#FAFAF7' : '#0D1117',
      paper: mode === 'light' ? '#FFFFFF' : '#161B22',
      muted: mode === 'light' ? '#F3F4F6' : '#21262D',
    },
    text: {
      primary: mode === 'light' ? '#111827' : '#F0F6FC',
      secondary: mode === 'light' ? '#6B7280' : '#8B949E',
    },
    divider: mode === 'light' ? '#E5E7EB' : '#30363D',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 600, letterSpacing: '-0.025em' },
    h4: { fontWeight: 600, letterSpacing: '-0.015em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500, letterSpacing: '-0.01em' },
    subtitle2: { fontWeight: 500 },
    body1: { fontWeight: 400, letterSpacing: '0em', lineHeight: 1.6 },
    body2: { fontWeight: 400, letterSpacing: '0em', lineHeight: 1.5 },
    button: { fontWeight: 500, textTransform: 'none', letterSpacing: '-0.01em' },
    caption: { fontWeight: 400 },
  },
  shape: {
    borderRadius: 12, // Subtler default for enterprise
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'light' ? '#FAFAF7' : '#0D1117',
          color: mode === 'light' ? '#111827' : '#F0F6FC',
        }
      }
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true, // Clean interactions
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          padding: '8px 16px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          backgroundColor: mode === 'light' ? '#0F172A' : '#F8FAFC',
          color: mode === 'light' ? '#FFFFFF' : '#0F172A',
          '&:hover': {
            backgroundColor: mode === 'light' ? '#1E293B' : '#E2E8F0',
          },
        },
        containedInfo: {
          backgroundColor: '#0EA5E9',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0284C7',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${mode === 'light' ? '#E5E7EB' : '#30363D'}`,
          boxShadow: mode === 'light' 
            ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' 
            : 'none',
          backgroundImage: 'none',
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#161B22',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          border: `1px solid ${mode === 'light' ? '#E5E7EB' : '#30363D'}`,
          boxShadow: mode === 'light' 
            ? '0 25px 50px -12px rgb(0 0 0 / 0.25)' 
            : '0 25px 50px -12px rgb(0 0 0 / 0.5)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#0D1117',
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: mode === 'light' ? '#D1D5DB' : '#30363D',
            },
            '&:hover fieldset': {
              borderColor: mode === 'light' ? '#9CA3AF' : '#8B949E',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0EA5E9',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${mode === 'light' ? '#E5E7EB' : '#30363D'}`,
          boxShadow: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: mode === 'light' ? '#E5E7EB' : '#30363D',
        }
      }
    }
  },
});

export const getTheme = (mode) => createTheme(getDesignTokens(mode));
