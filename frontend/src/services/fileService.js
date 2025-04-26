import api from './api';

const fileService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  uploadMultipleFiles: (files) => {
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    return api.post('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default fileService;
