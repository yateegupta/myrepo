'use client';

import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { LocalHospital, CheckCircle } from '@mui/icons-material';

export function SampleMuiCard() {
  return (
    <Card sx={{ maxWidth: 400, margin: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <LocalHospital color="primary" />
          <Typography variant="h5" component="h2">
            Material UI Integration
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          This is a sample Material UI card demonstrating the medical-themed design system. The
          theme includes professional colors, typography, and component styles optimized for
          healthcare applications.
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="contained" color="primary" startIcon={<CheckCircle />}>
            Primary Action
          </Button>
          <Button variant="outlined" color="secondary">
            Secondary
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
