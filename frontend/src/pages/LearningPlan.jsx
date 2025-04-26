import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  IconButton,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  SchoolOutlined as SchoolIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import learningPlanService from '../services/learningPlanService';

const LearningPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [addItemLoading, setAddItemLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchLearningPlan();
  }, [id]);

  const fetchLearningPlan = async () => {
    try {
      setLoading(true);
      const response = await learningPlanService.getLearningPlanById(id);
      setPlan(response.data);
      
      // Calculate progress
      const completedItems = response.data.items.filter(item => item.completed).length;
      const totalItems = response.data.items.length;
      setProgress(totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0);
    } catch (error) {
      console.error('Error fetching learning plan:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleItem = async (itemId) => {
    try {
      await learningPlanService.toggleItemCompletion(id, itemId);
      
      // Update local state
      setPlan(prevPlan => {
        const updatedItems = prevPlan.items.map(item => {
          if (item.id === itemId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        });
        
        const completedItems = updatedItems.filter(item => item.completed).length;
        const newProgress = Math.round((completedItems / updatedItems.length) * 100);
        setProgress(newProgress);
        
        return {
          ...prevPlan,
          items: updatedItems
        };
      });
    } catch (error) {
      console.error('Error toggling item completion:', error);
    }
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    
    try {
      setAddItemLoading(true);
      const response = await learningPlanService.addLearningPlanItem(id, {
        title: newItemTitle,
        description: newItemDescription,
        orderIndex: plan.items.length
      });
      
      // Update local state
      setPlan(prevPlan => {
        const updatedItems = [...prevPlan.items, response.data];
        return {
          ...prevPlan,
          items: updatedItems
        };
      });
      
      // Reset form and close dialog
      setNewItemTitle('');
      setNewItemDescription('');
      setAddItemDialogOpen(false);
    } catch (error) {
      console.error('Error adding learning plan item:', error);
    } finally {
      setAddItemLoading(false);
    }
  };

  const handleDeletePlan = async () => {
    try {
      await learningPlanService.deleteLearningPlan(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting learning plan:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await learningPlanService.deleteLearningPlanItem(id, itemId);
      
      // Update local state
      setPlan(prevPlan => {
        const updatedItems = prevPlan.items.filter(item => item.id !== itemId);
        
        const completedItems = updatedItems.filter(item => item.completed).length;
        const newProgress = updatedItems.length > 0 
          ? Math.round((completedItems / updatedItems.length) * 100) 
          : 0;
        setProgress(newProgress);
        
        return {
          ...prevPlan,
          items: updatedItems
        };
      });
    } catch (error) {
      console.error('Error deleting learning plan item:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!plan) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" py={8}>
          <Typography variant="h5">Learning plan not found</Typography>
        </Box>
      </Container>
    );
  }

  const isOwner = user && user.id === plan.user.id;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {plan.title}
          </Typography>
          
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={handleMenuClose}
          >
            {isOwner && (
              <MenuItem component={RouterLink} to={`/edit-learning-plan/${plan.id}`}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Plan</ListItemText>
              </MenuItem>
            )}
            {isOwner && (
              <MenuItem onClick={() => { handleMenuClose(); setDialogOpen(true); }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete Plan</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SchoolIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy Plan</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
        
        {/* Author and metadata */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            component={RouterLink}
            to={`/profile/${plan.user.id}`}
            src={plan.user.imageUrl}
            alt={plan.user.name}
            sx={{ width: 32, height: 32 }}
          />
          <Typography
            variant="body2"
            component={RouterLink}
            to={`/profile/${plan.user.id}`}
            sx={{ ml: 1, textDecoration: 'none', color: 'inherit', fontWeight: 500 }}
          >
            {plan.user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            • Created {formatDistanceToNow(new Date(plan.createdAt), { addSuffix: true })}
          </Typography>
        </Box>
        
        {/* Description */}
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
          {plan.description}
        </Typography>
        
        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
          <Box
            sx={{
              mt: 1,
              width: '100%',
              height: 8,
              bgcolor: 'grey.200',
              borderRadius: 5,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                width: `${progress}%`,
                height: '100%',
                bgcolor: 'success.main',
                transition: 'width 0.5s ease-in-out'
              }}
            />
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Items list */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Learning Items
          </Typography>
          {isOwner && (
            <Button
              startIcon={<AddIcon />}
              onClick={() => setAddItemDialogOpen(true)}
            >
              Add Item
            </Button>
          )}
        </Box>
        
        {plan.items.length === 0 ? (
          <Box textAlign="center" py={3}>
            <Typography variant="body1" color="text.secondary">
              No items in this learning plan yet.
            </Typography>
            {isOwner && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddItemDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Add First Item
              </Button>
            )}
          </Box>
        ) : (
          <List>
            {plan.items.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem
                  secondaryAction={
                    isOwner && (
                      <IconButton edge="end" onClick={() => handleDeleteItem(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={item.completed}
                      onChange={() => handleToggleItem(item.id)}
                      disabled={!isOwner}
                      color="success"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{
                          textDecoration: item.completed ? 'line-through' : 'none',
                          color: item.completed ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={item.description}
                  />
                </ListItem>
                {index < plan.items.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Delete confirmation dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Delete Learning Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this learning plan? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeletePlan} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add item dialog */}
      <Dialog open={addItemDialogOpen} onClose={() => setAddItemDialogOpen(false)}>
        <DialogTitle>Add Learning Item</DialogTitle>
        <form onSubmit={handleAddItemSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="title"
              label="Item Title"
              type="text"
              fullWidth
              variant="outlined"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="description"
              label="Description (optional)"
              type="text"
              fullWidth
              variant="outlined"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddItemDialogOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={!newItemTitle.trim() || addItemLoading}
              startIcon={addItemLoading ? <CircularProgress size={20} /> : null}
            >
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default LearningPlan;
