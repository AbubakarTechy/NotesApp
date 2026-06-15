import React from 'react';
import { Folder, FileText, ChevronRight, Archive } from 'lucide-react';
import { OTHERS_FOLDER } from '../config';

const BookFolderCard = ({ semester, subject, noteCount, onClick }) => {
  const hasNotes = noteCount > 0;
  const isOthers = subject === OTHERS_FOLDER;
  const FolderIcon = isOthers ? Archive : Folder;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4 ${
        isOthers
          ? 'border-violet-100 hover:border-violet-200'
          : 'border-slate-100 hover:border-amber-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-3 rounded-xl flex-shrink-0 ${
            isOthers
              ? hasNotes ? 'bg-violet-50' : 'bg-slate-50'
              : hasNotes ? 'bg-amber-50' : 'bg-slate-50'
          }`}>
            <FolderIcon className={`h-7 w-7 ${
              isOthers
                ? hasNotes ? 'text-violet-500' : 'text-slate-300'
                : hasNotes ? 'text-amber-500' : 'text-slate-300'
            }`} />
          </div>
          <div className="min-w-0">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 mb-1.5">
              {semester} Semester
            </span>
            <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-ucp-blue transition-colors" title={subject}>
              {subject}
            </h3>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-ucp-blue group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
        <FileText className="h-3.5 w-3.5 text-slate-400" />
        <span>{noteCount === 0 ? 'No notes yet' : `${noteCount} note${noteCount !== 1 ? 's' : ''}`}</span>
      </div>
    </button>
  );
};

export default BookFolderCard;
