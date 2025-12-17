import React, { useState } from 'react';
import { AppState, DigitizedResult } from './types';
import { digitizeDiagram } from './services/geminiService';
import { Uploader } from './components/Uploader';
import { Button } from './components/Button';

export default function App() {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [result, setResult] = useState<DigitizedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (base64Data: string) => {
    setOriginalImage(`data:image/png;base64,${base64Data}`);
    setState(AppState.ANALYZING);
    setError(null);

    try {
      const data = await digitizeDiagram(base64Data);
      setResult(data);
      setState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong processing your image. Please try again.");
      setState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setState(AppState.IDLE);
    setOriginalImage(null);
    setResult(null);
    setError(null);
  };

  const downloadSVG = () => {
    if (!result) return;
    const blob = new Blob([result.svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleargraph-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">ClearGraph</h1>
          </div>
          <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-500 hover:text-indigo-600">
            Powered by Gemini
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        {state === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center w-full max-w-2xl mt-12 space-y-8 animate-fade-in-up">
            <div className="text-center space-y-4">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Make your diagrams <span className="text-indigo-600">crystal clear</span>.
              </h2>
              <p className="text-lg text-gray-600 max-w-lg mx-auto">
                Upload a fuzzy sketch, photo, or screenshot of a geometry problem. We'll redraw it instantly as a high-precision SVG.
              </p>
            </div>
            <div className="w-full">
              <Uploader onImageSelected={handleImageSelected} />
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg opacity-70">
              <div className="h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <span className="text-xs text-gray-400 font-medium">Hand-drawn</span>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div className="h-24 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
                <span className="text-xs text-indigo-400 font-medium">Vector SVG</span>
              </div>
            </div>
          </div>
        )}

        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center w-full mt-24 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                 </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">Analyzing Geometry</h3>
              <p className="text-gray-500 mt-2">Gemini is identifying shapes, labels, and dimensions...</p>
            </div>
          </div>
        )}

        {(state === AppState.SUCCESS || state === AppState.ERROR) && (
          <div className="w-full flex flex-col space-y-6">
             <div className="flex justify-between items-center w-full">
                <Button variant="secondary" onClick={handleReset}>
                  ← Upload New
                </Button>
                {state === AppState.SUCCESS && (
                  <Button onClick={downloadSVG}>
                    Download SVG
                  </Button>
                )}
             </div>

            {state === AppState.ERROR && (
               <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
                  <p className="font-medium">{error}</p>
                  <Button variant="outline" className="mt-4" onClick={handleReset}>Try Again</Button>
               </div>
            )}

            {state === AppState.SUCCESS && result && originalImage && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                {/* Original */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Original</span>
                  </div>
                  <div className="flex-grow p-6 flex items-center justify-center bg-gray-50/50">
                    <img 
                      src={originalImage} 
                      alt="Original upload" 
                      className="max-h-[500px] w-auto object-contain rounded-md shadow-sm"
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-500/10 border border-indigo-100 overflow-hidden flex flex-col h-full ring-1 ring-indigo-50">
                   <div className="bg-indigo-50/50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
                    <span className="text-sm font-semibold text-indigo-900 uppercase tracking-wider">Digitized Version</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">SVG</span>
                  </div>
                  <div className="flex-grow p-6 flex items-center justify-center bg-white" dangerouslySetInnerHTML={{ __html: result.svgContent }} />
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                     <h4 className="font-semibold text-gray-900">{result.title}</h4>
                     <p className="text-sm text-gray-600 mt-1 leading-relaxed">{result.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
