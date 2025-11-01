import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, Shield, Building2, AlertCircle, UserPlus } from 'lucide-react';
import userService from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { productService } from '../../services/productService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewCreateUserModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Uncontrolled inputs with refs
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);
  const departmentRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchProducts();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getDepartments();
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productService.getProducts();
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const validate = () => {
    const errs: any = {};
    const fn = firstNameRef.current?.value || '';
    const ln = lastNameRef.current?.value || '';
    const em = emailRef.current?.value || '';
    const pw = passwordRef.current?.value || '';
    const cpw = confirmPasswordRef.current?.value || '';

    if (!fn.trim()) errs.firstName = 'Required';
    if (!ln.trim()) errs.lastName = 'Required';
    if (!em.trim()) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(em)) errs.email = 'Invalid email';
    if (!pw) errs.password = 'Required';
    else if (pw.length < 8) errs.password = 'Min 8 characters';
    if (pw !== cpw) errs.confirmPassword = 'Passwords do not match';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data: any = {
        firstName: firstNameRef.current?.value,
        lastName: lastNameRef.current?.value,
        email: emailRef.current?.value,
        password: passwordRef.current?.value,
        role: roleRef.current?.value || 'user',
        productAccess: selectedProducts
      };

      const dept = departmentRef.current?.value;
      if (dept) data.departmentId = dept;

      await userService.createUser(data);
      onSuccess();
      handleClose();
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedProducts([]);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Create New User</h2>
                <p className="text-sm text-gray-500">Add a new team member</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstNameRef}
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="First name"
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={lastNameRef}
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Last name"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                ref={emailRef}
                type="email"
                className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="email@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  ref={passwordRef}
                  type="password"
                  className={`w-full px-3 py-2 border rounded-lg ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  ref={confirmPasswordRef}
                  type="password"
                  className={`w-full px-3 py-2 border rounded-lg ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Confirm"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select ref={roleRef} defaultValue="user" className="w-full px-3 py-2 border rounded-lg">
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {departments.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Department (Optional)</label>
                <select ref={departmentRef} defaultValue="" className="w-full px-3 py-2 border rounded-lg">
                  <option value="">No Department</option>
                  {departments.map((d: any) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {errors.submit}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCreateUserModal;
