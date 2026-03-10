import React, { useState, useEffect } from 'react';
import { adminShoppingListService, productService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminShoppingLists = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🛍️',
    category: 'other',
    displayOrder: 0,
    isActive: true
  });
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchLists();
    fetchAllProducts();
  }, []);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const response = await adminShoppingListService.getAllLists();
      setLists(response.data);
      setIsAuthorized(true);
    } catch (error) {
      console.error('Error fetching lists:', error);
      if (error.response?.status === 403) {
        setIsAuthorized(false);
        showMessage('error', 'Access denied. You must be an admin to manage shopping lists.');
      } else {
        showMessage('error', 'Failed to fetch shopping lists');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await productService.getProducts();
      setAllProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedList) {
        await adminShoppingListService.updateList(selectedList._id, {
          ...formData,
          products: selectedProducts
        });
        showMessage('success', 'Shopping list updated successfully');
      } else {
        await adminShoppingListService.createList({
          ...formData,
          products: selectedProducts
        });
        showMessage('success', 'Shopping list created successfully');
      }
      resetForm();
      fetchLists();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (list) => {
    setSelectedList(list);
    setFormData({
      name: list.name,
      description: list.description,
      icon: list.icon,
      category: list.category,
      displayOrder: list.displayOrder,
      isActive: list.isActive
    });
    setSelectedProducts(list.products.map(p => p._id || p));
    setShowCreateForm(true);
  };

  const handleDelete = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this shopping list?')) return;
    
    try {
      await adminShoppingListService.deleteList(listId);
      showMessage('success', 'Shopping list deleted successfully');
      fetchLists();
    } catch (error) {
      showMessage('error', 'Failed to delete shopping list');
    }
  };

  const handleToggleActive = async (listId) => {
    try {
      await adminShoppingListService.toggleActive(listId);
      showMessage('success', 'Status updated successfully');
      fetchLists();
    } catch (error) {
      showMessage('error', 'Failed to update status');
    }
  };

  const handleToggleProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const resetForm = () => {
    setSelectedList(null);
    setFormData({
      name: '',
      description: '',
      icon: '🛍️',
      category: 'other',
      displayOrder: 0,
      isActive: true
    });
    setSelectedProducts([]);
    setShowCreateForm(false);
  };

  return (
    <div className="p-6">
      {!isAuthorized && (
        <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
          <h3 className="font-bold text-lg mb-2">Access Denied</h3>
          <p>You do not have permission to manage shopping lists. Only administrators can access this feature.</p>
          <p className="mt-3 text-sm">
            <strong>Solution:</strong> If you are an admin user, please log out and log back in to refresh your permissions.
          </p>
          <button
            onClick={() => {
              const token = localStorage.getItem('token');
              if (token) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
          >
            Log Out and Login
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary">Manage Shopping Lists</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!isAuthorized}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            isAuthorized
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          {showCreateForm ? 'Cancel' : '+ Create New List'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg font-semibold ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-2xl font-bold text-primary mb-4">
            {selectedList ? 'Edit Shopping List' : 'Create New Shopping List'}
          </h3>
          <form onSubmit={handleCreateOrUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., Breakfast Essentials"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  required
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-2xl"
                  placeholder="🛍️"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="3"
                placeholder="Brief description of this shopping list"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="meals">Meals</option>
                  <option value="snacks">Snacks</option>
                  <option value="healthy">Healthy</option>
                  <option value="budget">Budget</option>
                  <option value="party">Party</option>
                  <option value="cooking">Cooking</option>
                  <option value="weekly">Weekly</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 mr-2"
                  />
                  <span className="font-semibold">Active</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Select Products ({selectedProducts.length} selected)
              </label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {allProducts.map(product => (
                    <label
                      key={product._id}
                      className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-100 ${
                        selectedProducts.includes(product._id) ? 'bg-green-50 border-green-500 border' : 'border'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleToggleProduct(product._id)}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm">{product.name} - ₹{product.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || selectedProducts.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : selectedList ? 'Update List' : 'Create List'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lists.map(list => (
                <tr key={list._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{list.name}</div>
                    <div className="text-sm text-gray500">{list.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {list.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold">{list.products.length}</span> items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{list.displayOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(list._id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        list.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {list.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(list)}
                      className="text-blue-600 hover:text-blue-800 font-semibold mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(list._id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {lists.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No shopping lists found. Create your first list!
        </div>
      )}
    </div>
  );
};

export default AdminShoppingLists;
