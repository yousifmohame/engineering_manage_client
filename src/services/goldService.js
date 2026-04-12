const API_URL = `${import.meta.env.VITE_API_URL}/gold`;

export const goldService = {
  async getGold() { const res = await fetch(API_URL); return res.json(); },
  async addGold(data) { 
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },
  async updateGold(id, data) {
    const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    return res.json();
  },
  async deleteGold(id) { await fetch(`${API_URL}/${id}`, { method: 'DELETE' }); }
};