// src/services/fileService.js

const API_URL = `${import.meta.env.VITE_API_URL}/files`;


export const fileService = {
  // جلب الملفات والمجلدات
  getFiles: async (folderId = null) => {
    const url = folderId ? `${API_URL}?folderId=${folderId}` : API_URL;
    const response = await fetch(url);
    if (!response.ok) throw new Error('فشل جلب الملفات');
    return response.json();
  },

  // إنشاء مجلد جديد
  createFolder: async (name, parentId = null) => {
    const response = await fetch(`${API_URL}/folder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parentId }),
    });
    if (!response.ok) throw new Error('فشل إنشاء المجلد');
    return response.json();
  },

  // رفع ملف
  uploadFile: async (file, parentId = null, existingFileId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) formData.append('parentId', parentId);
    if (existingFileId) formData.append('existingFileId', existingFileId);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('فشل رفع الملف');
    return response.json();
  },

  // إعادة تسمية
  renameNode: async (id, newName) => {
    const response = await fetch(`${API_URL}/${id}/rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newName }),
    });
    if (!response.ok) throw new Error('فشل إعادة التسمية');
    return response.json();
  },

  // حذف
  deleteNode: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('فشل الحذف');
    return response.json();
  }
};