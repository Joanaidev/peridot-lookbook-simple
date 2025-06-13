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
  const lookInputRef = useRef(null);

  const handleClientImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setClientImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const currentLook = looks[currentLookIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                PERIDOT IMAGES
              </h1>
              <p className="text-gray-600 text-sm">Luxury Lookbook Creator</p>
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

        <div className="text-center py-16">
          <Crown className="w-16 h-16 mx-auto mb-4 text-amber-600" />
          <h2 className="text-2xl font-bold text-amber-800 mb-2">Peridot Images Lookbook Creator</h2>
          <p className="text-amber-600">Your professional styling tool is ready!</p>
        </div>
      </div>
    </div>
  );
};
export default PeridotLookbookCreator;  // ← WITH SEMICOLON
