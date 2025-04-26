import api from './api';

const learningPlanService = {
  getLearningPlans: (page = 0, size = 10) => {
    return api.get(`/learning-plans?page=${page}&size=${size}`);
  },
  
  getUserLearningPlans: (userId, page = 0, size = 10) => {
    return api.get(`/users/${userId}/learning-plans?page=${page}&size=${size}`);
  },
  
  getLearningPlanById: (id) => {
    return api.get(`/learning-plans/${id}`);
  },
  
  createLearningPlan: (learningPlanData) => {
    return api.post('/learning-plans', learningPlanData);
  },
  
  updateLearningPlan: (id, learningPlanData) => {
    return api.put(`/learning-plans/${id}`, learningPlanData);
  },
  
  deleteLearningPlan: (id) => {
    return api.delete(`/learning-plans/${id}`);
  },
  
  toggleItemCompletion: (planId, itemId) => {
    return api.put(`/learning-plans/${planId}/items/${itemId}/toggle`);
  },
  
  addLearningPlanItem: (planId, itemData) => {
    return api.post(`/learning-plans/${planId}/items`, itemData);
  },
  
  updateLearningPlanItem: (planId, itemId, itemData) => {
    return api.put(`/learning-plans/${planId}/items/${itemId}`, itemData);
  },
  
  deleteLearningPlanItem: (planId, itemId) => {
    return api.delete(`/learning-plans/${planId}/items/${itemId}`);
  },
  
  reorderLearningPlanItems: (planId, itemOrder) => {
    return api.put(`/learning-plans/${planId}/items/reorder`, itemOrder);
  }
};

export default learningPlanService;
