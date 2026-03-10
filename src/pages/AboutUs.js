import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.section) {
      // Scroll to section after a short delay to allow rendering
      setTimeout(() => {
        const element = document.getElementById(location.state.section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-4">
            About Periyasamy Grocery
          </h1>
          <p className="text-lg text-gray-600">Serving Our Community with Fresh Quality Products Since 2020</p>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Our Story */}
          <section id="our-story" className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">📖 Our Story</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Periyasamy Grocery was founded with a simple mission: to bring fresh, quality groceries to our local community at affordable prices. Started in 2020 by Periyasamy, a passionate entrepreneur with deep roots in Maramangalathupatti, the store has grown to become a trusted neighborhood grocery destination.
              </p>
              <p>
                What began as a small neighborhood store has evolved into a modern e-commerce platform, combining the warmth of a local grocery shop with the convenience of online shopping. We believe in maintaining the personal touch while embracing technology to serve our customers better.
              </p>
              <p>
                Located at M3C3+7PM, Maramangalathupatti, Tamil Nadu 636030, we continue to serve our community with the same dedication and commitment to quality that we had on day one. Our journey is one of passion, quality, and customer satisfaction.
              </p>
              <p>
                Today, Periyasamy Grocery is more than just a store—it's a part of our community's daily life, providing fresh vegetables, fruits, dairy products, and essential groceries to thousands of satisfied customers.
              </p>
            </div>
          </section>

          {/* Our Mission */}
          <section id="our-mission" className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🎯 Our Mission</h2>
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                To be the most trusted and convenient grocery destination in our community, delivering fresh, quality products with exceptional service at competitive prices.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h3 className="font-bold text-green-700 mb-3 text-lg">Quality First</h3>
                  <p className="text-gray-700 text-sm">
                    We source directly from trusted farmers and suppliers to ensure every product meets our high-quality standards.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-700 mb-3 text-lg">Community Focused</h3>
                  <p className="text-gray-700 text-sm">
                    We're committed to serving our local community and supporting local farmers and businesses.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
                  <h3 className="font-bold text-purple-700 mb-3 text-lg">Innovation & Service</h3>
                  <p className="text-gray-700 text-sm">
                    We continuously innovate to provide better service and convenience through technology.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">💎 Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="text-3xl mr-4">🌟</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Integrity</h3>
                  <p className="text-gray-600">We operate with complete honesty and transparency in all our dealings with customers and suppliers.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-3xl mr-4">🤝</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Customer Care</h3>
                  <p className="text-gray-600">Your satisfaction is our priority. We're always here to help and listen to your feedback.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-3xl mr-4">🌱</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Sustainability</h3>
                  <p className="text-gray-600">We're committed to eco-friendly practices and promoting organic, locally sourced products.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-3xl mr-4">⚡</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Excellence</h3>
                  <p className="text-gray-600">We strive for excellence in every aspect of our business, from products to customer service.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6">✨ Why Choose Periyasamy Grocery?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <span className="text-3xl mr-4">✅</span>
                <div>
                  <h3 className="font-bold mb-2">100% Fresh Products</h3>
                  <p className="text-green-100">Direct sourcing from trusted suppliers ensures maximum freshness</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-3xl mr-4">🚚</span>
                <div>
                  <h3 className="font-bold mb-2">Fast Delivery</h3>
                  <p className="text-green-100">Quick and reliable delivery within 30 minutes of your order</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-3xl mr-4">💰</span>
                <div>
                  <h3 className="font-bold mb-2">Competitive Prices</h3>
                  <p className="text-green-100">Best prices with regular discounts and special offers</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-3xl mr-4">👥</span>
                <div>
                  <h3 className="font-bold mb-2">24/7 Customer Support</h3>
                  <p className="text-green-100">Always available to answer your questions and concerns</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
            <p className="mb-6 text-lg">We'd love to hear from you! Reach out with any questions or feedback.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a href="tel:09443219033" className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition">
                📞 09443219033
              </a>
              <a href="mailto:periyasamyn99@gmail.com" className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition">
                📧 periyasamyn99@gmail.com
              </a>
              <button 
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition"
              >
                🛒 Start Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
