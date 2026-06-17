import { create } from 'zustand'

const mockStats = {
  user_score: 42.5,
  community_average: 58.3,
  breakdown: {
    transport: 18.2,
    electricity: 14.0,
    food: 10.3,
  },
}

const mockClimate = {
  temp: 24,
  conditions: 'Partly cloudy',
  location: 'Nairobi',
}

const useEcoStore = create((set) => ({
  
  activities: [],
  stats: mockStats,
  climate: mockClimate,
  loading: false,
  error: null,

  
  logActivity: (activity) => {
    set((state) => ({
      activities: [...state.activities, activity],
    }))
  },

  setStats: (stats) => set({ stats }),
  setClimate: (climate) => set({ climate }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

export default useEcoStore