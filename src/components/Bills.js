import React, { useState, useEffect } from 'react';
import billService from '../services/billService';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [downloadingBillId, setDownloadingBillId] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await billService.getAllBills();
      setBills(response.data);
      setMessage(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error fetching bills: ${error.response?.data?.message || error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBill = async (billId) => {
    setDownloadingBillId(billId);
    try {
      const response = await billService.downloadBill(billId);
      const bill = bills.find((b) => b._id === billId);
      
      // Create a blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${bill.billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Bill downloaded successfully' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error downloading bill: ${error.response?.data?.message || error.message}`,
      });
    } finally {
      setDownloadingBillId(null);
    }
  };

  const handleChangeStatus = async (billId, newStatus) => {
    try {
      await billService.updateBillStatus(billId, newStatus);
      fetchBills();
      setMessage({ type: 'success', text: 'Bill status updated' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error updating bill: ${error.response?.data?.message || error.message}`,
      });
    }
  };

  const filteredBills = filterStatus
    ? bills.filter((bill) => bill.status === filterStatus)
    : bills;

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      issued: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Bills Management</h2>
        <button
          onClick={fetchBills}
          className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'error'
              ? 'bg-red-50 text-red-800'
              : 'bg-green-50 text-green-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-4 py-2 rounded-lg transition ${
            filterStatus === ''
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All Bills
        </button>
        {['draft', 'issued', 'paid', 'overdue', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg transition capitalize ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading bills...</p>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No bills found</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bill Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bill.billNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {bill.customerName}
                    <br />
                    <span className="text-xs text-gray-500">{bill.customerEmail}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${bill.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(bill.billDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={bill.status}
                      onChange={(e) => handleChangeStatus(bill._id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer ${getStatusColor(bill.status)}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="issued">Issued</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadBill(bill._id)}
                      disabled={downloadingBillId === bill._id}
                      className="text-green-600 hover:text-green-900 font-medium disabled:opacity-50"
                    >
                      {downloadingBillId === bill._id ? 'Downloading...' : 'Download'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Bill: {selectedBill.billNumber}
                </h3>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{selectedBill.customerName}</p>
                  <p className="text-sm text-gray-600">{selectedBill.customerEmail}</p>
                  <p className="text-sm text-gray-600">{selectedBill.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bill Date</p>
                  <p className="font-medium">
                    {new Date(selectedBill.billDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Status: {selectedBill.status}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedBill.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm border-b pb-2">
                      <span>{item.name}</span>
                      <span>
                        {item.quantity} × ${item.unitPrice} = ${item.totalPrice}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${selectedBill.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${selectedBill.tax}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total:</span>
                  <span>${selectedBill.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDownloadBill(selectedBill._id)}
                  disabled={downloadingBillId === selectedBill._id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {downloadingBillId === selectedBill._id ? 'Downloading...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setSelectedBill(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;
