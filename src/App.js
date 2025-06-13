import React, { useState, useRef } from 'react';
import { Upload, Plus, Eye, Camera, Sparkles, Crown } from 'lucide-react';

const PeridotLookbookCreator = () => {
  const [clientImage, setClientImage] = useState(null);
  const [looks, setLooks] = useState([
    { id: 1, title: 'Look 1', images: [], description: '' }
  ]);
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [clientName, setClientName] = useState('');
  
  const clientInputRef = useRef(null);

  const handleClientImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setClientImage(e.target.result);
      reader.readAsDataURL(file);
    }
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

  const currentLook = looks[currentLookIndex];

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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Client Reference Setup */}
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

        {/* Look Creator */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-amber-200">
          <div className="p-6 border-b bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Create Your Looks
            </h2>
          </div>
          
          <div className="p-6">
            {/* Look Tabs */}
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

            {/* Current Look Editor */}
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

              <div className="text-center py-8 bg-amber-50 rounded-lg border border-amber-200">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Working on: {currentLook.title}</h3>
                <p className="text-amber-600">More features coming soon: inspiration images, descriptions, and export!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeridotLookbookCreator;
