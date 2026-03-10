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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Policies & Terms</h1>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-3 font-bold transition-colors ${
              activeTab === 'privacy'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-6 py-3 font-bold transition-colors ${
              activeTab === 'terms'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`px-6 py-3 font-bold transition-colors ${
              activeTab === 'return'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Return Policy
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Privacy Policy */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
              
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">1. Information We Collect</h3>
                <p className="text-gray-600">
                  We collect information you provide directly to us, such as when you create an account, place an order, or contact our customer service. This includes your name, email address, phone number, delivery address, and payment information.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">2. How We Use Your Information</h3>
                <p className="text-gray-600 mb-3">We use the information we collect to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Process and fulfill your orders</li>
                  <li>Send order confirmations and updates</li>
                  <li>Respond to your inquiries and customer service requests</li>
                  <li>Improve our website and services</li>
                  <li>Send promotional emails (with your consent)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">3. Data Security</h3>
                <p className="text-gray-600">
                  We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">4. Third-Party Sharing</h3>
                <p className="text-gray-600">
                  We do not sell or rent your personal information to third parties. We may share information with delivery partners to fulfill your orders and with payment processors to process transactions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">5. Cookies</h3>
                <p className="text-gray-600">
                  Our website uses cookies to enhance your experience. You can control cookie settings through your browser. Disabling cookies may affect some website functionality.
                </p>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Terms & Conditions</h2>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">1. Agreement to Terms</h3>
                <p className="text-gray-600">
                  By accessing and using the Periyasamy Grocery website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">2. Use License</h3>
                <p className="text-gray-600">
                  Permission is granted to temporarily download one copy of the materials (information or software) on Periyasamy Grocery for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software</li>
                  <li>Remove any copyright or proprietary notation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">3. Disclaimer</h3>
                <p className="text-gray-600">
                  The materials on Periyasamy Grocery are provided "as is". Periyasamy Grocery makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">4. Order Acceptance</h3>
                <p className="text-gray-600">
                  Periyasamy Grocery reserves the right to refuse or cancel any order at any time. We reserve the right to limit quantities and to alter product descriptions, prices, and availability without notice.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">5. Product Availability</h3>
                <p className="text-gray-600">
                  Products are subject to availability. If a product becomes unavailable, we will notify you and either offer a substitute product or issue a full refund.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">6. Age Restriction</h3>
                <p className="text-gray-600">
                  Our website and services are intended for users aged 18 years and above. By using our website, you confirm that you are at least 18 years old.
                </p>
              </div>
            </div>
          )}

          {/* Return Policy */}
          {activeTab === 'return' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Return & Refund Policy</h2>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">1. Return Period</h3>
                <p className="text-gray-600">
                  We offer a 30-day return period from the date of delivery. Items must be returned in original, unopened condition with all packaging intact.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">2. Returnable & Non-Returnable Items</h3>
                <p className="text-gray-600 mb-2">
                  <strong>Returnable Items:</strong> Unopened packaged goods, damaged items (covered by insurance)
                </p>
                <p className="text-gray-600">
                  <strong>Non-Returnable Items:</strong> Perishable items (fresh vegetables, fruits, dairy), opened products, items beyond 30 days, items without original packaging
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">3. Return Process</h3>
                <ol className="list-decimal list-inside text-gray-600 space-y-2">
                  <li>Contact our customer service within 30 days of delivery</li>
                  <li>Provide order number and reason for return</li>
                  <li>Arrange pickup or drop-off of the item</li>
                  <li>We will verify the item condition</li>
                  <li>Refund will be issued within 7 business days</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">4. Quality Guarantee</h3>
                <p className="text-gray-600">
                  If you receive damaged or defective products, contact us immediately. We will replace the item or issue a full refund without requiring a return of the damaged product.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">5. Refund Methods</h3>
                <p className="text-gray-600">
                  Refunds will be issued to the original payment method used during checkout. For credit card purchases, refunds may take 3-5 business days to appear on your statement.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">6. Shipping Costs</h3>
                <p className="text-gray-600">
                  Original delivery charges are non-refundable unless the return is due to our error or a defective product. Return shipping costs may apply for non-defective items.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">7. Contact Us</h3>
                <p className="text-gray-600">
                  For return inquiries, please contact us at:
                  <br />
                  <strong>Phone:</strong> 09443219033
                  <br />
                  <strong>Email:</strong> periyasamyn99@gmail.com
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Have Questions?</h3>
          <p className="mb-6">If you have any questions about our policies, please don't hesitate to contact us.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a href="tel:09443219033" className="px-6 py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition">
              📞 09443219033
            </a>
            <a href="mailto:periyasamyn99@gmail.com" className="px-6 py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition">
              📧 periyasamyn99@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;
