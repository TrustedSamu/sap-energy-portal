import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { Person, Assessment, Notifications } from '@mui/icons-material';

export const Dashboard = () => {
  const stats = [
    {
      title: 'Aktive Kunden',
      value: '1,234',
      icon: <Person sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Offene Zählerablesungen',
      value: '56',
      icon: <Assessment sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Neue Meldungen',
      value: '12',
      icon: <Notifications sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.title}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {stat.icon}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 