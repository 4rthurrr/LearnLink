import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPosts } from '../api/postApi';
import { getLearningPlans } from '../api/learningPlanApi';
import PostCard from '../components/post/PostCard';
import LearningPlanList from '../components/learningPlan/LearningPlanList';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faPencilAlt, faGraduationCap, faRocket, 
  faChartLine, faSpinner, faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import { useInView } from 'react-intersection-observer';
import AOS from 'aos';
import 'aos/dist/aos.css';

const HomePage = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  const refreshParam = queryParams.get('refresh');
  
  const [posts, setPosts] = useState({ content: [], number: 0, totalPages: 0, last: true });
  const [learningPlans, setLearningPlans] = useState({ content: [], number: 0, totalPages: 0, last: true });
  const [activeTab, setActiveTab] = useState(tabParam === 'plans' ? 'plans' : 'posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(refreshParam || 0);
  const [trendingSkills, setTrendingSkills] = useState([
    { name: 'React', percentage: 85 },
    { name: 'Machine Learning', percentage: 72 },
    { name: 'UX Design', percentage: 68 },
    { name: 'JavaScript', percentage: 62 },
  ]);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Initialize AOS animation library
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out'
    });
  }, []);

  // Check URL parameters when they change
  useEffect(() => {
    if (tabParam === 'plans') {
      setActiveTab('plans');
    }
    if (refreshParam) {
      setRefreshKey(refreshParam);
    }
  }, [tabParam, refreshParam]);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts(0);
    } else {
      fetchLearningPlans(0);
    }
  }, [activeTab, refreshKey]);

  const fetchPosts = async (page) => {
    setLoading(true);
    try {
      const data = await getPosts(page);
      setPosts(prevPosts => ({
        ...data,
        content: page === 0 ? data.content : [...prevPosts.content, ...data.content]
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningPlans = async (page) => {
    setLoading(true);
    try {
      const data = await getLearningPlans(page, 10, refreshKey);
      
      if (!data || !data.content) {
        throw new Error('Invalid data format received from server');
      }
      
      setLearningPlans(prevPlans => ({
        ...data,
        content: page === 0 ? data.content : [...prevPlans.content, ...data.content]
      }));
    } catch (error) {
      console.error('Error fetching learning plans:', error);
      setError('Failed to load learning plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = () => {
    if (!posts.last) {
      fetchPosts(posts.number + 1);
    }
  };

  const loadMoreLearningPlans = () => {
    if (!learningPlans.last) {
      fetchLearningPlans(learningPlans.number + 1);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      {/* Hero Section with Animation */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden mb-8"
      >
        <div className="p-8 md:p-12 relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 max-w-3xl">
            <motion.h1 
              className="text-3xl md:text-4xl font-extrabold text-white mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Welcome, {currentUser?.name}! <span className="wave">👋</span>
            </motion.h1>
            
            <motion.p 
              className="text-indigo-100 text-lg mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Share your skills, follow inspiring creators, and track your learning progress all in one place.
            </motion.p>
            
            <div className="flex flex-wrap gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <Link 
                  to="/create-post" 
                  className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
                  Create Post
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <Link 
                  to="/create-learning-plan" 
                  className="inline-flex items-center px-5 py-3 border border-white border-opacity-40 text-base font-medium rounded-full shadow-sm text-white bg-transparent hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                  Create Learning Plan
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-aos="fade-up" data-aos-delay="200">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transform transition-all hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Your Posts</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">14</h3>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <FontAwesomeIcon icon={faPencilAlt} className="text-indigo-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-500 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                14% 
              </span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transform transition-all hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Learning Plans</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">6</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FontAwesomeIcon icon={faGraduationCap} className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-500 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                9% 
              </span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transform transition-all hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Learning Hours</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">78</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FontAwesomeIcon icon={faChartLine} className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-500 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                23% 
              </span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Content Tabs */}
        <div className="w-full lg:w-2/3">
          {/* Content Tabs */}
          <motion.div 
            className="bg-white rounded-xl shadow-md mb-6 p-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <nav className="flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('posts')}
                className={`${
                  activeTab === 'posts'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                } flex-1 px-1 py-4 text-center text-sm font-medium rounded-lg transition-all duration-200`}
              >
                <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
                Latest Posts
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`${
                  activeTab === 'plans'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                } flex-1 px-1 py-4 text-center text-sm font-medium rounded-lg transition-all duration-200`}
              >
                <FontAwesomeIcon icon={faGraduationCap} className="mr-2" />
                Learning Plans
              </button>
            </nav>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div 
              className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg shadow-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FontAwesomeIcon icon={faSpinner} className="h-12 w-12 text-indigo-500" />
              </motion.div>
            </div>
          ) : (
            <>
              {/* Posts Tab Content */}
              {activeTab === 'posts' && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {posts.content && posts.content.length > 0 ? (
                    <div className="space-y-6" ref={ref}>
                      {posts.content.map((post, index) => (
                        <motion.div 
                          key={post.id} 
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                          }}
                        >
                          <PostCard post={post} />
                        </motion.div>
                      ))}
                      
                      {!posts.last && (
                        <motion.div 
                          className="flex justify-center mt-6"
                          variants={fadeIn}
                        >
                          <button
                            onClick={loadMorePosts}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                          >
                            <FontAwesomeIcon icon={faRocket} className="mr-2" />
                            Load More
                          </button>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
                      variants={fadeIn}
                    >
                      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-6">
                        <FontAwesomeIcon icon={faPencilAlt} className="h-8 w-8 text-indigo-600" />
                      </div>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No posts yet</h3>
                      <p className="mt-1 text-gray-500 max-w-md mx-auto">Get started by creating a new post or following other users to see their content here.</p>
                      <div className="mt-6">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Link 
                            to="/create-post" 
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                          >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Create a post
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Learning Plans Tab Content */}
              {activeTab === 'plans' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LearningPlanList 
                    learningPlans={learningPlans.content} 
                    hasMore={!learningPlans.last} 
                    loadMore={loadMoreLearningPlans} 
                  />
                </motion.div>
              )}
            </>
          )}
        </div>
        
        {/* Right Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          {/* Your Progress Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100" data-aos="fade-left">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">React Mastery</span>
                    <span className="text-sm font-medium text-indigo-600">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">UX Design</span>
                    <span className="text-sm font-medium text-indigo-600">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">JavaScript</span>
                    <span className="text-sm font-medium text-indigo-600">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link 
                  to="/profile/me" 
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                >
                  View all courses
                  <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Trending Skills Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100" data-aos="fade-left" data-aos-delay="100">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Skills</h3>
              <div className="space-y-4">
                {trendingSkills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                      <span className="text-sm font-medium text-indigo-600">{skill.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${skill.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Suggested Connections */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100" data-aos="fade-left" data-aos-delay="200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Connections</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={`https://randomuser.me/api/portraits/${i % 2 ? 'women' : 'men'}/${i + 20}.jpg`} 
                        alt="User" 
                        className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" 
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {['Alex Morgan', 'Jamie Smith', 'Taylor Johnson'][i]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {['UX Designer', 'Full Stack Developer', 'Data Scientist'][i]}
                        </p>
                      </div>
                    </div>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      Connect
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  View all suggestions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
