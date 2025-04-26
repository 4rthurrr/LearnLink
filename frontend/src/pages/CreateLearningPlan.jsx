import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import learningPlanService from '../services/learningPlanService';

const validationSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .max(100, 'Title should be 100 characters or less'),
  description: yup
    .string()
    .required('Description is required')
    .max(2000, 'Description should be 2000 characters or less'),
  isPublic: yup.boolean(),
  items: yup.array().of(
    yup.object({
      title: yup
        .string()
        .required('Item title is required')
        .max(100, 'Item title should be 100 characters or less'),
      description: yup
        .string()
        .max(1000, 'Item description should be 1000 characters or less')
    })
  )
});

const CreateLearningPlan = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      isPublic: true,
      items: [
        { title: '', description: '' }
      ]
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await learningPlanService.createLearningPlan({
          ...values,
          items: values.items.map((item, index) => ({
            ...item,
            orderIndex: index
          }))
        });
        navigate(`/learning-plan/${response.data.id}`);
      } catch (err) {
        console.error('Error creating learning plan:', err);
        setError('Failed to create learning plan. Please try again.');
      }
    },
  });

  const addItem = () => {
    formik.setValues({
      ...formik.values,
      items: [...formik.values.items, { title: '', description: '' }]
    });
  };

  const removeItem = (index) => {
    const newItems = [...formik.values.items];
    newItems.splice(index, 1);
    formik.setValues({
      ...formik.values,
      items: newItems
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formik.values.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    formik.setValues({
      ...formik.values,
      items
    });
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Create Learning Plan
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Plan Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={
                  (formik.touched.description && formik.errors.description) ||
                  `${formik.values.description.length}/2000 characters`
                }
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="isPublic"
                    checked={formik.values.isPublic}
                    onChange={formik.handleChange}
                  />
                }
                label="Make this plan public (visible to everyone)"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Learning Items</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addItem}
                  variant="outlined"
                  size="small"
                >
                  Add Item
                </Button>
              </Box>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="learning-items">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {formik.values.items.map((item, index) => (
                        <Draggable key={index} draggableId={`item-${index}`} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{ mb: 2, borderRadius: 2 }}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <Box {...provided.dragHandleProps} sx={{ mr: 1 }}>
                                    <DragIcon color="action" />
                                  </Box>
                                  <Typography variant="subtitle1">
                                    Item {index + 1}
                                  </Typography>
                                  <Box sx={{ flexGrow: 1 }} />
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => removeItem(index)}
                                    disabled={formik.values.items.length <= 1}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>

                                <TextField
                                  fullWidth
                                  id={`items[${index}].title`}
                                  name={`items[${index}].title`}
                                  label="Item Title"
                                  value={item.title}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={
                                    formik.touched.items?.[index]?.title &&
                                    Boolean(formik.errors.items?.[index]?.title)
                                  }
                                  helperText={
                                    formik.touched.items?.[index]?.title &&
                                    formik.errors.items?.[index]?.title
                                  }
                                  sx={{ mb: 2 }}
                                />

                                <TextField
                                  fullWidth
                                  id={`items[${index}].description`}
                                  name={`items[${index}].description`}
                                  label="Item Description (optional)"
                                  multiline
                                  rows={2}
                                  value={item.description}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                  error={
                                    formik.touched.items?.[index]?.description &&
                                    Boolean(formik.errors.items?.[index]?.description)
                                  }
                                  helperText={
                                    formik.touched.items?.[index]?.description &&
                                    formik.errors.items?.[index]?.description
                                  }
                                />
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting}
                  startIcon={formik.isSubmitting && <CircularProgress size={20} />}
                >
                  {formik.isSubmitting ? 'Creating...' : 'Create Learning Plan'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateLearningPlan;
