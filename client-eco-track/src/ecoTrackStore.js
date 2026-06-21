import { create } from "zustand";

/* ===========================================================
   EcoTrack — shared data layer
   Owner: Lenny

   Contract: any component that needs auth state, stats,
   log history, or climate data reads it from this store —
   not from its own local useState. Components stay dumb:
   they receive plain data/props and render it. Whoever ends
   up owning final visual styling (charts, cards, colors) can
   swap the rendering layer freely without touching anything
   in this file.

   Requires: `npm install zustand` in the project.
=========================================================== */

const API_BASE =
  (typeof window !== "undefined" && window.__ECOTRACK_API_URL) ||
  "https://ecotrack-node.onrender.com/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function apiRequest(path, { method = "GET", body, token, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError(
      "Could not reach the EcoTrack server. It may not be deployed yet, or CORS isn't configured for this origin.",
      0
    );
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("Server returned an unexpected response.", res.status);
  }

  if (!res.ok || json.success === false) {
    throw new ApiError(json.error || `Request failed (${res.status})`, res.status);
  }
  return json.data;
}

/* Exported so panels that haven't been folded into store actions yet
   (recommendations, chatbot) can still call the API directly with the
   token/userId they read from this store. */
export const api = {
  health: () => apiRequest("/health", { auth: false }),
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload, auth: false }),
  me: (token) => apiRequest("/auth/me", { token }),
  log: (payload, token) => apiRequest("/log", { method: "POST", body: payload, token }),
  stats: (token) => apiRequest("/stats", { token }),
  climate: (lat, lon) => apiRequest(`/climate?lat=${lat}&lon=${lon}`, { auth: false }),
  recommendations: (userId, token) => apiRequest(`/recommendations/${userId}`, { token }),
  chatbotMessage: (message, userId) =>
    apiRequest("/chatbot/message", { method: "POST", body: { message, userId }, auth: false }),
  chatbotHistory: (userId) => apiRequest(`/chatbot/history/${userId}`, { auth: false }),
};

/* ---------------- local scoring fallback ----------------
   Mirrors server .env factors. Used only to render an optimistic
   breakdown instantly while the real request is in flight; the
   server response always overwrites it once it lands. */
const FACTORS = {
  transport: { car: 0.6, bus: 0.25, bike: 0, walk: 0, motorbike: 0.35 },
  electricity: 0.7,
  food: { meat: 0.5, mixed: 0.3, vegetarian: 0.18, vegan: 0.12 },
};

export function computeScore({ transportType, distanceKm, electricityKwh, foodType }) {
  const transport = transportType ? FACTORS.transport[transportType] * (distanceKm || 0) : 0;
  const electricity = electricityKwh ? FACTORS.electricity * electricityKwh : 0;
  const food = foodType ? FACTORS.food[foodType] * 10 : 0;
  const score = +(transport + electricity + food).toFixed(1);
  return {
    score,
    breakdown: {
      transport: +transport.toFixed(1),
      electricity: +electricity.toFixed(1),
      food: +food.toFixed(1),
    },
  };
}

let feedIdCounter = 1;

export const useEcoTrackStore = create((set, get) => ({
  // ---------------- session ----------------
  user: null,
  token: null,

  login: async ({ email, password }) => {
    const data = await api.login({ email, password });
    set({ user: data.user, token: data.token });
    return data;
  },

  register: async ({ name, email, password, location }) => {
    const data = await api.register({ name, email, password, location });
    set({ user: data.user, token: data.token });
    return data;
  },

  logout: () =>
    set({
      user: null,
      token: null,
      stats: null,
      lastLog: null,
      feed: [],
      climate: null,
      climateError: null,
    }),

  // ---------------- standing / stats (feeds the gauge + breakdown) ----------------
  stats: null, // { userScore, communityAverage, breakdown: { transport, electricity, food } }
  statsLoading: false,
  statsError: null,

  loadStats: async () => {
    const { token } = get();
    if (!token) return;
    set({ statsLoading: true, statsError: null });
    try {
      const data = await api.stats(token);
      set({ stats: data, statsLoading: false });
    } catch (err) {
      set({ statsError: err.message, statsLoading: false });
    }
  },

  // ---------------- log activity + feed ----------------
  lastLog: null, // { score, breakdown: { transport, electricity, food } }
  feed: [], // [{ id, score, createdAt }]
  animateKey: 0, // bump this to re-trigger breakdown entrance animation
  submitting: false,
  logError: null,

  submitLog: async (payload) => {
    const { token, loadStats } = get();
    set({ submitting: true, logError: null });
    try {
      const data = await api.log(payload, token);
      feedIdCounter += 1;
      const entry = {
        id: data.id || `local_${feedIdCounter}`,
        score: data.score,
        createdAt: "just now",
      };
      set((s) => ({
        lastLog: { score: data.score, breakdown: data.breakdown },
        feed: [entry, ...s.feed].slice(0, 6),
        animateKey: s.animateKey + 1,
        submitting: false,
      }));
      loadStats();
      return { ok: true, data };
    } catch (err) {
      const optimistic = computeScore(payload);
      set((s) => ({
        logError: err.message,
        lastLog: optimistic,
        animateKey: s.animateKey + 1,
        submitting: false,
      }));
      return { ok: false, error: err.message };
    }
  },

  // ---------------- climate strip ----------------
  climate: null,
  climateError: null,

  loadClimate: async (lat = -1.286389, lon = 36.817223) => {
    try {
      const data = await api.climate(lat, lon);
      set({ climate: data, climateError: null });
    } catch (err) {
      set({ climateError: err.message });
    }
  },
}));