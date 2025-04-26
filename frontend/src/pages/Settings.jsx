import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Paper, 
  Tabs, 
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import ProfileSettings from './ProfileSettings';
import AccountSettings from './AccountSettings';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Determine which tab is active based on the current path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/settings/account')) return 1;
    return 0;
  };

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Sidebar */}
        <Paper sx={{ 
          width: { xs: '100%', md: 250 }, 
          p: 0, 
          borderRadius: 2,
          height: 'fit-content'
        }}>
          <List component="nav">
            <ListItem 
              button 
              component={Link} 
              to="/settings/profile"
              selected={getActiveTab() === 0}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            
            <Divider />
            
            <ListItem 
              button 
              component={Link} 
              to="/settings/account"
              selected={getActiveTab() === 1}
            >
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText primary="Account & Security" />
            </ListItem>
            
            <Divider />
            
            <ListItem 
              button 
              component={Link} 
              to="/settings/notifications"
              selected={getActiveTab() === 2}
            >
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItem>
          </List>
        </Paper>
        
        {/* Content */}
        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="/notifications" element={<AccountSettings />} />
            <Route path="/" element={<Navigate to="/settings/profile" replace />} />
          </Routes>
        </Box>
      </Box>
    </Container>
  );
};

export default Settings;
