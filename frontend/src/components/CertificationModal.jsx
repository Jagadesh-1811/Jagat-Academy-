import React from 'react';

const CertificationModal = ({ isOpen, onClose, message, formLink }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-4 border-black p-8 max-w-md w-full mx-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-black text-sm">
                  JA
                </div>
                <h2 className="text-2xl font-black text-black uppercase tracking-tight">Certification</h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-xl hover:bg-black hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="bg-gray-50 border-2 border-black p-4 mb-6">
              <p className="text-gray-800 font-bold text-sm leading-relaxed">
                {message}
              </p>
            </div>

            {/* Actions */}
            {formLink ? (
              <a
                href={formLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-black border-2 border-black text-white text-center font-black py-4 uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all mb-3"
              >
                Apply for Certificate →
              </a>
            ) : (
              <div className="bg-gray-200 border-2 border-black p-4 mb-3 text-center">
                <p className="text-gray-600 font-bold text-sm">No application form available at the moment.</p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full border-2 border-black text-black font-black py-4 uppercase text-sm tracking-wider hover:bg-gray-100 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificationModal;
