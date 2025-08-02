'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface UserData {
  name: string;
  email: string;
  phone: string;
  position: string;
  description: string;
}

export default function ViewPage() {
  const router = useRouter();
  const [data, setData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    description: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('userData');
      if (stored) {
        const parsedData = JSON.parse(stored);
        setData(parsedData);
        
        // Check if direct download was requested
        const directDownload = localStorage.getItem('directDownload');
        if (directDownload === 'true') {
          localStorage.removeItem('directDownload');
          // Small delay to ensure the component is rendered
          setTimeout(() => {
            handleDownload();
          }, 500);
        }
      } else {
        // No data found, redirect back to home
        alert('No user data found. Please fill in the form first.');
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Error loading data. Please try again.');
      router.push('/');
    }
  }, [router]);

  const handleDownload = async () => {
    const element = printRef.current;
    if (!element) {
      alert('Error: Content not ready for PDF generation');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Configure html2canvas options for better quality
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions to fit A4 page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // If content is taller than page, scale it down
      if (imgHeight > pdfHeight) {
        const scaledWidth = (canvas.width * pdfHeight) / canvas.height;
        const scaledHeight = pdfHeight;
        pdf.addImage(imgData, 'PNG', (pdfWidth - scaledWidth) / 2, 0, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 0, (pdfHeight - imgHeight) / 2, imgWidth, imgHeight);
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${data.name.replace(/\s+/g, '_')}_details_${timestamp}.pdf`;
      
      pdf.save(filename);
      
      // Show success message
      alert('PDF downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const iconMap: Record<string, string> = {
    name: 'user.svg',
    email: 'mail.svg',
    phone: 'phone-call.svg',
    position: 'position.svg',
    description: 'Description.svg',
  };

  const getFieldDisplayName = (key: string): string => {
    const displayNames: Record<string, string> = {
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      position: 'Job Position',
      description: 'Description',
    };
    return displayNames[key] || key;
  };

  // Don't render if no data
  if (!data.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.push('/')} 
            className="flex items-center text-sm text-gray-600 hover:text-black transition-colors"
          >
            <Image src="/icons/chevron-left.svg" alt="Back" width={20} height={20} className="mr-2" />
            Back to Form
          </button>
          
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center gap-2"
          >
            <Image src="/icons/Download.svg" alt="Download" width={20} height={20} />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

        {/* PDF Content */}
        <div ref={printRef} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Header Section */}
            <div className="text-center mb-8 pb-6 border-b border-gray-200">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Professional Profile</h1>
              <div className="w-24 h-1 bg-green-600 mx-auto"></div>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6">
              {Object.entries(data).map(([key, value]) => {
                // Skip empty fields
                if (!value || value.toString().trim() === '') return null;
                
                return (
                  <div key={key} className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Image 
                        src={`/icons/${iconMap[key]}`} 
                        alt={getFieldDisplayName(key)} 
                        width={24} 
                        height={24}
                        className="opacity-70"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {getFieldDisplayName(key)}
                      </h3>
                      <div className="text-gray-600 break-words">
                        {key === 'description' ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{value}</p>
                        ) : (
                          <p className="text-lg">{value}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Generated on {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Image src="/icons/chevron-left.svg" alt="Edit" width={20} height={20} />
            Edit Details
          </button>
          
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center justify-center gap-2"
          >
            <Image src="/icons/Download.svg" alt="Download" width={20} height={20} />
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating PDF...
              </>
            ) : (
              'Download PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}