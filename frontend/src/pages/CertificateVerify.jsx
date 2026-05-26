import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';

/* ─── Status colours ─── */
const STATUS = {
  idle:     { bg: 'bg-slate-50',   border: 'border-slate-200' },
  loading:  { bg: 'bg-slate-50',   border: 'border-slate-200' },
  verified: { bg: 'bg-green-50',   border: 'border-green-300' },
  revoked:  { bg: 'bg-red-50',     border: 'border-red-300'   },
  notfound: { bg: 'bg-yellow-50',  border: 'border-yellow-300'},
};

const LEVEL_BADGE = {
  Platinum: { bg: 'bg-purple-100 text-purple-800', emoji: '💎' },
  Gold:     { bg: 'bg-yellow-100 text-yellow-800', emoji: '🥇' },
  Silver:   { bg: 'bg-gray-100   text-gray-700',   emoji: '🥈' },
  Bronze:   { bg: 'bg-orange-100 text-orange-800', emoji: '🥉' },
};

export default function CertificateVerify() {
  const { certId: paramId } = useParams();           // from /verify/:certId
  const [certId,    setCertId]  = useState(paramId || '');
  const [state,     setState]   = useState('idle');  // idle | loading | verified | revoked | notfound
  const [cert,      setCert]    = useState(null);
  const [error,     setError]   = useState('');

  /* Auto-verify if ID came from URL param (QR scan) */
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

  const s = STATUS[state] || STATUS.idle;
  const levelBadge = cert?.level ? LEVEL_BADGE[cert.level] || LEVEL_BADGE.Gold : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1F3D] via-[#1B365D] to-[#0D2444] flex flex-col">

      {/* ─── Header ─── */}
      <header className="py-6 px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          {/* Academy seal */}
          <div className="w-11 h-11 rounded-full bg-[#C5A059] flex items-center justify-center text-[#1B365D] font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
            JA
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-none tracking-wide">JAGAT ACADEMY</p>
            <p className="text-[#C5A059] text-xs font-medium tracking-widest uppercase">Certificate Verifier</p>
          </div>
        </Link>
        <a href="/" className="text-white/60 hover:text-white text-sm transition-colors">← Back to Home</a>
      </header>

      {/* ─── Hero text ─── */}
      <div className="text-center py-10 px-4">
        <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-xl mb-3">
          Verify a Certificate
        </h1>
        <p className="text-white/60 text-sm max-w-md mx-auto">
          Enter the unique Certificate ID printed on the document, or scan the QR code to validate its authenticity instantly.
        </p>
      </div>

      {/* ─── Search card ─── */}
      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-xl space-y-6">

          {/* Input box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
            <label className="block text-white/80 text-sm font-semibold mb-2 uppercase tracking-wider">
              Certificate ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={certId}
                onChange={e => setCertId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verify()}
                placeholder="e.g. JAGT-A1B2C3D4"
                className="flex-1 bg-white/15 border border-white/25 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C5A059] transition"
              />
              <button
                onClick={() => verify()}
                disabled={state === 'loading'}
                className="bg-[#C5A059] hover:bg-[#b38d47] disabled:opacity-60 text-[#1B365D] font-extrabold px-6 py-3 rounded-xl transition-colors text-sm shadow-lg"
              >
                {state === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-[#1B365D] border-t-transparent rounded-full animate-spin" />
                ) : 'Verify'}
              </button>
            </div>
            {error && <p className="mt-2 text-red-300 text-xs">{error}</p>}
          </div>

          {/* ─── Result card ─── */}
          {state !== 'idle' && state !== 'loading' && (
            <div className={`rounded-2xl border-2 p-6 shadow-2xl transition-all ${s.bg} ${s.border}`}>

              {/* Verified ✅ */}
              {state === 'verified' && cert && (
                <div className="space-y-5">
                  {/* Badge banner */}
                  <div className="flex items-center gap-3 bg-green-100 border border-green-300 rounded-xl px-4 py-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-extrabold text-green-800 text-base">Certificate Verified</p>
                      <p className="text-green-600 text-xs">Issued by Jagat Academy · Authentic &amp; Tamper-free</p>
                    </div>
                  </div>

                  {/* Certificate details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow label="Student Name"   value={cert.studentId?.name   || '—'} />
                    <InfoRow label="Course"         value={cert.courseId?.title   || '—'} />
                    <InfoRow label="Certificate ID" value={cert.certificateId}             mono />
                    <InfoRow label="Issue Date"     value={new Date(cert.issueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })} />
                    <InfoRow label="Issued By"      value="Jagadeeshwar C V, Founder" />
                    <InfoRow label="Institution"    value="Jagat Academy" />
                  </div>

                  {/* Level badge */}
                  {levelBadge && (
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${levelBadge.bg}`}>
                        {levelBadge.emoji} {cert.level} Certificate
                      </span>
                    </div>
                  )}

                  {/* Download PDF if present */}
                  {cert.ipfsHash && (
                    <a
                      href={`${serverUrl}${cert.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#1B365D] hover:bg-[#142848] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      View / Download PDF
                    </a>
                  )}
                </div>
              )}

              {/* Revoked ⚠️ */}
              {state === 'revoked' && (
                <div className="flex items-start gap-3 bg-red-100 border border-red-300 rounded-xl px-4 py-4">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <p className="font-extrabold text-red-800 text-base">Certificate Revoked</p>
                    <p className="text-red-600 text-sm mt-1">
                      This certificate has been revoked by Jagat Academy and is no longer valid. Please contact the institution for more information.
                    </p>
                  </div>
                </div>
              )}

              {/* Not found ❌ */}
              {state === 'notfound' && (
                <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-4">
                  <span className="text-3xl">❌</span>
                  <div>
                    <p className="font-extrabold text-yellow-800 text-base">Certificate Not Found</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      No certificate matching that ID was found in our records. Please double-check the ID and try again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Trust strip ─── */}
          <div className="flex items-center justify-center gap-6 text-white/40 text-xs pt-2">
            <span>🔒 Secure &amp; Tamper-proof</span>
            <span>·</span>
            <span>🏛️ Jagat Academy Official Portal</span>
            <span>·</span>
            <span>📜 SHA-256 Signed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Small helper ─── */
function InfoRow({ label, value, mono }) {
  return (
    <div className="bg-white/60 rounded-xl px-4 py-3 border border-gray-200">
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-gray-800 font-bold text-sm break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
