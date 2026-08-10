/// <reference types="vite/client" />
import { WorkoutLog } from '../types';

const DEFAULT_SUPABASE_URL = 'https://wapbozmmtsmcoocxfzat.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_Om8qRQVpEQ09WCJRolXE9A_h3LdAclc';

// Supabase REST Client using native fetch (zero npm package overhead)
export const SupabaseService = {
  getSupabaseConfig() {
    const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('pulse_supabase_url') || DEFAULT_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('pulse_supabase_key') || DEFAULT_SUPABASE_KEY;
    return { url, key };
  },

  isConfigured(): boolean {
    const { url, key } = this.getSupabaseConfig();
    return Boolean(url && key);
  },

  // Save completed workout session submission to PostgreSQL
  async saveWorkoutLog(log: WorkoutLog): Promise<boolean> {
    const { url, key } = this.getSupabaseConfig();
    if (!url || !key) {
      console.log('Supabase not configured, saving to LocalStorage fallback.');
      return false;
    }

    try {
      const response = await fetch(`${url}/rest/v1/workout_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          id: log.id,
          date: log.date,
          routine_name: log.routineName,
          modality: log.modality,
          duration_minutes: log.durationMinutes,
          total_volume_lbs: log.totalVolumeKg || 0,
          total_sets_completed: log.totalSetsCompleted || 0,
          notes: log.notes,
          exercises: log.exercises || [],
        }),
      });

      if (!response.ok) {
        console.error('Supabase save error:', await response.text());
        return false;
      }

      console.log('✓ Workout log saved directly to Supabase PostgreSQL!');
      return true;
    } catch (err) {
      console.error('Failed to sync to Supabase:', err);
      return false;
    }
  },

  // Fetch full logged workout history for Gemini AI coaching analysis
  async fetchWorkoutHistory(): Promise<WorkoutLog[]> {
    const { url, key } = this.getSupabaseConfig();
    if (!url || !key) return [];

    try {
      const response = await fetch(`${url}/rest/v1/workout_logs?select=*&order=date.desc`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id,
        routineId: item.id,
        routineName: item.routine_name,
        modality: item.modality,
        date: item.date,
        durationMinutes: item.duration_minutes,
        totalVolumeKg: item.total_volume_lbs,
        totalSetsCompleted: item.total_sets_completed,
        notes: item.notes,
        syncedToSheets: true,
        exercises: item.exercises || [],
      }));
    } catch (err) {
      console.error('Failed to fetch from Supabase:', err);
      return [];
    }
  },

  // Save dynamic weekly routine schedule to Supabase
  async saveWeeklyRoutine(dateISO: string, routineData: any): Promise<boolean> {
    const { url, key } = this.getSupabaseConfig();
    if (!url || !key) return false;

    try {
      const response = await fetch(`${url}/rest/v1/weekly_routines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          iso_date: dateISO,
          title: routineData.title,
          category: routineData.category,
          overview: routineData.overview,
          exercises: routineData.exercises || [],
        }),
      });

      return response.ok;
    } catch (err) {
      console.error('Failed to save weekly routine to Supabase:', err);
      return false;
    }
  }
};
