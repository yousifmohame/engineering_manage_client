const API_URL = `${import.meta.env.VITE_API_URL}/partnership`;

export const partnershipService = {
  async getExpenses() { return (await fetch(API_URL)).json(); },
  async addExpense(data) {
    return (await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })).json();
  },
  async updateExpense(id, data) {
    return (await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })).json();
  },
  async deleteExpense(id) {
    return (await fetch(`${API_URL}/${id}`, { method: 'DELETE' })).json();
  }
};