import React from 'react';
import { useNavigate } from 'react-router-dom';

import DailyDeals from '../components/DailyDeals';
import MaterialIcon from '../components/MaterialIcon';

const Home = () => {
  const navigate = useNavigate();

  const highlights = [
    {
      icon: 'local_offer',
      title: 'Smart Daily Deals',
      text: 'Auto-applied 50% OFF deals with live stock tracking so you never miss a discount.',
    },
    {
      icon: 'checklist_rtl',
      title: 'Shopping Lists & Reminders',
      text: 'Create shopping lists, save favorites, and get reminders so you never forget essentials.',
    },
    {
      icon: 'insights',
      title: 'Business Insights for Admin',
      text: 'See daily sales, expenses, and profit in one place with clear finance dashboards made for grocery shop owners.',
    },
  ];

  return (
    <div className="bg-white home-page">
      <div className="home-main">
        {/* Enhanced Hero Section */}
        <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container min-h-[50vh] z-10 p-6">
          <div className="hero-grid">
            <div className="hero-content">
              <h1 className="hero-title">Periyasamy Grocery</h1>
              <p className="hero-subtitle mb-2">Fresh. Local. Delivered fast.</p>
              <p className="text-lg mb-4 opacity-90 text-white">
                Your trusted neighborhood grocery partner for daily essentials,
                farm-fresh produce, and monthly bulk orders.
              </p>

              <div className="d-flex flex-wrap gap-4 mt-4">
                <button
                  onClick={() => navigate('/products')}
                  className="btn bg-white text-success font-bold text-md"
                >
                  Browse Products
                </button>
                <button
                  onClick={() => navigate('/shopping-lists')}
                  className="btn btn-outline text-white border-white text-md font-bold"
                >
                  Create Shopping List
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Daily Deals Section */}
        <div className="container py-8">
          <DailyDeals showTitle={true} />
        </div>

        {/* Project Highlights Section */}
        <div className="testimonial-section">
          <div className="container">
            <h2 className="text-center text-4xl font-bold mb-8 text-success-dark">Why Use Periyasamy Grocery?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {highlights.map((item, idx) => (
                <div key={idx} className="testimonial-card d-flex flex-column">
                  <div className="d-flex align-center mb-4">
                    <div className="d-flex align-center justify-center rounded-circle mr-3" style={{ width: '48px', height: '48px', background: 'rgba(16,185,129,0.1)' }}>
                      <MaterialIcon name={item.icon} size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 m-0">{item.title}</h3>
                  </div>
                  <p className="text-gray-700 mb-0" style={{ lineHeight: 1.7 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Store Information */}
            <div className="footer-section">
              <h4 className="d-flex align-center gap-2" style={{ color: '#e5e7eb' }}>
                <MaterialIcon name="location_on" size={20} />
                Address
              </h4>
              <ul>
                <li>M3C3+7PM</li>
                <li>Maramangalathupatti</li>
                <li>Tamil Nadu 636030</li>
                <li>India</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="footer-section">
              <h4 className="d-flex align-center gap-2" style={{ color: '#e5e7eb' }}>
                <MaterialIcon name="call" size={20} />
                Contact
              </h4>
              <ul>
                <li><a href="tel:09443219033" className="font-semibold">09443219033</a></li>
                <li><a href="mailto:periyasamyn99@gmail.com" className="font-semibold break-all">periyasamyn99@gmail.com</a></li>
              </ul>
            </div>

            {/* Opening Hours */}
            <div className="footer-section">
              <h4 className="d-flex align-center gap-2" style={{ color: '#fed7aa' }}>
                <MaterialIcon name="schedule" size={20} />
                Opening Hours
              </h4>
              <ul>
                <li className="mt-1"><span className="font-semibold">Monday</span><br /><span className="text-sm text-gray-400">8:00 AM – 9:30 PM</span></li>
                <li className="mt-3"><span className="font-semibold">Tue - Sun</span><br /><span className="text-sm text-gray-400">8:00 AM – 9:30 PM</span></li>
                <li className="text-success-light mt-4 text-xs font-bold d-flex align-center gap-2">
                  <MaterialIcon name="celebration" size={18} />
                  Open 7 days a week!
                </li>
              </ul>
            </div>

            {/* Policies & Links */}
            <div className="footer-section">
              <h4 className="d-flex align-center gap-2" style={{ color: '#e5e7eb' }}>
                <MaterialIcon name="link" size={20} />
                Important Links
              </h4>
              <ul>
                <li><button onClick={() => navigate('/policies', { state: { tab: 'privacy' } })} style={{background: 'none', border:'none', cursor:'pointer', color:'inherit', padding:0}}>Privacy Policy</button></li>
                <li><button onClick={() => navigate('/policies', { state: { tab: 'terms' } })} style={{background: 'none', border:'none', cursor:'pointer', color:'inherit', padding:0}}>Terms & Conditions</button></li>
                <li><button onClick={() => navigate('/policies', { state: { tab: 'return' } })} style={{background: 'none', border:'none', cursor:'pointer', color:'inherit', padding:0}}>Return Policy</button></li>
                <li className="mt-4"><button onClick={() => navigate('/about')} style={{background: 'none', border:'none', cursor:'pointer', color:'white', fontWeight:'bold', padding:0}}>About Us</button></li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-8 mt-8 border-t border-gray-700 text-gray-400 text-sm" style={{ borderTop: '1px solid #374151' }}>
            <p>&copy; 2026 Periyasamy Grocery. All rights reserved. | Local Community's Trusted Grocer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
