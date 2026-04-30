import React, { useState, useEffect, useRef } from "react";
import {
  FolderOpen,
  Plus,
  Upload,
  Folder,
  FileText,
  Image as ImageIcon,
  Edit2,
  Trash2,
  History,
  ChevronLeft,
  Home,
  MoreVertical,
  X,
  Download,
} from "lucide-react";
import { fileService } from "../../services/fileService";

const BASE_SERVER_URL = `${import.meta.env.VITE_API_URL}`;

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState([{ id: null, name: "المجلد الرئيسي" }]);
  const [previewFile, setPreviewFile] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    file: null,
  });
  const fileInputRef = useRef(null);

  // 🌟 1. حالة لتتبع الملف المحدد (لعرض اسمه بالكامل)
  const [selectedFileId, setSelectedFileId] = useState(null);

  // 🌟 2. حالة للتحكم بنافذة إنشاء مجلد (Modal)
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const fetchFiles = async (folderId) => {
    setLoading(true);
    setSelectedFileId(null); // إلغاء التحديد عند التنقل
    try {
      const data = await fileService.getFiles(folderId);
      setFiles(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles(currentFolderId);

    const handleClickOutside = () => {
      setContextMenu({ ...contextMenu, visible: false });
      // إلغاء التحديد عند النقر في مساحة فارغة
      setSelectedFileId(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [currentFolderId]);

  // 🌟 التعامل مع النقر المزدوج والنقر المفرد
  const handleSingleClick = (e, fileId) => {
    e.stopPropagation(); // لمنع تفعيل handleClickOutside
    setSelectedFileId(fileId);
    setContextMenu({ ...contextMenu, visible: false }); // إخفاء القائمة إن كانت ظاهرة
  };

  const handleDoubleClick = (e, file) => {
    e.stopPropagation();
    if (file.isFolder) {
      setPath([...path, { id: file.id, name: file.name }]);
      setCurrentFolderId(file.id);
    } else {
      setPreviewFile(file);
    }
  };

  // 🌟 دوال نافذة إنشاء المجلد
  const handleOpenFolderModal = (e) => {
    e.stopPropagation();
    setNewFolderName("");
    setShowFolderModal(true);
  };

  const submitCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await fileService.createFolder(newFolderName.trim(), currentFolderId);
      setShowFolderModal(false);
      fetchFiles(currentFolderId);
    } catch (error) {
      alert("فشل إنشاء المجلد");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      await fileService.uploadFile(file, currentFolderId);
      fetchFiles(currentFolderId);
    } catch (error) {
      alert("فشل رفع الملف");
    } finally {
      e.target.value = "";
    }
  };

  const navigateToPath = (index, folderId) => {
    setPath(path.slice(0, index + 1));
    setCurrentFolderId(folderId);
  };

  const openContextMenu = (e, file) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFileId(file.id); // تحديد الملف عند النقر الأيمن

    const x = Math.min(e.pageX, window.innerWidth - 200);
    const y = Math.min(e.pageY, window.innerHeight - 250);

    setContextMenu({ visible: true, x, y, file: file });
  };

  const handleRename = async () => {
    const file = contextMenu.file;
    const newName = prompt("أدخل الاسم الجديد:", file.name);
    if (!newName || newName === file.name) return;
    try {
      await fileService.renameNode(file.id, newName);
      fetchFiles(currentFolderId);
    } catch (error) {
      alert("فشل إعادة التسمية");
    }
  };

  const handleDelete = async () => {
    const file = contextMenu.file;
    if (!window.confirm(`هل أنت متأكد من حذف "${file.name}"؟`)) return;
    try {
      await fileService.deleteNode(file.id);
      fetchFiles(currentFolderId);
    } catch (error) {
      alert("فشل الحذف");
    }
  };

  const getFullUrl = (url) => {
    if (!url) return "";
    const fullPath = url.startsWith("http") ? url : `${BASE_SERVER_URL}${url}`;
    return encodeURI(fullPath);
  };

  const renderFileThumbnail = (file) => {
    if (file.isFolder) {
      return (
        <Folder
          className="text-amber-500 mb-2 drop-shadow-sm"
          size={48}
          fill="currentColor"
          fillOpacity={0.2}
        />
      );
    }

    const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    if (isImage && file.url) {
      return (
        <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center">
          <img
            src={getFullUrl(file.url)}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // إذا فشل تحميل الصورة، نعرض الأيقونة بدلاً منها
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
          <ImageIcon className="text-slate-400 hidden" size={32} />
        </div>
      );
    }

    if (file.name.toLowerCase().includes(".pdf")) {
      return (
        <FileText className="text-red-500 mb-2 drop-shadow-sm" size={48} />
      );
    }

    return (
      <FileText className="text-slate-500 mb-2 drop-shadow-sm" size={48} />
    );
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-3 md:p-8 pb-24 font-cairo bg-slate-50 min-h-screen"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-700">
            <FolderOpen size={24} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            نظام الملفات
          </h1>
        </div>

        <div className="space-y-4">
          <div className="flex items-center flex-wrap gap-1 bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-sm font-bold text-slate-600">
            {path.map((step, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToPath(index, step.id);
                  }}
                  className={`hover:bg-slate-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${index === path.length - 1 ? "text-blue-600 cursor-default" : "text-slate-500 cursor-pointer"}`}
                >
                  {index === 0 && <Home size={14} />}
                  {step.name}
                </button>
                {index < path.length - 1 && (
                  <ChevronLeft size={14} className="text-slate-300" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex justify-between items-center bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-base md:text-lg font-black text-slate-800 hidden sm:block">
              محتويات المجلد
            </h2>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleOpenFolderModal}
                className="flex-1 sm:flex-none inline-flex items-center justify-center text-xs md:text-sm text-slate-700 h-9 px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg font-bold transition-colors shadow-sm"
              >
                <Plus size={16} className="ml-1 md:ml-2" /> مجلد جديد
              </button>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current.click();
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center text-xs md:text-sm text-white h-9 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors shadow-sm"
              >
                <Upload size={16} className="ml-1 md:ml-2" /> رفع ملف
              </button>
            </div>
          </div>

          <div
            className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 min-h-[50vh] md:min-h-[400px]"
            onClick={() => setSelectedFileId(null)} // إلغاء التحديد عند النقر في الحاوية
          >
            {loading ? (
              <div className="flex justify-center items-center h-full text-slate-400 mt-20 font-bold">
                جاري التحميل...
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-20">
                <FolderOpen size={48} className="mb-4 opacity-50" />
                <p className="font-bold text-sm md:text-base">المجلد فارغ</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 items-start">
                {files.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  return (
                    <div
                      key={file.id}
                      onClick={(e) => handleSingleClick(e, file.id)}
                      onDoubleClick={(e) => handleDoubleClick(e, file)}
                      onContextMenu={(e) => openContextMenu(e, file)}
                      className={`relative flex flex-col items-center p-3 md:p-4 rounded-xl cursor-pointer transition-all select-none group shadow-sm 
                        ${
                          isSelected
                            ? "bg-blue-50 border border-blue-300 ring-2 ring-blue-100 shadow-md z-10"
                            : "bg-white border border-slate-100 hover:border-blue-200 hover:bg-slate-50 hover:shadow-md"
                        }`}
                      // استخدمنا items-start للشبكة، و min-h بدلاً من h ثابت ليسمح للملف المحدد بالتمدد
                      style={{ minHeight: "8rem" }}
                    >
                      <button
                        onClick={(e) => openContextMenu(e, file)}
                        className={`absolute top-1 right-1 p-1.5 rounded-md transition-all text-slate-500
                          ${isSelected ? "opacity-100 bg-white shadow-sm" : "md:opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-slate-200"}
                        `}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {renderFileThumbnail(file)}

                      {/* 🌟 التحكم في عرض الاسم */}
                      <span
                        className={`mt-1 md:mt-2 text-[11px] md:text-xs font-bold text-center w-full px-1 break-words
                          ${isSelected ? "text-blue-800 line-clamp-none" : "text-slate-700 line-clamp-2 group-hover:text-blue-700"}
                        `}
                        title={file.name}
                      >
                        {file.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🌟 نافذة إنشاء المجلد (Modal) الأنيقة */}
      {showFolderModal && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowFolderModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // منع الإغلاق عند النقر داخل النافذة
          >
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <FolderPlusIcon size={20} />
              </div>
              <h3 className="font-black text-slate-800 text-lg">مجلد جديد</h3>
            </div>

            <form onSubmit={submitCreateFolder} className="p-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                اسم المجلد
              </label>
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="مثال: صور المشروع"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-slate-50 focus:bg-white"
              />

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                >
                  إنشاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {contextMenu.visible && (
        <div
          className="fixed bg-white border border-slate-200 shadow-xl rounded-xl w-48 overflow-hidden z-[60] animate-in fade-in zoom-in duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <p
              className="text-[10px] font-bold text-slate-500 truncate"
              dir="ltr"
            >
              {contextMenu.file?.name}
            </p>
          </div>
          <ul className="py-1 text-xs md:text-sm font-bold text-slate-700">
            <li
              onClick={(e) => {
                handleDoubleClick(e, contextMenu.file);
                setContextMenu({ visible: false });
              }}
              className="px-4 py-2 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center gap-2"
            >
              <FolderOpen size={16} />{" "}
              {contextMenu.file?.isFolder ? "فتح المجلد" : "معاينة الملف"}
            </li>
            {!contextMenu.file?.isFolder && (
              <li
                onClick={() => {
                  window.open(getFullUrl(contextMenu.file?.url));
                  setContextMenu({ visible: false });
                }}
                className="px-4 py-2 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center gap-2"
              >
                <Download size={16} /> تنزيل
              </li>
            )}
            <li
              onClick={() => {
                handleRename();
                setContextMenu({ visible: false });
              }}
              className="px-4 py-2 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center gap-2"
            >
              <Edit2 size={16} /> إعادة تسمية
            </li>
            {!contextMenu.file?.isFolder && (
              <li
                onClick={() => {
                  alert("سجل الإصدارات قيد التطوير");
                  setContextMenu({ visible: false });
                }}
                className="px-4 py-2 hover:bg-amber-50 hover:text-amber-700 cursor-pointer flex items-center gap-2 border-t border-slate-100 mt-1 pt-1"
              >
                <History size={16} /> سجل الإصدارات
              </li>
            )}
            <li
              onClick={() => {
                handleDelete();
                setContextMenu({ visible: false });
              }}
              className="px-4 py-2 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-2 border-t border-slate-100 text-red-600 mt-1 pt-1"
            >
              <Trash2 size={16} /> حذف
            </li>
          </ul>
        </div>
      )}

      {previewFile && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col animate-in fade-in"
          onClick={() => setPreviewFile(null)} // إغلاق عند النقر في الخلفية
        >
          <div
            className="flex justify-between items-center p-4 bg-black/50 text-white"
            onClick={(e) => e.stopPropagation()} // منع الإغلاق عند النقر على الشريط
          >
            <div className="font-bold truncate max-w-[70%]" dir="ltr">
              {previewFile.name}
            </div>
            <div className="flex gap-4">
              <a
                href={getFullUrl(previewFile.url)}
                download
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 transition-colors"
              >
                <Download size={24} />
              </a>
              <button
                onClick={() => setPreviewFile(null)}
                className="hover:text-red-400 transition-colors bg-black/20 p-1 rounded-md"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div
            className="flex-1 flex justify-center items-center p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()} // منع الإغلاق عند التفاعل مع المحتوى
          >
            {previewFile.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img
                src={getFullUrl(previewFile.url)}
                alt="preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : previewFile.name.toLowerCase().includes(".pdf") ? (
              <iframe
                src={getFullUrl(previewFile.url)}
                className="w-full h-full bg-white rounded-lg"
                title="PDF Preview"
              />
            ) : (
              <div className="text-white text-center">
                <FileText size={64} className="mx-auto mb-4 opacity-50" />
                <p className="font-bold mb-4">
                  لا يمكن معاينة هذا النوع من الملفات داخل المتصفح
                </p>
                <a
                  href={getFullUrl(previewFile.url)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                >
                  <Download size={18} /> تنزيل الملف
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// أيقونة مساعدة للنافذة المنبثقة
function FolderPlusIcon({ size = 24, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 10v6"></path>
      <path d="M9 13h6"></path>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path>
    </svg>
  );
}
