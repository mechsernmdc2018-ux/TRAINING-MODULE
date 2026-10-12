import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Download,
  Search,
} from 'lucide-react';
import { DocumentItem } from '../types';

export const DocumentsRepository: React.FC = () => {
  const { documents } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredDocs = documents.filter((doc) => {
    if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mTitle = doc.title.toLowerCase().includes(q);
      const mNo = doc.documentNumber.toLowerCase().includes(q);
      const mSub = doc.subject.toLowerCase().includes(q);
      if (!mTitle && !mNo && !mSub) return false;
    }
    return true;
  });

  const handleSimulatedDownload = (doc: DocumentItem) => {
    alert(`Downloading official document archive: ${doc.documentNumber} (${doc.fileSize})`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header (Clean Light Theme) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                DGMS CIRCULARS & NMDC SOP REPOSITORY
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Centralized repository of statutory circulars, technical guidelines, standard operating procedures and training syllabus
            </p>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            {documents.length} Authorized Documents Archived
          </span>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-xs">
          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circular no, subject, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-900 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {['ALL', 'DGMS Circular', 'NMDC SOP', 'Statutory Act/Rule'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-xl bg-white border border-slate-200/90 flex flex-col justify-between shadow-xs space-y-3 hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {doc.documentNumber}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  v{doc.version}
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-900 mt-2 leading-snug">
                {doc.title}
              </h3>
              <p className="text-[11px] text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {doc.subject}
              </p>

              <div className="pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-500 space-y-1">
                <div>
                  Applicability:{' '}
                  <strong className="text-slate-800">{doc.applicability}</strong>
                </div>
                <div>
                  Effective Date:{' '}
                  <strong className="text-slate-800">{doc.effectiveDate}</strong>
                </div>
                <div>
                  Format:{' '}
                  <strong className="text-amber-800 font-semibold">{doc.fileSize}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSimulatedDownload(doc)}
              className="w-full py-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>Download Official Copy</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
