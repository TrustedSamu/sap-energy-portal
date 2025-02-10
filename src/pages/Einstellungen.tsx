import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import { useState } from 'react';

export const Einstellungen = () => {
  const [settings, setSettings] = useState({
    voicebotActive: true,
    automaticSync: true,
    notifications: true,
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Einstellungen
      </Typography>

      <Card>
        <CardContent>
          <List>
            <ListItem>
              <ListItemText
                primary="Voicebot"
                secondary="Aktiviere oder deaktiviere den Voicebot für Kundenanrufe"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.voicebotActive}
                  onChange={() => handleToggle('voicebotActive')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Automatische Synchronisierung"
                secondary="Automatische Synchronisierung mit der Datenbank"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.automaticSync}
                  onChange={() => handleToggle('automaticSync')}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Benachrichtigungen"
                secondary="Aktiviere oder deaktiviere System-Benachrichtigungen"
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}; 