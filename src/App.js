import React, { useState, useRef } from 'react';
import { Upload, Plus, Download, Eye, Camera, Sparkles, Crown, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';

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

  // FIXED EXPORT FUNCTION - This will actually download files!
  const downloadImage = (canvas, filename) => {
    // Convert canvas to blob (more reliable than dataURL)
    canvas.toBlob((blob) => {
      if (blob) {
        // Handle Internet Explorer
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, filename);
          return;
        }

        // Create download link for other browsers
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.style.display = 'none';
        downloadLink.href = url;
        downloadLink.download = filename;
        
        // Add to page, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Clean up after download
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(url);
        }, 100);
      }
    }, 'image/png', 0.95);
  };

  const exportCurrentSlide = async () => {
    try {
      const element = document.getElementById(`export-slide-${currentLook.id}`);
      if (!element) {
        alert('No slide to export! Add some content first.');
        return;
      }

      // Update button to show progress
      const exportButton = document.querySelector('[data-export-current]');
      const originalText = exportButton?.textContent;
      if (exportButton) {
        exportButton.textContent = 'Creating...';
        exportButton.disabled = true;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false
      });
      
      // Generate filename and download
      const filename = `Peridot-${currentLook.title}-${Date.now()}.png`;
      downloadImage(canvas, filename);
      
      // Show success and reset button
      if (exportButton) {
        exportButton.textContent = 'Downloaded!';
        setTimeout(() => {
          exportButton.textContent = originalText;
          exportButton.disabled = false;
        }, 2000);
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed - please try again');
      
      // Reset button on error
      const exportButton = document.querySelector('[data-export-current]');
      if (exportButton) {
        exportButton.textContent = 'Export This Slide';
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

    // Update button to show progress
    const exportButton = document.querySelector('[data-export-all]');
    const originalText = exportButton?.textContent;
    if (exportButton) {
      exportButton.textContent = `Exporting ${completedLooks.length} slides...`;
      exportButton.disabled = true;
    }

    let successCount = 0;

    for (let i = 0; i < completedLooks.length; i++) {
      const look = completedLooks[i];
      const element = document.getElementById(`export-slide-${look.id}`);
      
      if (element) {
        try {
          const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: false
          });
          
          // Generate filename and download
          const filename = `Peridot-${look.title}-${Date.now()}.png`;
          downloadImage(canvas, filename);
          
          successCount++;
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 800));
          
        } catch (error) {
          console.error(`Error creating ${look.title}:`, error);
        }
      }
    }
    
    // Show completion message and reset button
    if (exportButton) {
      exportButton.textContent = `${successCount} files downloaded!`;
      setTimeout(() => {
        exportButton.textContent = originalText;
        exportButton.disabled = false;
      }, 3000);
    }
    
    if (successCount > 0) {
      alert(`Success! ${successCount} PNG files have been downloaded to your Downloads folder.`);
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
            <div key={`export-${look.id}`} id={`export-slide-${look.id}`} className="w-[800px] h-[1200px] bg-gradient-to-br from-amber-50 via-white to-yellow-50 relative overflow-hidden" style={{position: 'absolute', left: '-9999px'}}>
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="text-8xl font-bold text-amber-800 transform rotate-45">PERIDOT IMAGES</div>
              </div>
              
              <div className="relative z-10 h-full p-12">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-amber-600" />
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                      PERIDOT IMAGES
                    </h1>
                  </div>
                  <div className="w-24 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto mb-6"></div>
                  <h2 className="text-3xl font-bold text-amber-900 mb-2">{look.title}</h2>
                  {clientName && (
                    <p className="text-lg text-amber-700">For {clientName}</p>
                  )}
                </div>

                {clientImage && (
                  <div className="mb-8 text-center">
                    <h3 className="text-lg font-semibold text-amber-800 mb-4">Your Inspiration</h3>
                    <div className="max-w-64 mx-auto">
                      <img src={clientImage} alt="Client reference" className="w-full rounded-2xl shadow-lg border-4 border-white" />
                    </div>
                  </div>
                )}

                {look.description && (
                  <div className="mb-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200">
                      <h3 className="text-lg font-semibold text-amber-800 mb-3 text-center">The Vision</h3>
                      <p className="text-amber-900 leading-relaxed text-center">{look.description}</p>
                    </div>
                  </div>
                )}

                {look.images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-amber-800 mb-4 text-center">Style Inspiration</h3>
                    <div className="space-y-4">
                      {look.images.slice(0, 3).map((img) => (
                        <div key={img.id} className="bg-white/60 rounded-xl p-4 shadow-md border border-amber-200">
                          <img src={img.src} alt="Style inspiration" className="w-full max-h-48 object-contain rounded-lg mx-auto" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="absolute bottom-4 left-12 right-12 text-center">
                  <p className="text-amber-600/70 text-xs">© Peridot Images - Exclusive Style Curation</p>
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
