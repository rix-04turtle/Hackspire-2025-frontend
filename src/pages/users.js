import React from 'react'

const User = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in">
              Welcome Back! 👋
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light">
              Discover amazing things waiting for you
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast & Reliable</h3>
              <p className="text-white/80 text-sm">Lightning-fast performance for the best experience</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-xl font-semibold text-white mb-2">Beautiful Design</h3>
              <p className="text-white/80 text-sm">Crafted with care for an amazing visual experience</p>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
              <p className="text-white/80 text-sm">Your data is protected with top-notch security</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-xl">
              Get Started Now
            </button>
          </div>

          {/* Stats Section */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-lg py-4">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-white/70 text-sm mt-1">Users</div>
            </div>
            <div className="bg-white/10 rounded-lg py-4">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-white/70 text-sm mt-1">Projects</div>
            </div>
            <div className="bg-white/10 rounded-lg py-4">
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-white/70 text-sm mt-1">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-white/70 mt-6 text-sm">
          Made with ❤️ using React & Tailwind CSS
        </p>
      </div>
    </div>
  )
}

export default User