import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiTruck,
  FiMapPin,
  FiUsers,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiPhone,
  FiMail,
  FiGlobe,
} from 'react-icons/fi';

const Home = () => {
  const features = [
    {
      icon: FiTruck,
      title: 'Fleet Management',
      description: 'Manage your entire vehicle fleet from a single dashboard with real-time tracking and status updates.',
    },
    {
      icon: FiMapPin,
      title: 'Smart Routing',
      description: 'Optimized route planning with distance calculation and location-based ride assignments.',
    },
    {
      icon: FiUsers,
      title: 'Multi-Role Access',
      description: 'Separate dashboards for Users, Drivers, Admins, and Project Managers with role-based permissions.',
    },
    {
      icon: FiShield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with encrypted communications and secure authentication.',
    },
    {
      icon: FiClock,
      title: 'Real-Time Updates',
      description: 'Instant notifications via SMS and Email for ride status changes and assignments.',
    },
    {
      icon: FiCheckCircle,
      title: 'Approval Workflow',
      description: 'Streamlined approval process with automatic routing based on ride distance.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Rides Completed' },
    { value: '50+', label: 'Active Vehicles' },
    { value: '100+', label: 'Happy Users' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <FiTruck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RideManager</h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">
                Features
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium">
                About
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium">
                Contact
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                Powered by Sobadhanavi Solutions
              </span>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Sobadhanavi Vehicle{' '}
                <span className="text-gradient">Management</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Streamline your transportation operations with our comprehensive ride management solution. 
                Book rides, track vehicles, and manage your fleet effortlessly with real-time updates.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register" 
                  className="btn btn-primary btn-lg"
                >
                  Get Started Free
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link 
                  to="/login" 
                  className="btn btn-outline btn-lg"
                >
                  Sign In to Dashboard
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-200">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800"
                  alt="Fleet Management"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-secondary-200 rounded-full opacity-20 blur-3xl"></div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Ride Completed</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiTruck className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                    <p className="text-xs text-gray-500">Active Rides</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium mb-4"
            >
              Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Everything You Need to Manage Rides
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Our comprehensive platform provides all the tools you need for efficient transportation management.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Get started in minutes with our simple and intuitive workflow
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Sign Up', description: 'Create your account in seconds' },
              { step: '02', title: 'Request Ride', description: 'Enter pickup and destination' },
              { step: '03', title: 'Get Approved', description: 'Quick approval from admin/PM' },
              { step: '04', title: 'Enjoy Ride', description: 'Driver picks you up on time' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/70">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800"
                alt="About Us"
                className="rounded-2xl shadow-xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                About Us
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Trusted by Leading Organizations
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                RideManager is developed by Sobadhanavi Solutions, a leading technology company 
                specializing in innovative transport and logistics solutions. Our platform is 
                designed to meet the unique needs of modern organizations.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                With years of experience in the industry, we understand the challenges of 
                fleet management and have built a solution that addresses them head-on.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="w-6 h-6 text-primary-600" />
                  <span className="text-gray-700">24/7 Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="w-6 h-6 text-primary-600" />
                  <span className="text-gray-700">Secure Platform</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="w-6 h-6 text-primary-600" />
                  <span className="text-gray-700">Real-time Tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="w-6 h-6 text-primary-600" />
                  <span className="text-gray-700">Easy Integration</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join hundreds of organizations already using RideManager to streamline their transportation operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="btn btn-primary btn-lg"
              >
                Create Free Account
                <FiArrowRight className="ml-2" />
              </Link>
              <Link 
                to="/login" 
                className="btn btn-outline btn-lg"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                  <FiTruck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">RideManager</h3>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Smart Vehicle & Ride Management System powered by Sobadhanavi Solutions.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white">Sign In</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white">Register</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400">
                  <FiPhone className="w-5 h-5" />
                  <span>+94 77 856 1467</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <FiMail className="w-5 h-5" />
                  <span>sobadhanavi.ride.management@gmail.com</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <FiGlobe className="w-5 h-5" />
                  <span>www.lakdhanavi.lk</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 RideManager. All rights reserved. Powered by Sobadhanavi Solutions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
