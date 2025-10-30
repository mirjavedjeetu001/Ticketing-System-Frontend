import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Upload } from 'lucide-react';
import MentionInput from '../components/ui/MentionInput';
import api from '../api/client';

interface Product {
  _id: string;
  name: string;
  category: string;
}

interface Feature {
  _id: string;
  name: string;
  productId: string;
}

interface Category {
  _id: string;
  name: string;
  featureId: string;
}

interface Severity {
  _id: string;
  name: string;
  level: number;
  description?: string;
}

const CreateTicketPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [severities, setSeverities] = useState<Severity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    productId: (location.state as any)?.productId || '',
    featureId: '',
    categoryId: '',
    severityId: '',
    tags: [] as string[],
    mentions: '',
    attachments: [] as File[]
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchSeverities();
  }, []);

  useEffect(() => {
    if (formData.productId) {
      fetchFeatures(formData.productId);
    }
  }, [formData.productId]);

  useEffect(() => {
    if (formData.featureId) {
      fetchCategories(formData.featureId);
    }
  }, [formData.featureId]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchFeatures = async (productId: string) => {
    try {
      const response = await api.get(`/features/product/${productId}`);
      setFeatures(response.data.data.features || []);
    } catch (error) {
      console.error('Error fetching features:', error);
    }
  };

  const fetchCategories = async (featureId: string) => {
    try {
      const response = await api.get(`/categories/feature/${featureId}`);
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSeverities = async () => {
    try {
      const response = await api.get('/system-settings/severities');
      setSeverities(response.data.data.severities || []);
    } catch (error) {
      console.error('Error fetching severities:', error);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Form data before submit:', formData);
      
      // Extract mentions from text (e.g., "@username", "@email@domain.com")
      const extractMentions = (text: string): string[] => {
        // Match @email@domain.com or @username
        const emailMentionRegex = /@([\w.-]+@[\w.-]+\.[\w]+)/g;
        const usernameMentionRegex = /@(\w+)/g;
        
        const mentions: string[] = [];
        
        // First extract email mentions
        let match;
        while ((match = emailMentionRegex.exec(text)) !== null) {
          if (match[1]) {
            mentions.push(match[1]);
          }
        }
        
        // Then extract username mentions (but skip if already part of email)
        const textWithoutEmails = text.replace(emailMentionRegex, '');
        const usernameMatches = textWithoutEmails.match(usernameMentionRegex);
        if (usernameMatches) {
          mentions.push(...usernameMatches.map(m => m.substring(1)));
        }
        
        // Remove duplicates
        return [...new Set(mentions)];
      };

      // Get mentions from both description and mentions field
      const descriptionMentions = extractMentions(formData.description);
      const mentionFieldMentions = extractMentions(formData.mentions);
      const allMentions = [...new Set([...descriptionMentions, ...mentionFieldMentions])];

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('productId', formData.productId);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('severityId', formData.severityId);
      
      // Send mentions as JSON array
      if (allMentions.length > 0) {
        formDataToSend.append('mentions', JSON.stringify(allMentions));
        console.log('Mentions being sent:', allMentions);
      }
      
      if (formData.tags.length > 0) {
        formDataToSend.append('tags', JSON.stringify(formData.tags));
      }
      
      formData.attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      console.log('Sending form data...');
      const response = await api.post('/tickets', formDataToSend);

      console.log('Response:', response.data);
      if (response.data) {
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate('/tickets');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Error creating ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 px-4 py-8">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform transition-all animate-bounce-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ticket Created Successfully!</h3>
              <p className="text-gray-600 mb-4">Your support ticket has been submitted.</p>
              <div className="flex justify-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create New Ticket
          </h1>
          <p className="text-xl text-gray-600">Submit a detailed support request</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
              <h2 className="text-xl font-bold text-white">Basic Information</h2>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Created By</label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="font-semibold">{user?.fullName}</span>
                  <span className="text-sm text-gray-600 ml-2">({user?.email})</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value, featureId: '', categoryId: '' }))}
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select a product...</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} - {product.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description..."
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Description <span className="text-red-500">*</span>
                </label>
                <MentionInput
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Detailed description..."
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  rows={6}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <h2 className="text-xl font-bold text-white">Classification</h2>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Feature <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.featureId}
                    onChange={(e) => setFormData(prev => ({ ...prev, featureId: e.target.value, categoryId: '' }))}
                    disabled={!formData.productId}
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100"
                  >
                    <option value="">Select feature...</option>
                    {features.map(feature => (
                      <option key={feature._id} value={feature._id}>{feature.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    disabled={!formData.featureId}
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100"
                  >
                    <option value="">Select category...</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Severity <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.severityId}
                    onChange={(e) => setFormData(prev => ({ ...prev, severityId: e.target.value }))}
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select severity...</option>
                    {severities.map(severity => (
                      <option key={severity._id} value={severity._id}>
                        {severity.level} - {severity.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Tags</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Add tags (press Enter)..."
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                {formData.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-semibold">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-2">
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
              <h2 className="text-xl font-bold text-white">Mentions & Attachments</h2>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Mentions</label>
                <MentionInput
                  value={formData.mentions}
                  onChange={(value) => setFormData(prev => ({ ...prev, mentions: value }))}
                  placeholder="@mention users or departments..."
                  className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Attachments</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-lg font-bold text-gray-900 block mb-2">Upload files</span>
                    <span className="text-sm text-gray-600">PNG, JPG, PDF up to 10MB</span>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="font-medium">{file.name}</span>
                        <button type="button" onClick={() => removeFile(index)} className="text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title || !formData.description || !formData.productId || !formData.categoryId || !formData.severityId}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;
