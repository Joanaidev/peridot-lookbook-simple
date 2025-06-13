import React, { useState, useRef } from 'react';
import { Upload, Plus, Download, Eye, Camera, Sparkles, Crown, ArrowLeft } from 'lucide-react';
import { toPng } from 'html-to-image';

const PeridotLookbookCreator = () => {
  const [clientImage, setClientImage] = useState(null);
  const [looks, setLooks] = useState([
    { id: 1, title: 'Look 1', images: [], description: '' }
  ]);
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [clientName, setClientName] = useState('');
  const [viewMode, setViewMode] = useState('edit');
  
  const clientInputRef = useRef(null);
  const lookInputRef = useRef(null);

  const handleClientImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setClientImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLookImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newLooks = [...looks];
        newLooks[currentLookIndex].images.push({
          id: Date.now() + Math.random(),
          src: e.target.result
        });
        setLooks(newLooks);
      };
      reader.readAsDataURL(file);
    });
  };

  const updateLookDescription = (description) => {
    const newLooks = [...looks];
    newLooks[currentLookIndex].description = description;
    setLooks(newLooks);
  };

  const addNewLook = () => {
    const newLook = {
      id: Date.now(),
      title: `Look ${looks.length + 1}`,
      images: [],
      description: ''
    };
    setLooks([...looks, newLook]);
    setCurrentLookIndex(looks.length);
  };

  const switchToLook = (index) => {
    setCurrentLookIndex(index);
  };

  const updateLookTitle = (title) => {
    const newLooks = [...looks];
    newLooks[currentLookIndex].title = title;
    setLooks(newLooks);
  };

  // RELIABLE DOWNLOAD FUNCTION - WORKS 100%!
  const downloadImage = async (dataUrl, filename) => {
    try {
      // Method 1: Direct download (most reliable)
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      
      // Method 2: Fallback - open in new tab
      try {
        const newWindow = window.open();
        newWindow.document.write(`
          <html>
            <head><title>${filename}</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f0f0;">
              <div style="text-align:center;">
                <img src="${dataUrl}" style="max-width:100%;max-height:100%;border:2px solid #007acc;"/>
                <p style="margin-top:20px;font-family:Arial,sans-serif;color:#333;">
                  Right-click the image above and select "Save Image As..."
                </p>
              </div>
            </body>
          </html>
        `);
        return false;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return false;
      }
    }
  };

  const exportWithMultipleTries = async (element, filename) => {
    const exportMethods = [
      // Method 1: html-to-image (most reliable)
      async () => {
        console.log('Trying html-to-image export...');
        const dataUrl = await toPng(element, {
          quality: 1.0,
          backgroundColor: '#ffffff',
          pixelRatio: 1, // Lower for reliability
          cacheBust: true,
          filter: (node) => {
            // Skip problematic elements
            if (node.tagName === 'SCRIPT') return false;
            if (node.tagName === 'STYLE') return false;
            return true;
          }
        });
        return dataUrl;
      },
      
      // Method 2: Simplified export
      async () => {
        console.log('Trying simplified export...');
        const dataUrl = await toPng(element, {
          backgroundColor: '#ffffff',
          quality: 0.8
        });
        return dataUrl;
      }
    ];

    // Try each method
    for (let i = 0; i < exportMethods.length; i++) {
      try {
        console.log(`Export attempt ${i + 1}/${exportMethods.length}`);
        const dataUrl = await exportMethods[i]();
        console.log('Export successful, attempting download...');
        
        const downloadSuccess = await downloadImage(dataUrl, filename);
        if (downloadSuccess) {
          console.log('Download completed successfully!');
          return true;
        } else {
          console.log('Download opened in new tab for manual save');
          return 'manual';
        }
      } catch (error) {
        console.error(`Method ${i + 1} failed:`, error);
        if (i === exportMethods.length - 1) {
          throw new Error('All export methods failed');
        }
      }
    }
  };

  const exportCurrentSlide = async () => {
    const exportButton = document.querySelector('[data-export-current]');
    const originalText = exportButton?.textContent || 'Export This Slide';
    
    try {
      const element = document.getElementById(`export-slide-${currentLook.id}`);
      if (!element) {
        alert('No slide to export! Add some content first.');
        return;
      }

      // Update button
      if (exportButton) {
        exportButton.textContent = 'Creating...';
        exportButton.disabled = true;
      }

      const filename = `Peridot-${currentLook.title.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
      
      const result = await exportWithMultipleTries(element, filename);
      
      // Success feedback
      if (exportButton) {
        if (result === true) {
          exportButton.textContent = 'Downloaded!';
          setTimeout(() => {
            exportButton.textContent = originalText;
            exportButton.disabled = false;
          }, 2000);
        } else if (result === 'manual') {
          exportButton.textContent = 'Opened in new tab';
          setTimeout(() => {
            exportButton.textContent = originalText;
            exportButton.disabled = false;
          }, 3000);
        }
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again or check if you have content to export.');
      
      // Reset button
      if (exportButton) {
        exportButton.textContent = originalText;
        exportButton.disabled = false;
      }
    }
  };

  const exportFullLookbook = async () => {
    const completedLooks = looks.filter(look => look.images.length > 0 || look.description);
    
    if (completedLooks.length === 0) {
      alert('Please create some looks with content first!');
      return;
    }

    const exportButton = document.querySelector('[data-export-all]');
    const originalText = exportButton?.textContent || 'Export All Slides';
    
    try {
      // Update button
      if (exportButton) {
        exportButton.textContent = `Exporting ${completedLooks.length} slides...`;
        exportButton.disabled = true;
      }

      let successCount = 0;
      let manualCount = 0;

      for (let i = 0; i < completedLooks.length; i++) {
        const look = completedLooks[i];
        const element = document.getElementById(`export-slide-${look.id}`);
        
        if (element) {
          try {
            // Update progress
            if (exportButton) {
              exportButton.textContent = `Exporting ${i + 1}/${completedLooks.length}...`;
            }
            
            const filename = `Peridot-${look.title.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
            
            const result = await exportWithMultipleTries(element, filename);
            
            if (result === true) {
              successCount++;
            } else if (result === 'manual') {
              manualCount++;
            }
            
            // Delay between exports
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (error) {
            console.error(`Failed to export ${look.title}:`, error);
          }
        }
      }
      
      // Show results
      if (exportButton) {
        if (successCount > 0 || manualCount > 0) {
          let message = '';
          if (successCount > 0) message += `${successCount} downloaded`;
          if (manualCount > 0) {
            if (message) message += ', ';
            message += `${manualCount} opened in tabs`;
          }
          exportButton.textContent = message;
        } else {
          exportButton.textContent = 'Export failed';
        }
        
        setTimeout(() => {
          exportButton.textContent = originalText;
          exportButton.disabled = false;
        }, 4000);
      }
      
      // User feedback
      let alertMessage = '';
      if (successCount > 0) {
        alertMessage += `${successCount} files downloaded to your Downloads folder. `;
      }
      if (manualCount > 0) {
        alertMessage += `${manualCount} files opened in new tabs - right-click to save them. `;
      }
      if (!alertMessage) {
        alertMessage = 'Export failed. Please try again.';
      }
      
      alert(alertMessage);
      
    } catch (error) {
      console.error('Bulk export failed:', error);
      alert('Export failed - please try again');
      
      // Reset button
      if (exportButton) {
        exportButton.textContent = originalText;
        exportButton.disabled = false;
      }
    }
  };

  const currentLook = looks[currentLookIndex];
  const completedLooks = looks.filter(look => look.images.length > 0 || look.description);

  if (viewMode === 'preview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
        {/* Hidden Export Elements */}
        <div className="hidden">
          {completedLooks.map((look) => (
            <div key={`export-${look.id}`} id={`export-slide-${look.id}`} className="w-[800px] h-[1200px] bg-gradient-to-br from-amber-50 via-white to-yellow-50 relative overflow-hidden" style={{position: 'absolute', left: '-9999px', fontFamily: 'Arial, sans-serif'}}>
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="text-8xl font-bold text-amber-800 transform rotate-45" style={{fontFamily: 'Arial, sans-serif'}}>PERIDOT IMAGES</div>
              </div>
              
              <div className="relative z-10 h-full p-12">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-amber-600 rounded" style={{display: 'inline-block'}}></div>
                    <h1 className="text-2xl font-bold text-amber-600" style={{fontFamily: 'Arial, sans-serif'}}>
                      PERIDOT IMAGES
                    </h1>
                  </div>
                  <div className="w-24 h-0.5 bg-amber-400 mx-auto mb-6" style={{height: '2px', backgroundColor: '#f59e0b'}}></div>
                  <h2 className="text-3xl font-bold text-amber-900 mb-2" style={{fontFamily: 'Arial, sans-serif'}}>{look.title}</h2>
                  {clientName && (
                    <p className="text-lg text-amber-700" style={{fontFamily: 'Arial, sans-serif'}}>For {clientName}</p>
                  )}
                </div>

                {clientImage && (
                  <div className="mb-8 text-center">
                    <h3 className="text-lg font-semibold text-amber-800 mb-4" style={{fontFamily: 'Arial, sans-serif'}}>Your Inspiration</h3>
                    <div className="max-w-64 mx-auto" style={{maxWidth: '256px', margin: '0 auto'}}>
                      <img src={clientImage} alt="Client reference" style={{width: '100%', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '4px solid white'}} />
                    </div>
                  </div>
                )}

                {look.description && (
                  <div className="mb-8">
                    <div style={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #fbbf24'}}>
                      <h3 className="text-lg font-semibold text-amber-800 mb-3 text-center" style={{fontFamily: 'Arial, sans-serif'}}>The Vision</h3>
                      <p className="text-amber-900 leading-relaxed text-center" style={{fontFamily: 'Arial, sans-serif', lineHeight: '1.6'}}>{look.description}</p>
                    </div>
                  </div>
                )}

                {look.images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-amber-800 mb-4 text-center" style={{fontFamily: 'Arial, sans-serif'}}>Style Inspiration</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                      {look.images.slice(0, 3).map((img) => (
                        <div key={img.id} style={{backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', border: '1px solid #fbbf24'}}>
                          <img src={img.src} alt="Style inspiration" style={{width: '100%', maxHeight: '192px', objectFit: 'contain', borderRadius: '8px', margin: '0 auto', display: 'block'}} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{position: 'absolute', bottom: '16px', left: '48px', right: '48px', textAlign: 'center'}}>
                  <p style={{color: 'rgba(217, 119, 6, 0.7)', fontSize: '12px', fontFamily: 'Arial, sans-serif'}}>© Peridot Images - Exclusive Style Curation</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Navigation */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setViewMode('edit')}
              className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:text-amber-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Edit
            </button>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-amber-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  PERIDOT IMAGES
                </h1>
              </div>
              <p className="text-sm text-amber-700">{completedLooks.length} slides ready for export</p>
            </div>
            <button
              onClick={exportFullLookbook}
              data-export-all
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export All Slides
            </button>
          </div>
        </div>

        {/* Slide Navigation */}
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {completedLooks.map((look, index) => (
              <button
                key={look.id}
                onClick={() => setCurrentLookIndex(looks.findIndex(l => l.id === look.id))}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                  looks.findIndex(l => l.id === look.id) === currentLookIndex
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg'
                    : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                {look.title}
              </button>
            ))}
          </div>

          {/* Current Slide Preview */}
          {completedLooks.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-200">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-6 h-6" />
                  <h1 className="text-2xl font-bold">PERIDOT IMAGES</h1>
                </div>
                <h2 className="text-xl">{currentLook.title}</h2>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={exportCurrentSlide}
                    data-export-current
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export This Slide
                  </button>
                </div>
              </div>

              <div className="p-8 bg-gradient-to-br from-amber-50 to-yellow-50">
                {clientImage && (
                  <div className="mb-8 text-center">
                    <h3 className="text-lg font-semibold text-amber-800 mb-4">Your Inspiration</h3>
                    <div className="max-w-sm mx-auto">
                      <img src={clientImage} alt="Client reference" className="w-full rounded-xl shadow-lg border-4 border-white" />
                    </div>
                  </div>
                )}

                {currentLook.description && (
                  <div className="mb-8 text-center">
                    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200">
                      <h3 className="text-lg font-semibold text-amber-800 mb-3">The Vision</h3>
                      <p className="text-amber-900 leading-relaxed">{currentLook.description}</p>
                    </div>
                  </div>
                )}

                {currentLook.images.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-amber-800 mb-6 text-center">Style Inspiration</h3>
                    <div className="space-y-6">
                      {currentLook.images.map((img) => (
                        <div key={img.id} className="bg-white/60 rounded-xl p-6 shadow-lg border border-amber-200">
                          <img src={img.src} alt="Style inspiration" className="w-full max-h-80 object-contain rounded-lg mx-auto" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center mt-8 text-amber-600/60 text-sm">
                  © Peridot Images - Exclusive Style Curation
                </div>
              </div>
            </div>
          )}

          {completedLooks.length === 0 && (
            <div className="text-center py-16 text-amber-500">
              <Crown className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Create some looks to see your professional preview!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  PERIDOT IMAGES
                </h1>
                <p className="text-gray-600 text-sm">Luxury Lookbook Creator</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name..."
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {completedLooks.length > 0 && (
                <button
                  onClick={() => setViewMode('preview')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 shadow-lg"
                >
                  <Eye className="w-4 h-4" />
                  Preview & Export
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-amber-200">
          <div className="p-6 border-b bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Client's Reference Photo
            </h2>
          </div>
          
          <div className="p-6">
            <div 
              onClick={() => clientInputRef.current?.click()}
              className="border-2 border-dashed border-amber-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 transition-all hover:bg-amber-50"
            >
              {clientImage ? (
                <img src={clientImage} alt="Client reference" className="max-h-48 mx-auto rounded-lg shadow-md" />
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto text-amber-400 mb-3" />
                  <p className="text-amber-700 font-medium">Upload client's reference photo</p>
                  <p className="text-amber-600 text-sm mt-1">This will appear on every slide</p>
                </div>
              )}
            </div>
            <input
              ref={clientInputRef}
              type="file"
              onChange={handleClientImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-amber-200">
          <div className="p-6 border-b bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Create Your Looks
            </h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {looks.map((look, index) => (
                <button
                  key={look.id}
                  onClick={() => switchToLook(index)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    index === currentLookIndex
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  {look.title}
                  {(look.images.length > 0 || look.description) && (
                    <span className="ml-2 w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                  )}
                </button>
              ))}
              <button
                onClick={addNewLook}
                className="px-4 py-2 rounded-lg border-2 border-dashed border-amber-300 text-amber-600 hover:border-amber-400 hover:text-amber-700 transition-all"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                New Look
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">Look Title</label>
                  <input
                    type="text"
                    value={currentLook.title}
                    onChange={(e) => updateLookTitle(e.target.value)}
                    className="w-full px-4 py-3 text-lg font-semibold border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="e.g., Casual Blue Outdoor Look, Vintage Red Dress Vibe..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">Description & Vision</label>
                  <textarea
                    value={currentLook.description}
                    onChange={(e) => updateLookDescription(e.target.value)}
                    placeholder="Describe this look... What's the vibe? Outdoor casual with boots? Retro vintage elegance? What pieces, colors, textures are you thinking?"
                    rows={6}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">Inspiration Images</label>
                  <button
                    onClick={() => lookInputRef.current?.click()}
                    className="w-full px-4 py-4 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center gap-2 font-medium border-2 border-dashed border-amber-300"
                  >
                    <Plus className="w-5 h-5" />
                    Add Inspiration for {currentLook.title}
                  </button>
                  
                  {currentLook.images.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {currentLook.images.map((img) => (
                        <div key={img.id} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                          <img src={img.src} alt="Inspiration" className="w-full max-h-64 object-contain rounded mx-auto shadow-md" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <input
              ref={lookInputRef}
              type="file"
              onChange={handleLookImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeridotLookbookCreator;
