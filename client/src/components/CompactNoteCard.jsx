import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Download, FileText, Loader2 } from 'lucide-react';
import { API_URL, getNoteFileUrl } from '../config';
import { useAuth } from '../context/AuthContext';

const typeColors = {
  Notes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Past Papers': 'bg-amber-50 text-amber-700 border-amber-200'
};

const CompactNoteCard = ({ note, onDownloadComplete }) => {
  const { _id, title, type, uploadedBy, downloads } = note;
  const { isAuthenticated, authFetch, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate(`/login?redirect=notes/${_id}`);
      return;
    }

    try {
      setDownloading(true);
      setDownloadError(null);

      const res = await authFetch(`${API_URL}/api/notes/${_id}/download`, {
        method: 'POST'
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.limitExceeded) {
          setDownloadError(data.message);
          return;
        }
        throw new Error(data.message || 'Download failed.');
      }

      onDownloadComplete?.(_id, data.downloads);
      refreshProfile();

      window.open(getNoteFileUrl(_id), '_blank');
    } catch (err) {
      setDownloadError(err.message || 'Could not download.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 flex flex-col gap-3">
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="p-2 bg-slate-50 rounded-lg flex-shrink-0">
          <FileText className="h-4 w-4 text-ucp-blue" />
        </div>
        <div className="min-w-0 flex-1">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mb-1.5 ${typeColors[type] || 'bg-slate-100 text-slate-600'}`}>
            {type}
          </span>
          <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug" title={title}>
            {title}
          </h4>
          <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
            by {uploadedBy} · {downloads} downloads
          </p>
        </div>
      </div>

      {downloadError && (
        <p className="text-[10px] font-semibold text-red-600 leading-tight">{downloadError}</p>
      )}

      <div className="flex gap-2 mt-auto">
        <Link
          to={`/notes/${_id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-ucp-blue text-white rounded-lg text-xs font-bold hover:bg-ucp-dark transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Link>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors disabled:opacity-60"
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Download
        </button>
      </div>
    </div>
  );
};

export default CompactNoteCard;
