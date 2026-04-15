const API_URL = `${import.meta.env.VITE_API_URL}/youssef`;

export const youssefService = {
  async getData() {
    return (await fetch(API_URL)).json();
  },

  async updateSettings(data) {
    return (
      await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json();
  },

  async addSettlement(data) {
    return (
      await fetch(`${API_URL}/settlement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json();
  },

  async deleteSettlement(id) {
    return (
      await fetch(`${API_URL}/settlement/${id}`, { method: "DELETE" })
    ).json();
  },

  async addLoan(data) {
    return (
      await fetch(`${API_URL}/loan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json();
  },

  async deleteLoan(id) {
    return (await fetch(`${API_URL}/loan/${id}`, { method: "DELETE" })).json();
  },

  // الدوال الجديدة الخاصة بمساهمات رأس المال
  async addContribution(data) {
    return (
      await fetch(`${API_URL}/contribution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).json();
  },

  async deleteContribution(id) {
    return (
      await fetch(`${API_URL}/contribution/${id}`, { method: "DELETE" })
    ).json();
  },
};
