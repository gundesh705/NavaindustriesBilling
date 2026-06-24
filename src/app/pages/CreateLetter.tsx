import { useState, useRef } from 'react';
import { Download, Eye, EyeOff } from 'lucide-react';
import pic from "../../letterpic/pic.png";
declare global {
  interface Window {
    html2pdf: any;
  }
}

export function CreateLetter() {
  const [recipientName, setRecipientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [greeting, setGreeting] = useState('DEAR SIR / MADAM,');
  const [bodyParagraphs, setBodyParagraphs] = useState(['']);
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!letterRef.current) return;

    setIsExporting(true);

    try {
      const element = letterRef.current;
      const printWindow = window.open('', '', 'width=800,height=600');

      if (!printWindow) {
        alert('Please allow pop-ups to export PDF');
        setIsExporting(false);
        return;
      }

      // Clone the letter element
      const clonedElement = element.cloneNode(true) as HTMLElement;

      // Write HTML to print window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Letter</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Open Sans', sans-serif;
              background: white;
              color: #000000;
            }
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
            }
              img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}
          </style>
        </head>
        <body>
          ${clonedElement.outerHTML}
        </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();

        // Close after print
        setTimeout(() => {
          printWindow.close();
          setIsExporting(false);
        }, 1000);
      }, 500);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
      setIsExporting(false);
    }
  };

  const addParagraph = () => {
    setBodyParagraphs([...bodyParagraphs, '']);
  };

  const updateParagraph = (index: number, text: string) => {
    const updated = [...bodyParagraphs];
    updated[index] = text;
    setBodyParagraphs(updated);
  };

  const removeParagraph = (index: number) => {
    if (bodyParagraphs.length > 1) {
      setBodyParagraphs(bodyParagraphs.filter((_, i) => i !== index));
    }
  };

  const getFormattedDate = () => {
    const dateObj = new Date();
    return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Letter</h1>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {!showPreview ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="font-semibold text-gray-900 mb-4">Recipient Details</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full address (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Letter Content</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Greeting</label>
                  <input
                    type="text"
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  {bodyParagraphs.map((para, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-gray-700">Paragraph {index + 1}</label>
                        {bodyParagraphs.length > 1 && (
                          <button
                            onClick={() => removeParagraph(index)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <textarea
                        value={para}
                        onChange={(e) => updateParagraph(index, e.target.value)}
                        placeholder="Enter paragraph text..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={addParagraph}
                  className="mt-4 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  + Add Paragraph
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              ref={letterRef}
              style={{ width: '210mm', margin: '0 auto', backgroundColor: 'white' }}
              className="shadow-lg rounded-lg overflow-hidden"
            >
              {/* Letter Template */}
              <div style={{ width: '210mm', minHeight: '297mm', display: 'flex', flexDirection: 'column', fontFamily: "'Open Sans', sans-serif" }}>
                {/* Header */}
                <div style={{ padding: '3.5rem 3rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                  {/* Left Side */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '50%' }}>
                    <div
  style={{
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }}
>
  <img
    src={pic}
    alt="Nava Industries"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    }}
  />
</div>
                    <div>
                      <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                        <span style={{ color: '#1a1a1a' }}>SRI NAVA</span> <span style={{ color: '#e52528' }}>INDUSTRIES</span>
                      </h1>
                      <p style={{ fontSize: '0.625rem', color: '#6b7280', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0.125rem 0 0 0' }}>
                        Fabricators, Laser Cutting & Welding, Structural Works
                      </p>
                    </div>
                  </div>

                  {/* Right Side - Contact Info */}
                  <div style={{ width: '50%', paddingRight: '1.5rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', right: '0.75rem', top: 0, bottom: 0, width: '6px', backgroundColor: '#1a1a1a', zIndex: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500, margin: 0 }}>+91 9345858195</p>
                        </div>
                        <div style={{ backgroundColor: '#e52528', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, minWidth: '24px' }}>
                          <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24" style={{ strokeWidth: 2 }}>
                            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500, margin: 0 }}>srinavaindustries@gmail.com</p>
                        </div>
                        <div style={{ backgroundColor: '#e52528', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, minWidth: '24px' }}>
                          <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24" style={{ strokeWidth: 2 }}>
                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.65rem', lineHeight: '1.2', color: '#374151', fontWeight: 500, margin: 0, maxWidth: '180px' }}>
                            1, Harbour Colony, 2nd Main road, Kodungaiyur, Chennai - 600118
                          </p>
                        </div>
                        <div style={{ backgroundColor: '#e52528', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, minWidth: '24px' }}>
                          <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24" style={{ strokeWidth: 2 }}>
                            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500, margin: 0 }}>GST: 33AFHPB5508G2ZW</p>
                        </div>
                        <div style={{ backgroundColor: '#1a1a1a', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, minWidth: '24px' }}>
                          <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24" style={{ strokeWidth: 2 }}>
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <main style={{ flex: 1, padding: '2.5rem 3rem' }}>
                  {/* Recipient & Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',marginTop: '0.5in',marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '0.875rem', minHeight: '100px' }}>
                      <p style={{ color: '#000000', marginBottom: '0.25rem', margin: 0 }}>To,</p>
                      {recipientName && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <h3 style={{ fontFamily: "'Montserrat', sans-serif", color: '#4b5563', fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>{recipientName}</h3>
                          {companyName && <p style={{ color: '#4b5563', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>{companyName}</p>}
                          <div style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: '0.55' }}>
                            {phone && <p style={{ margin: '0 0 0.75rem 0' }}>{phone}</p>}
                            {email && <p style={{ margin: '0 0 0.75rem 0' }}> {email}</p>}
                            {address && <p style={{ margin: '0 0 0.75rem 0' }}> {address}</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '1.5rem' }}>
                      <span style={{ color: '#e52528' }}>DATE:</span> <span style={{ color: '#1a1a1a', marginLeft: '0.25rem' }}>{getFormattedDate()}</span>
                    </div>
                  </div>

                  {/* Letter Body */}
                  <div style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.6, textAlign: 'justify', minHeight: '200px' }}>
                    <p style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: '1rem', textTransform: 'uppercase', margin: '0 0 1rem 0' }}>{greeting}</p>

                    {bodyParagraphs.map((para, idx) => (
                      para && <p key={idx} style={{ margin: '0 0 1.25rem 0' }}>{para}</p>
                    ))}
                  </div>

                  {/* Sender / Sign-off */}
                  <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '0.875rem' }}>
                      <p style={{ color: '#363737', marginBottom: '0.25rem', fontStyle: 'italic', margin: '0 0 0.25rem 0',marginTop: '2in' }}>From,</p>
                      <h3 style={{ fontFamily: "'Montserrat', sans-serif", color: '#e52528', fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.125rem', textTransform: 'uppercase', margin: '0 0 0.125rem 0' }}>SRI NAVA INDUSTRIES</h3>
                      <p style={{ color: '#000000', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Proprietor</p>
                    </div>

                   <div style={{ textAlign: 'center', width: '192px' }}>
  <div
    style={{
      borderTop: '1px solid #090909',
      width: '100%',
      marginBottom: '6px',
    }}
  />

  <p
    style={{
      margin: 0,
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#040404',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    }}
  >
    Signature
  </p>
</div>
                  </div>
                </main>

                {/* Bottom Geometric Footer */}
                <div style={{ width: '100%', height: '120px', position: 'relative', marginTop: 'auto' }}>
                  <svg style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }} preserveAspectRatio="none" viewBox="0 0 1000 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="250,25 700,25 680,35 230,35" fill="#1a1a1a" />
                    <polygon points="300,45 820,45 780,65 260,65" fill="#1a1a1a" />
                    <polygon points="0,80 380,80 340,120 0,120" fill="#1a1a1a" />
                    <polygon points="0,110 320,110 310,120 0,120" fill="#e52528" />
                    <polygon points="400,80 1000,80 1000,120 360,120" fill="#e52528" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Export as PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
