import React from 'react';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Register</h2>
          <p className="mt-2 text-gray-600">Registration is currently disabled.</p>
          <p className="mt-4 text-sm text-gray-500">
            Please contact your administrator for an account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;