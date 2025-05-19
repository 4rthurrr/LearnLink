import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="modern-container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Outlet />
      </main>
      <footer className="bg-white shadow-inner mt-12 py-6">
        <div className="modern-container mx-auto px-4 text-center text-gray-500">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <span className="font-medium text-primary-600">LearnLink</span> &copy; {new Date().getFullYear()} All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary-600">Terms</a>
              <a href="#" className="text-gray-500 hover:text-primary-600">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-primary-600">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
