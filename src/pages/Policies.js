import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Policies = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('privacy');

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const tabConfig = [
    { key: 'privacy', label: 'Privacy Policy', icon: '🔒' },
    { key: 'terms', label: 'Terms & Conditions', icon: '📋' },
    { key: 'return', label: 'Return Policy', icon: '↩️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            Policies & Terms
          </h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Transparency is important to us. Read our policies to understand how we protect your data, manage orders, and handle returns.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20 -mt-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex flex-wrap gap-2 justify-center mb-10">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-green-600 text-white shadow-md scale-[1.02]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 lg:p-14 mb-12">
          {/* Privacy Policy */}
          {activeTab === 'privacy' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-2">
                <span className="text-3xl">🔒</span>
                <h2 className="text-3xl font-bold text-gray-800">Privacy Policy</h2>
              </div>
              
              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Information We Collect
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  We collect information you provide directly to us, such as when you create an account, place an order, or contact our customer service. This includes your name, email address, phone number, delivery address, and payment information.
                </p>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  How We Use Your Information
                </h3>
                <p className="text-gray-600 mb-3 pl-9">We use the information we collect to:</p>
                <ul className="text-gray-600 space-y-2 pl-9">
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span> Process and fulfill your orders</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span> Send order confirmations and updates</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span> Respond to your inquiries and customer service requests</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span> Improve our website and services</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span> Send promotional emails (with your consent)</li>
                </ul>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  Data Security
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology. However, no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  Third-Party Sharing
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  We do not sell or rent your personal information to third parties. We may share information with delivery partners to fulfill your orders and with payment processors to process transactions.
                </p>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                  Cookies
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  Our website uses cookies to enhance your experience. You can control cookie settings through your browser. Disabling cookies may affect some website functionality.
                </p>
              </section>
            </div>
          )}

          {/* Terms & Conditions */}
          {activeTab === 'terms' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-2">
                <span className="text-3xl">📋</span>
                <h2 className="text-3xl font-bold text-gray-800">Terms & Conditions</h2>
              </div>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Agreement to Terms
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  By accessing and using the Periyasamy Grocery website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Use License
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  Permission is granted to temporarily download one copy of the materials (information or software) on Periyasamy Grocery for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="text-gray-600 space-y-2 mt-3 pl-9">
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> Modify or copy the materials</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> Use the materials for any commercial purpose</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> Attempt to decompile or reverse engineer any software</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> Remove any copyright or proprietary notation</li>
                </ul>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  Disclaimer
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  The materials on Periyasamy Grocery are provided "as is". Periyasamy Grocery makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation.
                </p>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  Order Acceptance
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  Periyasamy Grocery reserves the right to refuse or cancel any order at any time. We reserve the right to limit quantities and to alter product descriptions, prices, and availability without notice.
                </p>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                  Product Availability
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  Products are subject to availability. If a product becomes unavailable, we will notify you and either offer a substitute product or issue a full refund.
                </p>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                  Age Restriction
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  Our website and services are intended for users aged 18 years and above. By using our website, you confirm that you are at least 18 years old.
                </p>
              </section>
            </div>
          )}

          {/* Return Policy */}
          {activeTab === 'return' && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-2">
                <span className="text-3xl">↩️</span>
                <h2 className="text-3xl font-bold text-gray-800">Return & Refund Policy</h2>
              </div>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Return Period
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  We offer a 30-day return period from the date of delivery. Items must be returned in original, unopened condition with all packaging intact.
                </p>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Returnable & Non-Returnable Items
                </h3>
                <div className="pl-9 space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-700 font-semibold text-sm mb-1">✅ Returnable Items</p>
                    <p className="text-gray-600 text-sm">Unopened packaged goods, damaged items (covered by insurance)</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-gray-700 font-semibold text-sm mb-1">❌ Non-Returnable Items</p>
                    <p className="text-gray-600 text-sm">Perishable items (fresh vegetables, fruits, dairy), opened products, items beyond 30 days, items without original packaging</p>
                  </div>
                </div>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  Return Process
                </h3>
                <ol className="text-gray-600 space-y-3 pl-9">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    Contact our customer service within 30 days of delivery
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    Provide order number and reason for return
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    Arrange pickup or drop-off of the item
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                    We will verify the item condition
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</span>
                    Refund will be issued within 7 business days
                  </li>
                </ol>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  Quality Guarantee
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  If you receive damaged or defective products, contact us immediately. We will replace the item or issue a full refund without requiring a return of the damaged product.
                </p>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                  Refund Methods
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  Refunds will be issued to the original payment method used during checkout. For credit card purchases, refunds may take 3-5 business days to appear on your statement.
                </p>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                  Shipping Costs
                </h3>
                <p className="text-gray-600 leading-relaxed pl-9">
                  Original delivery charges are non-refundable unless the return is due to our error or a defective product. Return shipping costs may apply for non-defective items.
                </p>
              </section>

              <section className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">7</span>
                  Contact Us
                </h3>
                <div className="pl-9 text-gray-600 leading-relaxed">
                  <p className="mb-2">For return inquiries, please contact us at:</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <span className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm">
                      📞 <strong>09443219033</strong>
                    </span>
                    <span className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm">
                      📧 <strong>periyasamyn99@gmail.com</strong>
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mb-16 bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 rounded-2xl shadow-xl p-10 md:p-14 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">Have Questions?</h3>
          <p className="mb-8 text-green-100 text-lg max-w-xl mx-auto">
            If you have any questions about our policies, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:09443219033" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 hover:shadow-lg transition-all duration-200">
              📞 09443219033
            </a>
            <a href="mailto:periyasamyn99@gmail.com" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 hover:shadow-lg transition-all duration-200">
              📧 periyasamyn99@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;
