import React from 'react';
import Link from 'next/link';
import { Leaf, Cloud, Droplets } from 'lucide-react';
import Weather from '../components/Weather';
import CropDoctor from '@/components/Rohan/HomePage/CropDoctor';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Navigation Bar */}
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            <div>
                <div className="text-xl font-bold">Agnivani</div>
                <div className="text-xs text-green-200">Growing a Sustainable Future</div>
            </div>
          </Link>
          <div className="space-x-4">
            <Link href="/indian-states" className="hover:text-green-200 transition-colors">Indian States</Link>
            <Link href="/crops" className="hover:text-green-200 transition-colors">Crops</Link>
            <Link href="/login" className="hover:text-green-200 transition-colors">Login</Link>
            <Link href="/signup" className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-green-900 mb-6">
            Growing a Sustainable Future
          </h1>
          <p className="text-xl text-green-700 mb-8 max-w-2xl mx-auto">
            Get expert farming advice and connect with agricultural professionals to maximize your harvest potential.
          </p>
          <Link
            href="/signup"
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-500 transition-colors inline-block"
          >
            Start Growing Today
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="hover:shadow-xl transition-shadow">
            <CropDoctor />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 p-3 rounded-full w-fit mb-4">
              <Cloud className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">Weather Integration</h3>
            <Weather />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 p-3 rounded-full w-fit mb-4">
              <Droplets className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">Irrigation Planning</h3>
            <p className="text-green-700">Optimize water usage with smart irrigation scheduling and monitoring.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-800 text-white py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Farm?</h2>
          <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who are already using our platform to improve their yields and sustainability.
          </p>
          <Link
            href="/signup"
            className="bg-white text-green-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-100 transition-colors inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-green-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Leaf className="h-6 w-6" />
              <span className="text-xl font-bold">Agnivani</span>
            </div>
            <div className="space-x-4">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="text-center mt-8 text-green-300">
            © {new Date().getFullYear()} Agnivani. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
