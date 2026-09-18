import React, { useState, useEffect } from 'react';
import {
  Folder,
  File,
  FileCode,
  FileText,
  Upload,
  Download,
  Plus,
  Trash2,
  Edit,
  Search,
  ChevronRight,
  Maximize2,
  Minimize2,
  Save,
  X,
  RefreshCw,
  Eye
} from 'lucide-react';
import { VMFile } from '../../types';
import { ApiService } from '../../services/api';
import { useToast } from '../common/Toast';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface FileManagerProps {
  vmId: string;
}

export const FileManager: React.FC<FileManagerProps> = ({ vmId }) => {
  const { addToast } = useToast();
  const [files, setFiles] = useState<VMFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Editor Modal
  const [activeFile, setActiveFile] = useState<VMFile | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorFullscreen, setEditorFullscreen] = useState(false);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'directory'>('file');
  const [newFileName, setNewFileName] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<VMFile | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getVMFiles(vmId);
      setFiles(data);
    } catch (err: any) {
      addToast('error', 'Failed to load files', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [vmId]);

  const handleOpenEditor = (file: VMFile) => {
    setActiveFile(file);
    setEditorContent(file.content || `# Content of ${file.name}\n`);
  };

  const handleSaveFile = async () => {
    if (!activeFile) return;
    try {
      await ApiService.updateVMFile(vmId, activeFile.path, editorContent);
      addToast('success', 'File saved', `Successfully updated ${activeFile.name}`);
      fetchFiles();
      setActiveFile(null);
    } catch (err: any) {
      addToast('error', 'Save failed', err.message);
    }
  };

  const handleCreateEntry = async () => {
    if (!newFileName.trim()) return;
    try {
      const path = currentPath === '/' ? `/${newFileName}` : `${currentPath}/${newFileName}`;
      await ApiService.createVMFile(vmId, {
        name: newFileName,
        path,
        type: createType,
        content: createType === 'file' ? '# New file created in Quala VMS\n' : undefined,
      });
      addToast('success', `${createType === 'file' ? 'File' : 'Folder'} created`, newFileName);
      setShowCreateModal(false);
      setNewFileName('');
      fetchFiles();
    } catch (err: any) {
      addToast('error', 'Creation failed', err.message);
    }
  };

  const handleDeleteEntry = async () => {
    if (!deleteTarget) return;
    try {
      await ApiService.deleteVMFile(vmId, deleteTarget.path);
      addToast('success', 'Deleted', `${deleteTarget.name} has been removed`);
      setDeleteTarget(null);
      fetchFiles();
    } catch (err: any) {
      addToast('error', 'Delete failed', err.message);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-panel rounded-2xl border border-purple-500/20 p-5 shadow-xl bg-[#0a0a16]">
      {/* Top Header & Breadcrumbs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-500/15">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="p-1 rounded bg-purple-500/10 text-purple-400 font-semibold">ROOT</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-white font-medium">{currentPath}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/60 border border-purple-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={() => {
              setCreateType('file');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-md shadow-purple-900/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New File</span>
          </button>

          <button
            onClick={() => {
              setCreateType('directory');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            <Folder className="w-3.5 h-3.5 text-purple-400" />
            <span>New Folder</span>
          </button>

          <button
            onClick={fetchFiles}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* File Table (Rule 15 Columns: Name, Type, Size, Modified, Permissions, Actions) */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-purple-500/15 text-slate-400 font-mono">
              <th className="pb-3 pl-2">Name</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Size</th>
              <th className="pb-3">Modified</th>
              <th className="pb-3">Permissions</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredFiles.map((file) => {
              const isDir = file.type === 'directory';
              return (
                <tr key={file.path} className="hover:bg-white/5 transition-colors group">
                  <td className="py-2.5 pl-2 font-medium text-white flex items-center gap-2.5">
                    {isDir ? (
                      <Folder className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : file.name.endsWith('.yml') || file.name.endsWith('.conf') ? (
                      <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span
                      onClick={() => !isDir && handleOpenEditor(file)}
                      className={!isDir ? 'cursor-pointer hover:text-purple-300' : ''}
                    >
                      {file.name}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400 font-mono uppercase text-[11px]">
                    {file.type}
                  </td>
                  <td className="py-2.5 text-slate-400 font-mono">
                    {isDir ? '-' : `${file.size} B`}
                  </td>
                  <td className="py-2.5 text-slate-400 font-mono">{file.modified}</td>
                  <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                    {file.permissions}
                  </td>
                  <td className="py-2.5 text-right pr-2">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                      {!isDir && (
                        <button
                          onClick={() => handleOpenEditor(file)}
                          className="p-1 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-500/10"
                          title="Edit File"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget(file)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fullscreen Code Editor Modal (Rule 15 requirement: Add fullscreen code editor) */}
      {activeFile && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in ${
            editorFullscreen ? 'p-0' : 'p-6'
          }`}
        >
          <div
            className={`w-full glass-panel rounded-2xl border border-purple-500/30 bg-[#0c0c1c] shadow-2xl flex flex-col overflow-hidden ${
              editorFullscreen ? 'h-full rounded-none' : 'max-w-4xl h-[650px]'
            }`}
          >
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-white font-mono">
                  {activeFile.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">({activeFile.path})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-md shadow-purple-900/30 font-sans"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>

                <button
                  onClick={() => setEditorFullscreen(!editorFullscreen)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                  title={editorFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {editorFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setActiveFile(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Code Textarea with line numbers */}
            <div className="flex-1 flex bg-[#080812] overflow-hidden">
              <div className="w-12 py-3 bg-black/40 border-r border-purple-500/10 text-right pr-3 select-none text-slate-600 font-mono text-xs">
                {Array.from({ length: Math.max(20, editorContent.split('\n').length) }).map(
                  (_, i) => (
                    <div key={i}>{i + 1}</div>
                  )
                )}
              </div>
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="flex-1 p-3 bg-transparent text-slate-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create File/Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-panel rounded-2xl border border-purple-500/30 bg-[#0c0c1c] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-white font-sans">
              Create New {createType === 'file' ? 'File' : 'Folder'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Target Path: {currentPath}</p>

            <div className="mt-4">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder={createType === 'file' ? 'config.env' : 'subfolder'}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEntry}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.type === 'directory' ? 'Folder' : 'File'}?`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteEntry}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
