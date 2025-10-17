# Material UI Theme Guide

This document explains the Material UI theme configuration designed for medical professionals.

## Theme Configuration

The theme is configured in `lib/theme.ts` and provides a professional, healthcare-focused design system.

## Color Palette

### Primary - Professional Blue

- **Main**: `#2563eb` - Trust and reliability
- **Light**: `#60a5fa` - Softer variant
- **Dark**: `#1e40af` - Strong emphasis
- **Usage**: Primary actions, key information, headers

### Secondary - Medical Green

- **Main**: `#059669` - Health and growth
- **Light**: `#34d399` - Success states
- **Dark**: `#047857` - Strong success
- **Usage**: Success states, positive actions, health indicators

### Semantic Colors

- **Error**: Red tones for alerts and errors
- **Warning**: Amber for warnings and cautions
- **Info**: Sky blue for informational messages
- **Success**: Green for confirmations

### Backgrounds

- **Default**: `#f8fafc` - Light gray for page background
- **Paper**: `#ffffff` - White for cards and surfaces

### Text

- **Primary**: `#1e293b` - Dark gray for main content
- **Secondary**: `#64748b` - Medium gray for supporting text

## Typography

### Font Family

System font stack for optimal readability and performance:

```
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial
```

### Headings

- **h1**: 2.5rem, weight 700 - Page titles
- **h2**: 2rem, weight 600 - Section headers
- **h3**: 1.75rem, weight 600 - Subsection headers
- **h4-h6**: Progressively smaller - Component headers

### Body Text

- **body1**: 1rem - Standard content
- **body2**: 0.875rem - Supporting content, captions

### Buttons

- Text transform: None (preserves casing)
- Font weight: 500 (medium)

## Component Customization

### Buttons

- Border radius: 8px
- Padding: 8px 16px
- No box shadow by default
- Subtle shadow on hover

### Cards

- Border radius: 12px
- Light box shadow for depth

### Paper

- Border radius: 8px
- Subtle elevation shadows

## Usage Examples

### Using Theme Colors

```tsx
import { Box, Typography } from '@mui/material';

<Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2 }}>
  <Typography variant="h5">Primary Background</Typography>
</Box>;
```

### Custom Component with Theme

```tsx
import { styled } from '@mui/material/styles';
import { Card } from '@mui/material';

const MedicalCard = styled(Card)(({ theme }) => ({
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));
```

### Using Theme in sx Prop

```tsx
<Button
  sx={{
    bgcolor: 'secondary.main',
    '&:hover': {
      bgcolor: 'secondary.dark',
    },
  }}
>
  Action
</Button>
```

### Responsive Typography

```tsx
<Typography
  variant="h3"
  sx={{
    fontSize: { xs: '1.5rem', md: '1.75rem' },
  }}
>
  Responsive Heading
</Typography>
```

## Best Practices

1. **Use Semantic Colors**: Choose colors based on meaning
   - Primary for main actions
   - Secondary for alternative actions
   - Error/Warning/Success for feedback

2. **Maintain Contrast**: Ensure text is readable
   - Use `contrastText` for text on colored backgrounds
   - Test with accessibility tools

3. **Consistent Spacing**: Use theme spacing units

   ```tsx
   <Box sx={{ p: 2, m: 1 }}>  // p: 2 = 16px, m: 1 = 8px
   ```

4. **Responsive Design**: Use breakpoints for responsive layouts

   ```tsx
   sx={{
     width: { xs: '100%', sm: '50%', md: '33%' }
   }}
   ```

5. **Theme Variants**: Use theme variants consistently
   - Contained buttons for primary actions
   - Outlined for secondary actions
   - Text buttons for tertiary actions

## Accessibility

The theme maintains WCAG 2.1 AA compliance:

- Color contrast ratios meet standards
- Focus states are visible
- Touch targets are appropriately sized

## Customization

To modify the theme, edit `lib/theme.ts`:

```typescript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#your-color',
    },
  },
  // ... other overrides
});
```

After changes, the theme updates across the entire application automatically.
