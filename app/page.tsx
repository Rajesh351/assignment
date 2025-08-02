'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'phone', 'position'];
    const missingFields = requiredFields.filter(field => !form[field as keyof typeof form].trim());
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleView = () => {
    if (!validateForm()) return;
    
    try {
      localStorage.setItem('userData', JSON.stringify(form));
      router.push('/view');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  const handleDirectDownload = () => {
    if (!validateForm()) return;
    
    try {
      localStorage.setItem('userData', JSON.stringify(form));
      localStorage.setItem('directDownload', 'true');
      router.push('/view');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  const fields = [
    { name: 'name', label: 'Name', icon: '/icons/user.svg', required: true, type: 'text' },
    { name: 'email', label: 'Email', icon: '/icons/mail.svg', required: true, type: 'email' },
    { name: 'phone', label: 'Phone Number', icon: '/icons/phone-call.svg', required: true, type: 'tel' },
    { name: 'position', label: 'Position', icon: '/icons/position.svg', required: true, type: 'text' },
    { name: 'description', label: 'Description', icon: '/icons/Description.svg', required: false, type: 'textarea' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Your Details</h1>
          <p className="text-gray-600">Fill in your information to generate a professional PDF</p>
        </div>

        <div className="space-y-6">
          {fields.map((field) => (
            <div key={field.name} className="group">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 flex items-start shadow-sm group-focus-within:border-green-500 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  <Image src={field.icon} alt={field.label} width={24} height={24} className="opacity-70" />
                </div>
                <div className="flex flex-col w-full ml-4">
                  <label htmlFor={field.name} className="text-sm font-semibold text-gray-800 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      className="outline-none text-gray-700 text-sm placeholder:text-gray-400 resize-none min-h-[80px]"
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                    />
                  ) : (
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      className="outline-none text-gray-700 text-sm placeholder:text-gray-400"
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={handleView}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Image src="/icons/view.svg" alt="View Icon" width={20} height={20} />
              Preview PDF
            </button>

            <button
              type="button"
              onClick={handleDirectDownload}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Image src="/icons/Download.svg" alt="Download Icon" width={20} height={20} />
              Download PDF
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </p>
        </div>
      </div>
    </div>
  );
}