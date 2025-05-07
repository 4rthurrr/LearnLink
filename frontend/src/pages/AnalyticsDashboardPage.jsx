import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserAnalytics, 
  getLearningPlanAnalyticsByCategory,
  getDailyActivityStats,
  getLearningProgressTimeline,
  getLearningPlanStats,
  getTimeSpentAnalytics
} from '../api/analyticsApi';
import { getUserLearningPlans } from '../api/learningPlanApi';
import { format, subDays } from 'date-fns';

// Dashboard components
import ProgressSummaryCard from '../components/analytics/ProgressSummaryCard';
import CompletionRateChart from '../components/analytics/CompletionRateChart';
import LearningPlanProgressList from '../components/analytics/LearningPlanProgressList';
import TimeDistributionChart from '../components/analytics/TimeDistributionChart';
import ActivityTimeline from '../components/analytics/ActivityTimeline';
import CategoryBreakdownChart from '../components/analytics/CategoryBreakdownChart';

const AnalyticsDashboardPage = () => {
  const { currentUser } = useAuth();
  
  // States for different analytics data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [categoryAnalytics, setCategoryAnalytics] = useState([]);
  const [activityStats, setActivityStats] = useState([]);
  const [progressTimeline, setProgressTimeline] = useState([]);
  const [learningPlanStats, setLearningPlanStats] = useState(null);
  const [timeSpentData, setTimeSpentData] = useState([]);
  const [learningPlans, setLearningPlans] = useState([]);
  
  // Date range state for filtering
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  // Function to load all analytics data
  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll simulate the data as the backend endpoints are not yet implemented
      // In a real implementation, we would call the API functions
      
      // Simulated data for development
      const simulatedUserAnalytics = {
        totalLearningPlans: 8,
        completedLearningPlans: 3,
        inProgressLearningPlans: 4,
        totalTopics: 42,
        completedTopics: 23,
        completedResources: 67,
        totalResources: 118,
        averageCompletionRate: 54.8,
        learningDays: 24,
        longestStreak: 7
      };
      
      const simulatedCategoryData = [
        { category: 'PROGRAMMING', count: 4, completionRate: 65.2 },
        { category: 'DESIGN', count: 2, completionRate: 34.7 },
        { category: 'BUSINESS', count: 1, completionRate: 82.1 },
        { category: 'LANGUAGE', count: 1, completionRate: 45.3 }
      ];
      
      const simulatedActivityData = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), 29 - i);
        return {
          date: format(date, 'yyyy-MM-dd'),
          resourcesCompleted: Math.floor(Math.random() * 5),
          topicsCompleted: Math.random() > 0.7 ? 1 : 0,
          minutesSpent: Math.floor(Math.random() * 120)
        };
      });
      
      const simulatedProgressData = Array.from({ length: 12 }, (_, i) => {
        return {
          date: format(new Date(2025, i, 1), 'yyyy-MM'),
          progress: Math.min(100, Math.floor(Math.random() * 8 * (i + 1)))
        };
      });
      
      const simulatedLearningPlanStats = {
        averageCompletionTime: 27.5, // days
        fastestCompletionTime: 14, // days
        mostActiveDays: ['Monday', 'Wednesday'],
        mostActiveHours: '19:00 - 21:00',
        topCategories: ['PROGRAMMING', 'DESIGN']
      };
      
      const simulatedTimeSpentData = [
        { category: 'PROGRAMMING', timeSpent: 2340 }, // minutes
        { category: 'DESIGN', timeSpent: 1260 },
        { category: 'BUSINESS', timeSpent: 840 },
        { category: 'LANGUAGE', timeSpent: 630 }
      ];
      
      // Get real learning plans from the API
      const plansResponse = await getUserLearningPlans(currentUser.id);
      
      // Set states with the data
      setUserAnalytics(simulatedUserAnalytics);
      setCategoryAnalytics(simulatedCategoryData);
      setActivityStats(simulatedActivityData);
      setProgressTimeline(simulatedProgressData);
      setLearningPlanStats(simulatedLearningPlanStats);
      setTimeSpentData(simulatedTimeSpentData);
      setLearningPlans(plansResponse.content || []);
      
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on component mount or date range change
  useEffect(() => {
    loadAnalyticsData();
  }, [currentUser, dateRange]);
  
  // Handle date range change
  const handleDateRangeChange = (event) => {
    const { name, value } = event.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 101.414 1.414L10 11.414l1.293 1.293a1 1 001.414-1.414L11.414 10l1.293-1.293a1 1 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Learning Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">Track your learning progress and gain insights into your study habits.</p>
      </div>
      
      {/* Date Range Selector */}
      <div className="mb-8 bg-white shadow overflow-hidden sm:rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="px-3 py-2 border border-gray-300 rounded-md w-full"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="px-3 py-2 border border-gray-300 rounded-md w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Progress Summary Cards */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProgressSummaryCard 
          title="Learning Plans" 
          completed={userAnalytics.completedLearningPlans} 
          total={userAnalytics.totalLearningPlans} 
          icon="plan"
        />
        <ProgressSummaryCard 
          title="Topics" 
          completed={userAnalytics.completedTopics} 
          total={userAnalytics.totalTopics} 
          icon="topic"
        />
        <ProgressSummaryCard 
          title="Resources" 
          completed={userAnalytics.completedResources} 
          total={userAnalytics.totalResources} 
          icon="resource"
        />
        <ProgressSummaryCard 
          title="Completion Rate" 
          value={`${userAnalytics.averageCompletionRate}%`} 
          icon="rate"
          isPercentage={true}
        />
      </div>
      
      {/* Charts Row 1 */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Completion Rate Chart */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Learning Activity Timeline</h2>
          <ActivityTimeline data={activityStats} />
        </div>
        
        {/* Category Breakdown */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h2>
          <CategoryBreakdownChart data={categoryAnalytics} />
        </div>
      </div>
      
      {/* Charts Row 2 */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Distribution */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Time Distribution by Category</h2>
          <TimeDistributionChart data={timeSpentData} />
        </div>
        
        {/* Completion Rate by Category */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Completion Rate by Category</h2>
          <CompletionRateChart data={categoryAnalytics} />
        </div>
      </div>
      
      {/* Learning Plans Progress */}
      <div className="mb-8 bg-white shadow overflow-hidden sm:rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Learning Plans Progress</h2>
        <LearningPlanProgressList learningPlans={learningPlans} />
      </div>
      
      {/* Learning Stats */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Learning Statistics</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Insights about your learning patterns.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Average Completion Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {learningPlanStats.averageCompletionTime} days
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Fastest Completion Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {learningPlanStats.fastestCompletionTime} days
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Most Active Days</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {learningPlanStats.mostActiveDays.join(', ')}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Most Active Hours</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {learningPlanStats.mostActiveHours}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Learning Days</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userAnalytics.learningDays} days
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Longest Streak</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userAnalytics.longestStreak} days
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;