import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, uploadProfilePicture } from '../api/userApi';

const ProfileEditPage = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [picturePreview, setPicturePreview] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Set initial preview if user has a profile picture
    if (currentUser?.profilePicture) {
      setPicturePreview(currentUser.profilePicture);
    }
  }, [currentUser, navigate]);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    bio: Yup.string(),
    location: Yup.string()
  });

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPictureFile(file);
      setPicturePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(''); // Clear any previous errors
    
    try {
      // Add the user ID to the values object
      const profileData = {
        ...values,
        id: currentUser.id
      };
      
      // First update basic profile data
      const updatedProfile = await updateUserProfile(profileData);
      
      // If a new picture was selected, upload it
      if (pictureFile) {
        const formData = new FormData();
        formData.append('file', pictureFile);
        const pictureData = await uploadProfilePicture(formData);
        updatedProfile.profilePicture = pictureData.fileUrl;
      }
      
      // Update context user data
      setCurrentUser({
        ...currentUser,
        ...updatedProfile
      });
      
      // Clear any error and redirect to the user's profile page
      setError('');
      navigate(`/profile/${currentUser.id}`);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null; // Prevent rendering while redirecting
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <Formik
        initialValues={{
          name: currentUser.name || '',
          email: currentUser.email || '',
          bio: currentUser.bio || '',
          location: currentUser.location || ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6 bg-white p-6 rounded-lg shadow">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={picturePreview || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('picture-upload').click()}
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-sm hover:bg-indigo-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500">Click the icon to change your profile picture</p>
            </div>

            {/* Form Fields */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Field
                type="text"
                name="name"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <ErrorMessage name="name" component="div" className="mt-1 text-red-600 text-sm" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Field
                type="email"
                name="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <ErrorMessage name="email" component="div" className="mt-1 text-red-600 text-sm" />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <Field
                as="textarea"
                name="bio"
                id="bio"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell others about yourself..."
              />
              <ErrorMessage name="bio" component="div" className="mt-1 text-red-600 text-sm" />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Field
                type="text"
                name="location"
                id="location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="City, Country"
              />
              <ErrorMessage name="location" component="div" className="mt-1 text-red-600 text-sm" />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/profile/${currentUser.id}`)}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isSubmitting || loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProfileEditPage;
