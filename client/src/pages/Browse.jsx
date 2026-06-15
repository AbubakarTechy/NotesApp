import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL, SEMESTERS_MAP, OTHERS_FOLDER, getSemesterSubjects } from '../config';
import BookFolderCard from '../components/BookFolderCard';
import CompactNoteCard from '../components/CompactNoteCard';
import { Search, SlidersHorizontal, BookOpen, Clock, Flame, RotateCcw, Folder, ArrowLeft, ChevronRight } from 'lucide-react';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedSemester, setSelectedSemester] = useState(searchParams.get('semester') || 'All');
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') === 'downloads' ? 'downloads' : 'latest');

  const isSearchMode = Boolean(searchParams.get('q')?.trim());
  const isBookView = !isSearchMode && selectedSubject !== 'All';

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = `${API_URL}/api/notes`;
        const qParam = searchParams.get('q');
        const semParam = searchParams.get('semester');

        if (qParam) {
          url = `${API_URL}/api/notes/search?q=${encodeURIComponent(qParam)}`;
        } else if (semParam && semParam !== 'All') {
          url = `${API_URL}/api/notes/semester/${encodeURIComponent(semParam)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch notes from the database.');
        }

        const data = await response.json();
        setNotes(data);
      } catch (err) {
        console.error('Error fetching browse notes:', err);
        setError('Error loading notes. Please make sure the backend is active.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [searchParams]);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedSemester(searchParams.get('semester') || 'All');
    setSelectedSubject(searchParams.get('subject') || 'All');
    setSortBy(searchParams.get('sort') === 'downloads' ? 'downloads' : 'latest');
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newParams.set('q', searchQuery.trim());
      newParams.delete('semester');
      newParams.delete('subject');
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleSemesterChange = (sem) => {
    setSelectedSemester(sem);
    setSelectedSubject('All');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    newParams.delete('subject');
    if (sem === 'All') {
      newParams.delete('semester');
    } else {
      newParams.set('semester', sem);
    }
    setSearchParams(newParams);
  };

  const handleSubjectChange = (sub) => {
    setSelectedSubject(sub);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    if (sub === 'All') {
      newParams.delete('subject');
    } else {
      newParams.set('subject', sub);
    }
    setSearchParams(newParams);
  };

  const openBookFolder = (sem, subject) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    newParams.set('semester', sem);
    newParams.set('subject', subject);
    setSearchParams(newParams);
  };

  const handleBackToFolders = () => {
    handleSubjectChange('All');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSemester('All');
    setSelectedSubject('All');
    setSelectedType('All');
    setSortBy('latest');
    setSearchParams({});
  };

  const getBaseFilteredNotes = useCallback(() => {
    let result = [...notes];

    if (selectedType !== 'All') {
      result = result.filter((note) => note.type === selectedType);
    }

    if (selectedSemester !== 'All') {
      result = result.filter((note) => note.semester === selectedSemester);
    }

    if (sortBy === 'downloads') {
      result.sort((a, b) => b.downloads - a.downloads);
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [notes, selectedType, selectedSemester, sortBy]);

  const baseNotes = getBaseFilteredNotes();

  const bookNotes = isBookView
    ? baseNotes.filter((note) => note.subject === selectedSubject)
    : [];

  const getSemestersToShow = () => {
    if (selectedSemester !== 'All') return [selectedSemester];
    return Object.keys(SEMESTERS_MAP);
  };

  const getBookFolders = () => {
    const folders = [];

    for (const sem of getSemestersToShow()) {
      const books = getSemesterSubjects(sem);
      for (const subject of books) {
        const matchingNotes = baseNotes.filter(
          (note) => note.semester === sem && note.subject === subject
        );
        folders.push({
          semester: sem,
          subject,
          noteCount: matchingNotes.length,
          notes: matchingNotes
        });
      }
    }

    return folders;
  };

  const bookFolders = getBookFolders();
  const foldersWithNotes = bookFolders.filter((f) => f.noteCount > 0).length;

  const handleDownloadComplete = (noteId, newDownloads) => {
    setNotes((prev) =>
      prev.map((n) => (n._id === noteId ? { ...n, downloads: newDownloads } : n))
    );
  };

  const renderFolderView = () => {
    const semesters = getSemestersToShow();

    if (selectedSemester === 'All') {
      return (
        <div className="space-y-10">
          {semesters.map((sem) => {
            const semFolders = bookFolders.filter((f) => f.semester === sem);
            return (
              <section key={sem}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-ucp-blue text-white">
                    {sem} Semester
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {semFolders.filter((f) => f.noteCount > 0).length} books with notes
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {semFolders.map((folder) => (
                    <BookFolderCard
                      key={`${folder.semester}-${folder.subject}`}
                      semester={folder.semester}
                      subject={folder.subject}
                      noteCount={folder.noteCount}
                      onClick={() => openBookFolder(folder.semester, folder.subject)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {bookFolders.map((folder) => (
          <BookFolderCard
            key={`${folder.semester}-${folder.subject}`}
            semester={folder.semester}
            subject={folder.subject}
            noteCount={folder.noteCount}
            onClick={() => openBookFolder(folder.semester, folder.subject)}
          />
        ))}
      </div>
    );
  };

  const renderBookView = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div>
          <button
            type="button"
            onClick={handleBackToFolders}
            className="flex items-center gap-1.5 text-xs font-bold text-ucp-blue hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to book folders
          </button>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 flex-wrap">
            <span>{selectedSemester} Semester</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-700 font-bold">{selectedSubject}</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 mt-1">{selectedSubject}</h2>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Folder className="h-4 w-4 text-amber-500" />
          <span>{bookNotes.length} note{bookNotes.length !== 1 ? 's' : ''} in this book</span>
        </div>
      </div>

      {bookNotes.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <Folder className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No notes in this book yet</h3>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Be the first to upload notes for {selectedSubject}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bookNotes.map((note) => (
            <CompactNoteCard
              key={note._id}
              note={note}
              onDownloadComplete={handleDownloadComplete}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderSearchView = () => (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-500">
        Search results for &ldquo;{searchParams.get('q')}&rdquo;
      </p>
      {baseNotes.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching notes found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {baseNotes.map((note) => (
            <CompactNoteCard
              key={note._id}
              note={note}
              onDownloadComplete={handleDownloadComplete}
            />
          ))}
        </div>
      )}
    </div>
  );

  const getStatusLabel = () => {
    if (isSearchMode) return `${baseNotes.length} results`;
    if (isBookView) return `${bookNotes.length} notes`;
    return `${foldersWithNotes} books with notes`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800">Browse Study Materials</h1>
          <p className="text-slate-500 font-medium mt-1">
            {isBookView
              ? 'View and download notes for this subject.'
              : 'Pick a semester, open a book folder, then browse its notes.'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="w-full md:max-w-md">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search subjects or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-ucp-blue focus:ring-1 focus:ring-ucp-blue text-sm"
              />
              <div className="absolute left-3.5 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              {searchQuery && (
                <button
                  type="submit"
                  className="absolute right-2.5 px-3 py-1 bg-ucp-blue text-white rounded-lg text-xs font-bold"
                >
                  Go
                </button>
              )}
            </div>
          </form>

          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 self-end md:self-auto">
            <span>{getStatusLabel()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">

              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2 font-bold text-slate-800">
                  <SlidersHorizontal className="h-4 w-4 text-ucp-blue" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-slate-400 hover:text-ucp-blue flex items-center gap-1"
                  title="Reset all filters"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Semester</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {['All', ...Object.keys(SEMESTERS_MAP)].map((sem) => (
                    <button
                      key={sem}
                      onClick={() => handleSemesterChange(sem)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        selectedSemester === sem
                          ? 'bg-ucp-blue text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sem === 'All' ? 'All Semesters' : `${sem} Semester`}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSemester !== 'All' && SEMESTERS_MAP[selectedSemester] && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Book Folders</h4>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    <button
                      onClick={() => handleSubjectChange('All')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                        selectedSubject === 'All'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Folder className="h-4.5 w-4.5 flex-shrink-0" />
                      <span>All Books</span>
                    </button>
                    {getSemesterSubjects(selectedSemester).map((sub) => (
                      <button
                        key={sub}
                        onClick={() => handleSubjectChange(sub)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-start gap-2 ${
                          selectedSubject === sub
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Folder className={`h-4.5 w-4.5 flex-shrink-0 mt-0.5 ${selectedSubject === sub ? 'text-white' : 'text-amber-500'}`} />
                        <span className="leading-snug" title={sub}>{sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Material Type</h4>
                <div className="space-y-2">
                  {['All', 'Notes', 'Past Papers'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        selectedType === type
                          ? 'bg-ucp-blue text-white'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type === 'All' ? 'All Types' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Sort By</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSortBy('latest')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      sortBy === 'latest'
                        ? 'bg-ucp-blue/10 text-ucp-blue'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Latest Uploads</span>
                  </button>
                  <button
                    onClick={() => setSortBy('downloads')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      sortBy === 'downloads'
                        ? 'bg-ucp-blue/10 text-ucp-blue'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Flame className="h-4 w-4" />
                    <span>Most Downloaded</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-center mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-[140px] bg-slate-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : isSearchMode ? (
              renderSearchView()
            ) : isBookView ? (
              renderBookView()
            ) : (
              renderFolderView()
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Browse;
