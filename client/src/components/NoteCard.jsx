import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FolderOpen, ArrowRight, Download, User } from 'lucide-react';

const NoteCard = ({ note }) => {
  const { _id, title, subject, semester, type, uploadedBy, downloads } = note;

  // Semester badge colors
  const semColors = {
    '4th': 'bg-sky-50 text-sky-700 border-sky-200',
    '5th': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    '6th': 'bg-violet-50 text-violet-700 border-violet-200',
  };

  // Document type badge colors
  const typeColors = {
    'Notes': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Past Papers': 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="card-hover bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between h-[280px] shadow-sm relative overflow-hidden group">
      
      {/* Decorative top ribbon depending on type */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${type === 'Notes' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

      {/* Main content */}
      <div>
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${semColors[semester] || 'bg-slate-100 text-slate-700'}`}>
            {semester} Sem
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${typeColors[type] || 'bg-slate-100 text-slate-700'}`}>
            {type}
          </span>
        </div>

        {/* Title & Subject */}
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-ucp-blue transition-colors duration-200" title={title}>
          {title}
        </h3>
        <p className="text-sm font-semibold text-slate-500 mb-4 flex items-center space-x-1.5">
          <FolderOpen className="h-3.5 w-3.5 text-slate-400" />
          <span>{subject}</span>
        </p>
      </div>

      {/* Footer Details */}
      <div className="border-t border-slate-100 pt-4 mt-auto">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          {/* Uploader Name */}
          <div className="flex items-center space-x-1 max-w-[150px] truncate" title={`Uploaded by ${uploadedBy}`}>
            <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate font-medium">{uploadedBy}</span>
          </div>

          {/* Downloads count */}
          <div className="flex items-center space-x-1 text-slate-600 font-bold" title={`${downloads} downloads`}>
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>{downloads}</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/notes/${_id}`}
          className="flex items-center justify-center space-x-1.5 w-full py-2.5 bg-slate-50 group-hover:bg-ucp-blue text-slate-700 group-hover:text-white rounded-xl text-xs font-bold transition-all duration-200"
        >
          <span>View Document</span>
          <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default NoteCard;
