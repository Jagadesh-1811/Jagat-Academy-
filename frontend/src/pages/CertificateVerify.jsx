import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';

const LEVEL_LABELS = {
  Platinum: 'Platinum',
  Gold:     'Gold',
  Silver:   'Silver',
  Bronze:   'Bronze',
};

export default function CertificateVerify() {
  const { certId: paramId } = useParams();
  const [certId,    setCertId]  = useState(paramId || '');
  const [state,     setState]   = useState('idle'); // idle | loading | verified | revoked | notfound
  const [cert,      setCert]    = useState(null);
  const [error,     setError]   = useState('');

  useEffect(() => {
    if (paramId) verify(paramId);
  }, [paramId]);

  async function verify(id) {
    const targetId = (id || certId).trim();
    if (!targetId) { setError('Please enter a Certificate ID.'); return; }
    setError('');
    setState('loading');
    setCert(null);
    try {
      const { data } = await axios.post(`${serverUrl}/api/certification/verify`, {
        certificateId: targetId,
      });
      setCert(data.certificate);
      setState(data.verified ? 'verified' : (data.certificate?.status === 'revoked' ? 'revoked' : 'notfound'));
    } catch {
      setState('notfound');
    }
  }

  const levelLabel = cert?.level ? LEVEL_LABELS[cert.level] || LEVEL_LABELS.Gold : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ─── Header ─── */}
      <header className="bg-black border-b-4 border-black px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-black border-2 border-white flex items-center justify-center text-white font-black text-lg">
            JA
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-none tracking-wide">JAGAT ACADEMY</p>
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">Certificate Verifier</p>
          </div>
        </Link>
        <a href="/" className="text-gray-400 hover:text-white text-sm font-bold transition-colors">← Back</a>
      </header>

      {/* ─── Hero ─── */}
      <div className="bg-white border-b-4 border-black px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-black mb-3 uppercase tracking-tight">
          Verify a Certificate
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto font-medium">
          Enter the unique Certificate ID printed on the document, or scan the QR code to validate its authenticity instantly.
        </p>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 bg-gray-50 px-4 py-12">
        <div className="w-full max-w-xl mx-auto space-y-6">

          {/* Input box */}
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <label className="block text-black text-sm font-bold mb-2 uppercase tracking-wider">
              Certificate ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={certId}
                onChange={e => setCertId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verify()}
                placeholder="e.g. JAGT-A1B2C3D4"
                className="flex-1 border-2 border-black px-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white text-black placeholder-gray-400"
              />
              <button
                onClick={() => verify()}
                disabled={state === 'loading'}
                className="bg-black border-2 border-black text-white font-extrabold px-6 py-3 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
              >
                {state === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Verify →'}
              </button>
            </div>
            {error && <p className="mt-2 text-red-600 text-xs font-bold">{error}</p>}
          </div>

          {/* ─── Result ─── */}
          {state !== 'idle' && state !== 'loading' && (
            <div className={`bg-white border-4 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
              state === 'verified' ? 'border-black' : 
              state === 'revoked' ? 'border-black' : 'border-black'
            }`}>

              {/* Verified */}
              {state === 'verified' && cert && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 bg-gray-100 border-2 border-black px-4 py-3">
                    <div className="w-8 h-8 bg-black flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-black text-black text-base uppercase">Certificate Verified</p>
                      <p className="text-gray-600 text-xs font-bold">Issued by Jagat Academy - Authentic and Tamper-free</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoRow label="Student Name"   value={cert.studentId?.name   || '—'} />
                    <InfoRow label="Course"         value={cert.courseId?.title   || '—'} />
                    <InfoRow label="Certificate ID" value={cert.certificateId}             mono />
                    <InfoRow label="Issue Date"     value={new Date(cert.issueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })} />
                    <InfoRow label="Issued By"      value="Jagadeeshwar C V, Founder" />
                    <InfoRow label="Institution"    value="Jagat Academy" />
                  </div>

                  {levelLabel && (
                    <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 font-bold text-sm uppercase tracking-wider">
                      {levelLabel} Certificate
                    </div>
                  )}

                  {cert.ipfsHash && (
                    <a
                      href={`${serverUrl}${cert.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-black border-2 border-black text-white font-bold px-5 py-3 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      View / Download PDF
                    </a>
                  )}
                </div>
              )}

              {/* Revoked */}
              {state === 'revoked' && (
                <div className="flex items-start gap-3 bg-gray-100 border-2 border-black px-4 py-4">
                  <div className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0">
                    <span className="text-black font-black text-lg">!</span>
                  </div>
                  <div>
                    <p className="font-black text-black text-base uppercase">Certificate Revoked</p>
                    <p className="text-gray-700 text-sm font-medium mt-1">
                      This certificate has been revoked by Jagat Academy and is no longer valid. Please contact the institution for more information.
                    </p>
                  </div>
                </div>
              )}

              {/* Not found */}
              {state === 'notfound' && (
                <div className="flex items-start gap-3 bg-gray-100 border-2 border-black px-4 py-4">
                  <div className="w-8 h-8 border-2 border-black flex items-center justify-center shrink-0">
                    <span className="text-black font-black text-lg">X</span>
                  </div>
                  <div>
                    <p className="font-black text-black text-base uppercase">Certificate Not Found</p>
                    <p className="text-gray-700 text-sm font-medium mt-1">
                      No certificate matching that ID was found in our records. Please double-check the ID and try again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trust strip */}
          <div className="flex items-center justify-center gap-3 text-gray-400 text-xs font-bold pt-2">
            <span>Secure and Tamper-proof</span>
            <span className="text-gray-300">|</span>
            <span>Jagat Academy Official Portal</span>
            <span className="text-gray-300">|</span>
            <span>SHA-256 Signed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Small helper ─── */
function InfoRow({ label, value, mono }) {
  return (
    <div className="border-2 border-black bg-white px-4 py-3">
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-black font-black text-sm break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
