import React from "react";
import { Loader } from "lucide-react";

const LoadingPage = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 h-screen flex flex-col">
      <div className="max-w-md mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <header className="p-4 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase">Study Jams '25</h1>
          </div>
          <h2 className="text-l font-bold text-center mt-1 text-gray-900 dark:text-gray-100">GDG on Campus</h2>
        </header>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="rounded-xl bg-white dark:bg-gray-800/50 shadow-md p-8 flex flex-col items-center space-y-6">
            <Loader className="animate-spin h-12 w-12 text-blue-600" />
            <p className="text-xl font-medium text-gray-900 dark:text-gray-100">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;