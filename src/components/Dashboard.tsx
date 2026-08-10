import React, { useState, useEffect, useMemo } from 'react';
import { Routine, Exercise, WorkoutLog, GoogleSheetsConfig } from '../types';
import { IconCheck, IconPlay } from './Icons';
import { DatabaseService } from '../services/db';

// BACKEND THEME CONFIGURATION ('light' | 'dark' | 'oled')
const ACTIVE_THEME: 'light' | 'dark' | 'oled' = 'light';

interface DashboardProps {
  routines?: Routine[];
  allExercises?: Exercise[];
  logs: WorkoutLog[];
  sheetsConfig: GoogleSheetsConfig;
  onFinishWorkout: (log: WorkoutLog) => void;
  onSelectAnotherRoutine?: (routine: Routine) => void;
}

interface SetItem {
  id: string;
  setType: string;
  previous: string;
  weightLbs?: number;
  reps?: number;
  durationValue?: string;
  completed: boolean;
}

interface ExerciseItem {
  id: string;
  name: string;
  category: string;
  note: string;
  youtubeId?: string;
  videoTitle?: string;
  isDurationBased?: boolean;
  durationUnit?: string;
  sets: SetItem[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  logs: initialLogs,
  sheetsConfig,
  onFinishWorkout,
}) => {
  const [logs, setLogs] = useState<WorkoutLog[]>(initialLogs);

  // Sync props logs to internal state whenever logs prop updates (e.g. after Supabase fetch)
  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  // Helper to calculate target week offset for any date ISO string (Base Monday = Aug 10, 2026)
  const calculateWeekOffsetForDate = (isoStr: string) => {
    const parts = isoStr.split('-').map(Number);
    const targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const baseMonday = new Date(2026, 7, 10);
    
    targetDate.setHours(0, 0, 0, 0);
    baseMonday.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((targetDate.getTime() - baseMonday.getTime()) / (1000 * 3600 * 24));
    return Math.floor(diffDays / 7);
  };

  // Initialize selected date from URL query param ?date=YYYY-MM-DD or localStorage fallback
  const getInitialSelectedDate = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const dateParam = searchParams.get('date');
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return dateParam;
    }
    const cachedDate = localStorage.getItem('pulse_last_selected_date');
    if (cachedDate && /^\d{4}-\d{2}-\d{2}$/.test(cachedDate)) {
      return cachedDate;
    }
    return '2026-08-10'; // Default to Aug 10, 2026
  };

  const initialDate = getInitialSelectedDate();

  // Week offset state (calculated from initial selected date)
  const [weekOffset, setWeekOffset] = useState<number>(calculateWeekOffsetForDate(initialDate));
  const [selectedDateISO, setSelectedDateISO] = useState<string>(initialDate);

  // Calculate Monday of the target week (Strict 7-day Monday -> Sunday)
  const getMondayForWeek = (offsetWeeks: number) => {
    const baseMonday = new Date(2026, 7, 10);
    const targetMonday = new Date(baseMonday);
    targetMonday.setDate(baseMonday.getDate() + (offsetWeeks * 7));
    return targetMonday;
  };

  const mondayDate = getMondayForWeek(weekOffset);

  // Generate strictly 7 days (Monday through Sunday)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const iso = `${year}-${month}-${day}`;
    
    return {
      iso,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      weekdayNum: d.getDay(),
    };
  });

  // Keep URL query param and localStorage strictly in sync with selectedDateISO
  const handleSelectDate = (iso: string) => {
    setSelectedDateISO(iso);
    localStorage.setItem('pulse_last_selected_date', iso);

    // Update URL query parameter cleanly without triggering page reload
    const newUrl = `${window.location.pathname}?date=${iso}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  };

  // Update selectedDateISO whenever weekOffset changes if current selection isn't in view
  useEffect(() => {
    const isCurrentInWeek = weekDates.some(w => w.iso === selectedDateISO);
    if (!isCurrentInWeek) {
      handleSelectDate(weekDates[0].iso);
    }
  }, [weekOffset]);

  // Active Expanded Video State for Standard View
  const [expandedVideoExId, setExpandedVideoExId] = useState<string | null>(null);

  // TV WHITEBOARD OVERLAY STATE & TV VIDEO MODAL
  const [isTvModeOpen, setIsTvModeOpen] = useState<boolean>(false);
  const [tvPlayingVideoId, setTvPlayingVideoId] = useState<string | null>(null);

  // Apply backend active theme configuration
  useEffect(() => {
    document.body.className = `theme-${ACTIVE_THEME}`;
  }, []);

  // Helper to parse local YYYY-MM-DD date without UTC timezone shifts
  const parseLocalDate = (isoStr: string) => {
    const parts = isoStr.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  // EXPLICIT WORKOUT ROUTINES FOR AUG 9 & AUG 10 - AUG 16, 2026 ONLY
  const getWorkoutDataForISO = (isoDate: string) => {
    switch (isoDate) {
      case '2026-08-09': // Sunday Aug 9, 2026 (Submitted Workout Log Session)
        return {
          dayLabel: 'Sun',
          title: 'Loaded Mobility & Strength-Through-Range',
          category: 'Loaded Mobility',
          overview: 'Loaded Mobility routine aligned with your Longevity Training Research Synthesis framework to protect your ACL and lateral meniscus reconstruction while keeping intensity high.',
          exercises: [
            {
              id: 'aug9-atg',
              name: 'Elevated ATG Split Squats',
              category: 'Quad/VMO & Ankle Mobility',
              note: 'Drive front knee forward until hamstring covers calf while keeping back leg straight.',
              youtubeId: 'LHX34TpJxbQ',
              videoTitle: 'ATG Split Squat Demo',
              sets: [
                { id: 'a9-atg-1', setType: '1', previous: '30 lbs × 10', weightLbs: 30, reps: 10, completed: true },
                { id: 'a9-atg-2', setType: '2', previous: '40 lbs × 10', weightLbs: 40, reps: 10, completed: true },
                { id: 'a9-atg-3', setType: '3', previous: '50 lbs × 8', weightLbs: 50, reps: 8, completed: true },
              ]
            },
            {
              id: 'aug9-jcurl',
              name: 'Jefferson Curls',
              category: 'Posterior Chain & Spinal Mobility',
              note: 'Light/moderate weight, controlled spinal roll down one vertebra at a time into deep stretch.',
              youtubeId: 'y_APeWo643w',
              videoTitle: 'Jefferson Curl Demo',
              sets: [
                { id: 'a9-jc-1', setType: '1', previous: '12 lbs × 10', weightLbs: 12, reps: 10, completed: true },
                { id: 'a9-jc-2', setType: '2', previous: '12 lbs × 10', weightLbs: 12, reps: 10, completed: true },
                { id: 'a9-jc-3', setType: '3', previous: '12 lbs × 8', weightLbs: 12, reps: 8, completed: true },
              ]
            },
            {
              id: 'aug9-cossack',
              name: 'Goblet Cossack Squats',
              category: 'Deep Lateral Hip Opening',
              note: 'Sink deep into one hip with opposite leg straight and toes pointed up.',
              youtubeId: 'tpczTeSkHz0',
              videoTitle: 'Cossack Squat Demo',
              sets: [
                { id: 'a9-cos-1', setType: '1', previous: '12 lbs × 8', weightLbs: 12, reps: 8, completed: true },
                { id: 'a9-cos-2', setType: '2', previous: '12 lbs × 8', weightLbs: 12, reps: 8, completed: true },
                { id: 'a9-cos-3', setType: '3', previous: '12 lbs × 8', weightLbs: 12, reps: 8, completed: true },
              ]
            },
            {
              id: 'aug9-tib',
              name: 'Seated Heavy Dumbbell/KB Tibialis Raise',
              category: 'Tibialis Anterior & Shin Strength',
              note: 'Sit on bench with calves supported, balance weight on toes, and flex ankles upward under load.',
              youtubeId: 'xs7wTPl28CE',
              videoTitle: 'Seated DB Tibialis Raise Demo',
              sets: [
                { id: 'a9-tib-1', setType: '1', previous: '12 lbs × 15', weightLbs: 12, reps: 15, completed: true },
                { id: 'a9-tib-2', setType: '2', previous: '12 lbs × 12', weightLbs: 12, reps: 12, completed: true },
                { id: 'a9-tib-3', setType: '3', previous: '12 lbs × 12', weightLbs: 12, reps: 12, completed: true },
              ]
            },
            {
              id: 'aug9-pullover',
              name: 'Dumbbell Pullovers',
              category: 'Thoracic Extension & Lat Stretch',
              note: 'Lower dumbbell overhead across bench into deep stretch before pulling back up.',
              youtubeId: 'FK4rHfWKEac',
              videoTitle: 'Dumbbell Pullover Demo',
              sets: [
                { id: 'a9-po-1', setType: '1', previous: '40 lbs × 12', weightLbs: 40, reps: 12, completed: true },
                { id: 'a9-po-2', setType: '2', previous: '40 lbs × 10', weightLbs: 40, reps: 10, completed: true },
                { id: 'a9-po-3', setType: '3', previous: '40 lbs × 10', weightLbs: 40, reps: 10, completed: true },
              ]
            },
            {
              id: 'aug9-powell',
              name: 'Side-Lying Powell Raises',
              category: 'Posterior Delt & Rotator Cuff',
              note: 'Lie on side on bench and raise dumbbell in wide arc to target posterior shoulder.',
              youtubeId: 'CuCAMi8pRWo',
              videoTitle: 'Powell Raise Demo',
              sets: [
                { id: 'a9-pr-1', setType: '1', previous: '8 lbs × 12', weightLbs: 8, reps: 12, completed: true },
                { id: 'a9-pr-2', setType: '2', previous: '10 lbs × 12', weightLbs: 10, reps: 12, completed: true },
                { id: 'a9-pr-3', setType: '3', previous: '12 lbs × 12', weightLbs: 12, reps: 12, completed: true },
              ]
            }
          ]
        };

      case '2026-08-10': // Monday Aug 10, 2026
        return {
          dayLabel: 'Mon',
          title: 'Heavy Lower Body Strength & Conditioning Metcon',
          category: 'Strength & Metcon',
          overview: 'Combines heavy multi-joint squatting and deadlifting with a high-intensity 12-minute kettlebell and thruster metcon circuit.',
          exercises: [
            {
              id: 'mon-squat',
              name: 'Barbell Back Squat',
              category: 'Quads, Glutes & Core Strength',
              note: 'Drive knees outward and sink to parallel before explosively driving through the heels.',
              youtubeId: 'aOzrA4FgnM0',
              videoTitle: 'Barbell Back Squat Demo',
              sets: [
                { id: 'm-sq-1', setType: '1', previous: '205 lbs × 6', weightLbs: 205, reps: 6, completed: false },
                { id: 'm-sq-2', setType: '2', previous: '215 lbs × 6', weightLbs: 215, reps: 6, completed: false },
                { id: 'm-sq-3', setType: '3', previous: '225 lbs × 6', weightLbs: 225, reps: 6, completed: false },
                { id: 'm-sq-4', setType: '4', previous: '225 lbs × 6', weightLbs: 225, reps: 6, completed: false },
              ]
            },
            {
              id: 'mon-rdl',
              name: 'Heavy Romanian Deadlift (RDL)',
              category: 'Hamstrings & Posterior Chain',
              note: 'Hinge hard at the hips with a flat back to stretch hamstrings under heavy tension.',
              youtubeId: 'szHJ7aAU2CM',
              videoTitle: 'Romanian Deadlift Demo',
              sets: [
                { id: 'm-rdl-1', setType: '1', previous: '205 lbs × 8', weightLbs: 205, reps: 8, completed: false },
                { id: 'm-rdl-2', setType: '2', previous: '215 lbs × 8', weightLbs: 215, reps: 8, completed: false },
                { id: 'm-rdl-3', setType: '3', previous: '225 lbs × 8', weightLbs: 225, reps: 8, completed: false },
                { id: 'm-rdl-4', setType: '4', previous: '225 lbs × 8', weightLbs: 225, reps: 8, completed: false },
              ]
            },
            {
              id: 'mon-kb',
              name: 'Kettlebell Swings (Metcon Part B)',
              category: 'Posterior Conditioning & Hinge Power',
              note: 'Snap hips forcefully to drive kettlebell to chest height without using arm pulling strength.',
              youtubeId: 'aSYap2yhW8s',
              videoTitle: 'Kettlebell Swings Demo',
              sets: [
                { id: 'm-kb-1', setType: '1', previous: '12-Min AMRAP @ 53 lbs', weightLbs: 53, reps: 15, completed: false },
              ]
            },
            {
              id: 'mon-thrust',
              name: 'Dumbbell Thrusters (Metcon Part B)',
              category: 'Full Body Conditioning & Overhead Drive',
              note: 'Squat to full depth and drive dumbbells overhead in one continuous fluid motion.',
              youtubeId: 'qnOikHllwWc',
              videoTitle: 'Dumbbell Thrusters Demo',
              sets: [
                { id: 'm-th-1', setType: '1', previous: '12-Min AMRAP @ 35 lbs DBs', weightLbs: 35, reps: 10, completed: false },
              ]
            },
            {
              id: 'mon-step',
              name: 'Poliquin Step-Up (Finisher)',
              category: 'VMO Isolation & Knee Bulletproofing',
              note: 'Heel elevated on 3" step; drive knee forward over toe to tap opposite heel smoothly.',
              youtubeId: '4HTL_23ULuE',
              videoTitle: 'Poliquin Step-Up Demo',
              sets: [
                { id: 'm-ps-1', setType: '1', previous: '35 lbs × 12', weightLbs: 35, reps: 12, completed: false },
                { id: 'm-ps-2', setType: '2', previous: '35 lbs × 12', weightLbs: 35, reps: 12, completed: false },
                { id: 'm-ps-3', setType: '3', previous: '35 lbs × 12', weightLbs: 35, reps: 12, completed: false },
              ]
            }
          ]
        };

      case '2026-08-11': // Tuesday Aug 11, 2026
        return {
          dayLabel: 'Tue',
          title: 'Heavy Upper Body Push/Pull & Snatch Metcon',
          category: 'Strength & Metcon',
          overview: 'Pairs heavy incline pressing and weighted pull-ups with a fast-paced dumbbell snatch and push-up conditioning circuit.',
          exercises: [
            {
              id: 'tue-inc',
              name: 'Incline Dumbbell Bench Press',
              category: 'Upper Chest & Front Deltoids',
              note: 'Set bench to 30 degrees and lower dumbbells with elbows tucked at 45 degrees.',
              youtubeId: '8fXfwG4ftaQ',
              videoTitle: 'Incline DB Bench Demo',
              sets: [
                { id: 't-inc-1', setType: '1', previous: '60 lbs × 8', weightLbs: 60, reps: 8, completed: false },
                { id: 't-inc-2', setType: '2', previous: '60 lbs × 8', weightLbs: 60, reps: 8, completed: false },
                { id: 't-inc-3', setType: '3', previous: '60 lbs × 8', weightLbs: 60, reps: 8, completed: false },
                { id: 't-inc-4', setType: '4', previous: '60 lbs × 8', weightLbs: 60, reps: 8, completed: false },
              ]
            },
            {
              id: 'tue-pu',
              name: 'Weighted Pull-Up',
              category: 'Lats & Upper Back',
              note: 'Drive chest to bar and squeeze shoulder blades together at full extension.',
              youtubeId: 'qAT31DQYiuw',
              videoTitle: 'Weighted Pull-Up Demo',
              sets: [
                { id: 't-pu-1', setType: '1', previous: '+25 lbs × 6', weightLbs: 25, reps: 6, completed: false },
                { id: 't-pu-2', setType: '2', previous: '+25 lbs × 6', weightLbs: 25, reps: 6, completed: false },
                { id: 't-pu-3', setType: '3', previous: '+25 lbs × 6', weightLbs: 25, reps: 6, completed: false },
                { id: 't-pu-4', setType: '4', previous: '+25 lbs × 6', weightLbs: 25, reps: 6, completed: false },
              ]
            },
            {
              id: 'tue-snatch',
              name: 'Single-Arm Dumbbell Snatch (Metcon Part B)',
              category: 'Full Body Power & Conditioning',
              note: 'Drive through hips and pull dumbbell overhead in one explosive continuous movement.',
              youtubeId: 'rCVmr5bgI7c',
              videoTitle: 'DB Snatch Demo',
              sets: [
                { id: 't-sn-1', setType: '1', previous: '4 Rounds @ 45 lbs', weightLbs: 45, reps: 10, completed: false },
              ]
            },
            {
              id: 'tue-pushup',
              name: 'Push-Ups (Metcon Part B)',
              category: 'Chest & Triceps Stamina',
              note: 'Lock core rigid and touch chest to floor on every single repetition.',
              youtubeId: 'qAT31DQYiuw',
              videoTitle: 'Push-Up Demo',
              sets: [
                { id: 't-p-1', setType: '1', previous: '4 Rounds × 15 reps', weightLbs: 0, reps: 15, completed: false },
              ]
            },
            {
              id: 'tue-face',
              name: 'Standing Cable Face Pull (Finisher)',
              category: 'Scapular Health & External Rotators',
              note: 'Set pulley at eye level and pull rope to forehead with thumbs pointing backward.',
              youtubeId: 'FK4rHfWKEac',
              videoTitle: 'Cable Face Pull Demo',
              sets: [
                { id: 't-fp-1', setType: '1', previous: '50 lbs × 15', weightLbs: 50, reps: 15, completed: false },
                { id: 't-fp-2', setType: '2', previous: '50 lbs × 15', weightLbs: 50, reps: 15, completed: false },
                { id: 't-fp-3', setType: '3', previous: '50 lbs × 15', weightLbs: 50, reps: 15, completed: false },
              ]
            }
          ]
        };

      case '2026-08-12': // Wednesday Aug 12, 2026
        return {
          dayLabel: 'Wed',
          title: 'Light Evening Travel Zone 2 Run or Bike',
          category: 'Cardio / Recovery',
          overview: 'A 25–30 minute low-intensity Zone 2 cardio session during travel evening to flush metabolic waste and maintain aerobic base.',
          exercises: [
            {
              id: 'wed-run',
              name: 'Light Outdoor Run or Stationary Bike',
              category: 'Zone 2 Aerobic Base',
              note: 'Keep effort at a conversational pace (60–70% max HR) without pushing into anaerobic fatigue.',
              youtubeId: '6EhaDP7WKG0',
              videoTitle: 'Zone 2 Cardio Demo',
              isDurationBased: true,
              durationUnit: 'minutes',
              sets: [
                { id: 'w-r-1', setType: '1', previous: '25-30 Mins @ Zone 2', durationValue: '30 mins', completed: false },
              ]
            }
          ]
        };

      case '2026-08-13': // Thursday Aug 13, 2026
        return {
          dayLabel: 'Thu',
          title: 'Heavy Commercial Gym Full Body Power',
          category: 'Strength & Metcon',
          overview: 'Capitalizes on full work gym machinery for heavy deadlifts, overhead presses, leg press, and farmer carries.',
          exercises: [
            {
              id: 'thu-tb',
              name: 'Heavy Trap Bar Deadlift',
              category: 'Total Posterior & Leg Drive',
              note: 'Stand inside hex bar, pull chest up with flat back, and drive floor away.',
              youtubeId: 'EsqwERaSTMI',
              videoTitle: 'Trap Bar Deadlift Demo',
              sets: [
                { id: 'th-tb-1', setType: '1', previous: '275 lbs × 5', weightLbs: 275, reps: 5, completed: false },
                { id: 'th-tb-2', setType: '2', previous: '295 lbs × 5', weightLbs: 295, reps: 5, completed: false },
                { id: 'th-tb-3', setType: '3', previous: '315 lbs × 5', weightLbs: 315, reps: 5, completed: false },
                { id: 'th-tb-4', setType: '4', previous: '315 lbs × 5', weightLbs: 315, reps: 5, completed: false },
              ]
            },
            {
              id: 'thu-press',
              name: 'Heavy Dumbbell Shoulder Press',
              category: 'Anterior & Lateral Deltoids',
              note: 'Press dumbbells overhead aggressively without arching lower back.',
              youtubeId: 'k6tzKisR3NY',
              videoTitle: 'DB Shoulder Press Demo',
              sets: [
                { id: 'th-sp-1', setType: '1', previous: '55 lbs × 8', weightLbs: 55, reps: 8, completed: false },
                { id: 'th-sp-2', setType: '2', previous: '60 lbs × 8', weightLbs: 60, reps: 8, completed: false },
                { id: 'th-sp-3', setType: '3', previous: '65 lbs × 6', weightLbs: 65, reps: 6, completed: false },
                { id: 'th-sp-4', setType: '4', previous: '65 lbs × 6', weightLbs: 65, reps: 6, completed: false },
              ]
            },
            {
              id: 'thu-legpress',
              name: 'Heavy Leg Press Machine',
              category: 'Quadriceps & Glute Mass',
              note: 'Lower platform under control until knees reach 90 degrees before pressing back up.',
              youtubeId: 'EotSw18oR9w',
              videoTitle: 'Leg Press Demo',
              sets: [
                { id: 'th-lp-1', setType: '1', previous: '315 lbs × 10', weightLbs: 315, reps: 10, completed: false },
                { id: 'th-lp-2', setType: '2', previous: '360 lbs × 8', weightLbs: 360, reps: 8, completed: false },
                { id: 'th-lp-3', setType: '3', previous: '405 lbs × 8', weightLbs: 405, reps: 8, completed: false },
              ]
            },
            {
              id: 'thu-carry',
              name: 'Heavy Dumbbell Farmer Carry (Metcon Part B)',
              category: 'Grip Strength & Total Body Core Stability',
              note: 'Walk with tall posture, shoulders retracted, and core locked without swaying.',
              youtubeId: '1uOs1hP3u4A',
              videoTitle: 'Farmer Carry Demo',
              sets: [
                { id: 'th-fc-1', setType: '1', previous: '3 Rounds × 100 ft @ 65 lbs DBs', weightLbs: 65, reps: 100, completed: false },
              ]
            },
            {
              id: 'thu-pal',
              name: 'Standing Cable Pallof Press',
              category: 'Core Anti-Rotation',
              note: 'Press handle straight out at chest height and hold 2 seconds against cable rotation.',
              youtubeId: 'mje-vjpv-pdb',
              videoTitle: 'Pallof Press Demo',
              sets: [
                { id: 'th-p-1', setType: '1', previous: '40 lbs × 10', weightLbs: 40, reps: 10, completed: false },
                { id: 'th-p-2', setType: '2', previous: '45 lbs × 10', weightLbs: 45, reps: 10, completed: false },
                { id: 'th-p-3', setType: '3', previous: '50 lbs × 10', weightLbs: 50, reps: 10, completed: false },
              ]
            }
          ]
        };

      case '2026-08-14': // Friday Aug 14, 2026
        return {
          dayLabel: 'Fri',
          title: 'Heavy Posterior Power & Hamstring Resilience',
          category: 'Strength & Metcon',
          overview: 'Features heavy hip thrusts and split squats paired with a 10-minute EMOM and Nordic hamstring curls for knee stability.',
          exercises: [
            {
              id: 'fri-thrust',
              name: 'Heavy Barbell Hip Thrust',
              category: 'Glutes & Hamstrings',
              note: 'Place upper back across bench and drive hips up into full extension at top lockout.',
              youtubeId: 'W86oVlnLqY4',
              videoTitle: 'Barbell Hip Thrust Demo',
              sets: [
                { id: 'f-ht-1', setType: '1', previous: '225 lbs × 8', weightLbs: 225, reps: 8, completed: false },
                { id: 'f-ht-2', setType: '2', previous: '255 lbs × 8', weightLbs: 255, reps: 8, completed: false },
                { id: 'f-ht-3', setType: '3', previous: '275 lbs × 8', weightLbs: 275, reps: 8, completed: false },
                { id: 'f-ht-4', setType: '4', previous: '275 lbs × 8', weightLbs: 275, reps: 8, completed: false },
              ]
            },
            {
              id: 'fri-bss',
              name: 'Heavy Bulgarian Split Squat',
              category: 'Single-Leg Strength & Quads',
              note: 'Rear foot elevated; sink deep into front leg with controlled 3-second eccentric.',
              youtubeId: 'uODWo4YqbT8',
              videoTitle: 'Bulgarian Split Squat Demo',
              sets: [
                { id: 'f-bs-1', setType: '1', previous: '45 lbs × 8', weightLbs: 45, reps: 8, completed: false },
                { id: 'f-bs-2', setType: '2', previous: '50 lbs × 8', weightLbs: 50, reps: 8, completed: false },
                { id: 'f-bs-3', setType: '3', previous: '55 lbs × 8', weightLbs: 55, reps: 8, completed: false },
              ]
            },
            {
              id: 'fri-goblet',
              name: 'Dumbbell Goblet Squat (Metcon Part B)',
              category: 'Quad Conditioning (Minute 1 of 10-Min EMOM)',
              note: 'Hold dumbbell at chest and squat rapidly to full depth every on-the-minute mark.',
              youtubeId: 'LHX34TpJxbQ',
              videoTitle: 'Goblet Squat Demo',
              sets: [
                { id: 'f-g-1', setType: '1', previous: '10-Min EMOM @ 50 lbs', weightLbs: 50, reps: 12, completed: false },
              ]
            },
            {
              id: 'fri-rower',
              name: 'Rower Sprint (Metcon Part B)',
              category: 'Anaerobic Engine (Minute 2 of 10-Min EMOM)',
              note: 'Pull max effort strokes to clear 12 calories as fast as possible.',
              youtubeId: '6EhaDP7WKG0',
              videoTitle: 'Rower Sprint Demo',
              isDurationBased: true,
              durationUnit: 'calories',
              sets: [
                { id: 'f-r-1', setType: '1', previous: '10-Min EMOM: 12 Cals', durationValue: '12 Cals', completed: false },
              ]
            },
            {
              id: 'fri-nordic',
              name: 'Nordic Hamstring Curl (Finisher)',
              category: 'Eccentric Hamstring Strength & ACL Stability',
              note: 'Ankles anchored; lower torso forward under hamstrings control as slowly as possible.',
              youtubeId: '_e9vFU9-tkc',
              videoTitle: 'Nordic Curl Demo',
              sets: [
                { id: 'f-n-1', setType: '1', previous: 'BW × 6', weightLbs: 0, reps: 6, completed: false },
                { id: 'f-n-2', setType: '2', previous: 'BW × 6', weightLbs: 0, reps: 6, completed: false },
                { id: 'f-n-3', setType: '3', previous: 'BW × 6', weightLbs: 0, reps: 6, completed: false },
              ]
            }
          ]
        };

      case '2026-08-15': // Saturday Aug 15, 2026
        return {
          dayLabel: 'Sat',
          title: 'CrossFit Benchmark Metcon & Recovery Yoga',
          category: 'Cardio / Strength',
          overview: 'High-output 20-minute CrossFit-style AMRAP circuit followed immediately by a 15-minute restorative yoga recovery flow.',
          exercises: [
            {
              id: 'sat-wod',
              name: 'CrossFit Benchmark WOD (20-Min AMRAP)',
              category: 'High-Output Conditioning & Gymnastics Stamina',
              note: 'Complete 5 Pull-ups, 10 Push-ups, and 15 Dumbbell Goblet Squats continuously for 20 minutes.',
              youtubeId: 'SiZrDlsqxIk',
              videoTitle: 'CrossFit WOD Demo',
              isDurationBased: true,
              durationUnit: 'AMRAP',
              sets: [
                { id: 's-w-1', setType: '1', previous: '20-Min AMRAP @ 45 lbs', durationValue: '20 Mins', completed: false },
              ]
            },
            {
              id: 'sat-yoga',
              name: 'Restorative Yoga & Mobility Flow',
              category: 'Parasympathetic Reset & Mobility',
              note: 'Hold deep hip flexor, hamstring, and thoracic stretches with deep nasal breathing.',
              youtubeId: '0ftx7na1cww',
              videoTitle: 'Yoga Recovery Flow Demo',
              isDurationBased: true,
              durationUnit: 'minutes',
              sets: [
                { id: 's-y-1', setType: '1', previous: '15 Mins Flow', durationValue: '15 Mins', completed: false },
              ]
            }
          ]
        };

      case '2026-08-16': // Sunday Aug 16, 2026
        return {
          dayLabel: 'Sun',
          title: 'Loaded Mobility & Strength-Through-Range',
          category: 'Loaded Mobility',
          overview: 'Applies active resistance through extended ranges of motion to open up hips, shoulders, and ankles while building joint strength.',
          exercises: [
            {
              id: 'sun-atg',
              name: 'Elevated ATG Split Squat',
              category: 'Quad/VMO & Ankle Mobility',
              note: 'Drive front knee forward until hamstring covers calf while keeping back leg straight.',
              youtubeId: 'LHX34TpJxbQ',
              videoTitle: 'ATG Split Squat Demo',
              sets: [
                { id: 'atg-1', setType: '1', previous: '20 lbs × 10', weightLbs: 20, reps: 10, completed: false },
                { id: 'atg-2', setType: '2', previous: '25 lbs × 10', weightLbs: 25, reps: 10, completed: false },
                { id: 'atg-3', setType: '3', previous: '30 lbs × 8', weightLbs: 30, reps: 8, completed: false },
              ]
            },
            {
              id: 'sun-jcurl',
              name: 'Jefferson Curl',
              category: 'Posterior Chain & Spinal Mobility',
              note: 'Tuck chin to chest and roll down one vertebra at a time into deep stretch.',
              youtubeId: 'y_APeWo643w',
              videoTitle: 'Jefferson Curl Demo',
              sets: [
                { id: 'jc-1', setType: '1', previous: '20 lbs × 10', weightLbs: 20, reps: 10, completed: false },
                { id: 'jc-2', setType: '2', previous: '25 lbs × 10', weightLbs: 25, reps: 10, completed: false },
                { id: 'jc-3', setType: '3', previous: '30 lbs × 8', weightLbs: 30, reps: 8, completed: false },
              ]
            },
            {
              id: 'sun-cossack',
              name: 'Goblet Cossack Squat',
              category: 'Adductor & Hip Opening',
              note: 'Sink deep into one hip with opposite leg straight and toes pointed up.',
              youtubeId: 'tpczTeSkHz0',
              videoTitle: 'Cossack Squat Demo',
              sets: [
                { id: 'cos-1', setType: '1', previous: '25 lbs × 8', weightLbs: 25, reps: 8, completed: false },
                { id: 'cos-2', setType: '2', previous: '30 lbs × 8', weightLbs: 30, reps: 8, completed: false },
                { id: 'cos-3', setType: '3', previous: '35 lbs × 8', weightLbs: 35, reps: 8, completed: false },
              ]
            },
            {
              id: 'sun-tib',
              name: 'Seated Heavy Dumbbell Tibialis Raise',
              category: 'Tibialis Anterior & Shin Strength',
              note: 'Sit on bench with feet hanging over edge, balance weight on toes, and flex ankle upward.',
              youtubeId: 'xs7wTPl28CE',
              videoTitle: 'Tibialis Raise Demo',
              sets: [
                { id: 'tib-1', setType: '1', previous: '15 lbs × 15', weightLbs: 15, reps: 15, completed: false },
                { id: 'tib-2', setType: '2', previous: '20 lbs × 12', weightLbs: 20, reps: 12, completed: false },
                { id: 'tib-3', setType: '3', previous: '25 lbs × 12', weightLbs: 25, reps: 12, completed: false },
              ]
            },
            {
              id: 'sun-pullover',
              name: 'Dumbbell Pullover',
              category: 'Thoracic Extension & Lat Stretch',
              note: 'Lower dumbbell overhead across bench into deep stretch before pulling back up.',
              youtubeId: 'FK4rHfWKEac',
              videoTitle: 'Dumbbell Pullover Demo',
              sets: [
                { id: 'po-1', setType: '1', previous: '30 lbs × 12', weightLbs: 30, reps: 10, completed: false },
                { id: 'po-2', setType: '2', previous: '35 lbs × 10', weightLbs: 35, reps: 10, completed: false },
                { id: 'po-3', setType: '3', previous: '45 lbs × 10', weightLbs: 45, reps: 10, completed: false },
              ]
            },
            {
              id: 'sun-powell',
              name: 'Side-Lying Powell Raise',
              category: 'Rotator Cuff & Rear Delt',
              note: 'Lie on side on bench and raise dumbbell in wide arc to target posterior shoulder.',
              youtubeId: 'CuCAMi8pRWo',
              videoTitle: 'Powell Raise Demo',
              sets: [
                { id: 'pr-1', setType: '1', previous: '8 lbs × 12', weightLbs: 8, reps: 12, completed: false },
                { id: 'pr-2', setType: '2', previous: '10 lbs × 12', weightLbs: 10, reps: 12, completed: false },
                { id: 'pr-3', setType: '3', previous: '12 lbs × 12', weightLbs: 12, reps: 12, completed: false },
              ]
            }
          ]
        };

      default:
        // UNSCHEDULED / FUTURE OR PAST WEEKS (RELY ON USER UPDATE)
        return {
          dayLabel: parseLocalDate(isoDate).toLocaleDateString('en-US', { weekday: 'short' }),
          title: 'No Workout Scheduled',
          category: 'Unscheduled',
          overview: 'No workout is scheduled for this date yet. Paste your updated routine for this week whenever you are ready!',
          exercises: []
        };
    }
  };

  // State to hold dynamic set edits for each day
  const [workoutStateMap, setWorkoutStateMap] = useState<{ [isoDate: string]: any }>({});

  // Robust date string matching logic
  const isDateSubmitted = (iso: string) => {
    return logs.some((l) => l.date.includes(iso) || l.routineName.includes(iso));
  };

  // SYNCHRONOUSLY COMPUTE ACTIVE WORKOUT FROM BASE + SAVED LOG + LOCAL EDITS
  const activeWorkout = useMemo(() => {
    const baseData = getWorkoutDataForISO(selectedDateISO);
    
    // 1. If user has active local edits in this session, use local edits
    if (workoutStateMap[selectedDateISO]) {
      return workoutStateMap[selectedDateISO];
    }

    // 2. Otherwise, if a saved log exists in state/Supabase, merge recorded sets & checkmarks!
    const existingLog = logs.find(l => l.date.includes(selectedDateISO) || l.routineName.includes(selectedDateISO));
    if (existingLog && existingLog.exercises && existingLog.exercises.length > 0) {
      const updatedExercises = baseData.exercises.map((ex: any) => {
        const loggedEx = existingLog.exercises.find((e: any) => 
          e.exerciseId === ex.id || 
          e.exerciseName?.toLowerCase() === ex.name?.toLowerCase() ||
          ex.name?.toLowerCase().includes(e.exerciseName?.toLowerCase())
        );

        if (!loggedEx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s: any, idx: number) => {
            const loggedSet = loggedEx.sets?.[idx];
            if (!loggedSet) return s;
            return {
              ...s,
              weightLbs: loggedSet.weightKg !== undefined && loggedSet.weightKg > 0 ? loggedSet.weightKg : s.weightLbs,
              reps: loggedSet.reps !== undefined && loggedSet.reps > 0 ? loggedSet.reps : s.reps,
              completed: loggedSet.completed !== undefined ? Boolean(loggedSet.completed) : true,
            };
          })
        };
      });

      return {
        ...baseData,
        exercises: updatedExercises,
      };
    }

    return baseData;
  }, [selectedDateISO, workoutStateMap, logs]);

  // Keep notes synchronized with submitted log or default for Aug 9
  useEffect(() => {
    const existingLog = logs.find(l => l.date.includes(selectedDateISO) || l.routineName.includes(selectedDateISO));
    if (existingLog && existingLog.notes) {
      setWorkoutNotes(existingLog.notes);
    } else if (selectedDateISO === '2026-08-09') {
      setWorkoutNotes('Ok, this worked. Good workout.');
    } else {
      setWorkoutNotes('');
    }
  }, [selectedDateISO, logs]);

  // Toggle set checkbox completion state
  const handleToggleSetCheck = (exerciseId: string, setId: string) => {
    const updatedExercises = activeWorkout.exercises.map((ex: ExerciseItem) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s: SetItem) => {
          if (s.id !== setId) return s;
          return { ...s, completed: !s.completed };
        }),
      };
    });

    const updatedWorkout = { ...activeWorkout, exercises: updatedExercises };
    setWorkoutStateMap((prev) => ({
      ...prev,
      [selectedDateISO]: updatedWorkout,
    }));
  };

  // Handle Strength Weight Change (LBS)
  const handleSetWeightChange = (exerciseId: string, setId: string, val: number) => {
    const updatedExercises = activeWorkout.exercises.map((ex: ExerciseItem) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s: SetItem) => {
          if (s.id !== setId) return s;
          return { ...s, weightLbs: val };
        }),
      };
    });

    const updatedWorkout = { ...activeWorkout, exercises: updatedExercises };
    setWorkoutStateMap((prev) => ({
      ...prev,
      [selectedDateISO]: updatedWorkout,
    }));
  };

  // Handle Strength Reps Change
  const handleSetRepsChange = (exerciseId: string, setId: string, val: number) => {
    const updatedExercises = activeWorkout.exercises.map((ex: ExerciseItem) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s: SetItem) => {
          if (s.id !== setId) return s;
          return { ...s, reps: val };
        }),
      };
    });

    const updatedWorkout = { ...activeWorkout, exercises: updatedExercises };
    setWorkoutStateMap((prev) => ({
      ...prev,
      [selectedDateISO]: updatedWorkout,
    }));
  };

  // Handle Duration Value Change for Yoga/Mobility
  const handleSetDurationChange = (exerciseId: string, setId: string, val: string) => {
    const updatedExercises = activeWorkout.exercises.map((ex: ExerciseItem) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s: SetItem) => {
          if (s.id !== setId) return s;
          return { ...s, durationValue: val };
        }),
      };
    });

    const updatedWorkout = { ...activeWorkout, exercises: updatedExercises };
    setWorkoutStateMap((prev) => ({
      ...prev,
      [selectedDateISO]: updatedWorkout,
    }));
  };

  // Result Free Text Notes
  const [workoutNotes, setWorkoutNotes] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const isAlreadySubmitted = isDateSubmitted(selectedDateISO);

  const handleSubmitWorkout = () => {
    // Standardize ISO date to noon UTC so .slice(0, 10) never shifts across timezones
    const fixedIsoDate = `${selectedDateISO}T12:00:00.000Z`;

    const newLog: WorkoutLog = {
      id: `log-clean-${selectedDateISO}`,
      routineId: `rot-${selectedDateISO}`,
      routineName: `${activeWorkout.title} (${selectedDateISO})`,
      modality: activeWorkout.category.toLowerCase() as any,
      date: fixedIsoDate,
      durationMinutes: 45,
      totalVolumeKg: 15000,
      totalSetsCompleted: activeWorkout.exercises.reduce((acc: number, ex: ExerciseItem) => acc + ex.sets.filter(s => s.completed).length, 0) || 12,
      notes: workoutNotes || `${activeWorkout.title} completed in LBS.`,
      aiReview: `Submitted for ${selectedDateISO}!`,
      syncedToSheets: true,
      exercises: activeWorkout.exercises.map((ex: ExerciseItem) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.category,
        sets: ex.sets.map((s: SetItem, i: number) => ({
          id: s.id,
          setNumber: i + 1,
          reps: s.reps || 10,
          weightKg: s.weightLbs || 0,
          completed: s.completed,
          rpe: 8
        }))
      })),
    };

    DatabaseService.saveWorkoutLog(newLog, sheetsConfig);
    setLogs(DatabaseService.getWorkoutLogs());
    setStatusMessage(`✓ Session ${isAlreadySubmitted ? 'Updated' : 'Saved'} for ${selectedDateISO}!`);
    onFinishWorkout(newLog);
  };

  // Format header range for current week view (e.g., AUG 10 – AUG 16, 2026)
  const firstDay = weekDates[0];
  const lastDay = weekDates[6];
  const weekRangeLabel = `${firstDay.monthShort.toUpperCase()} ${firstDay.dayNum} – ${lastDay.monthShort.toUpperCase()} ${lastDay.dayNum}, ${firstDay.year}`;

  return (
    <div className="app-wrapper">
      {/* CENTERED ULTRA-READABLE GYM TV WHITEBOARD OVERLAY */}
      {isTvModeOpen && (
        <div className="tv-hud-overlay">
          <button className="tv-exit-btn" onClick={() => { setIsTvModeOpen(false); setTvPlayingVideoId(null); }}>
            ✕ EXIT TV MODE
          </button>

          {/* TV VIDEO POPUP MODAL */}
          {tvPlayingVideoId && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0, 0, 0, 0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ width: '100%', maxWidth: '860px', position: 'relative' }}>
                <button
                  onClick={() => setTvPlayingVideoId(null)}
                  style={{ position: 'absolute', top: '-44px', right: 0, background: '#1F2937', color: '#FFF', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem' }}
                >
                  ✕ Close Video
                </button>
                <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 12px 36px rgba(0,0,0,0.8)' }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${tvPlayingVideoId}?autoplay=1`}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {/* CRISP CENTERED WHITEBOARD LIST WITH SLEEK BLACK DEMO BUTTONS */}
          <div className="tv-whiteboard-grid">
            {activeWorkout.exercises.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '1.4rem', fontWeight: 800 }}>
                NO WORKOUT SCHEDULED FOR THIS DATE
              </div>
            ) : (
              activeWorkout.exercises.map((ex: ExerciseItem) => (
                <div key={ex.id} className="tv-whiteboard-row">
                  <div className="tv-whiteboard-ex-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
                    <span>{ex.name}</span>
                    {ex.youtubeId && (
                      <button
                        onClick={() => setTvPlayingVideoId(ex.youtubeId || null)}
                        style={{
                          background: '#111116',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.22)',
                          padding: '4px 14px',
                          borderRadius: '9999px',
                          fontSize: 'clamp(0.8rem, 1.8vh, 1.15rem)',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          verticalAlign: 'middle',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                          transition: 'all 0.2s ease',
                        }}
                        title="Play Demo Video"
                      >
                        <IconPlay size={11} color="var(--figma-cyan)" />
                        <span>DEMO</span>
                      </button>
                    )}
                  </div>

                  <div className="tv-whiteboard-target">
                    {ex.isDurationBased
                      ? `${ex.sets.length} SETS • ${ex.sets[0]?.durationValue || 'DURATION'}`
                      : `${ex.sets.length} SETS × ${ex.sets[0]?.reps || 10} REPS (${ex.sets[0]?.weightLbs || 15} LBS)`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CALENDAR WEEK NAVIGATION HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#0F172A',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
            title="Previous Week"
          >
            ◀
          </button>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155', letterSpacing: '0.04em' }}>
            {weekRangeLabel}
          </span>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#0F172A',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
            title="Next Week"
          >
            ▶
          </button>
        </div>

        {weekOffset !== 0 && (
          <button
            onClick={() => {
              setWeekOffset(0);
              handleSelectDate('2026-08-10');
            }}
            style={{
              background: 'rgba(0, 163, 255, 0.12)',
              color: 'var(--figma-cyan)',
              border: 'none',
              borderRadius: '6px',
              padding: '3px 9px',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            This Week (Aug 10–16)
          </button>
        )}
      </div>

      {/* 1. CLEAN 7-DAY HORIZONTAL CALENDAR STRIP */}
      <div className="figma-horizontal-calendar">
        {weekDates.map((d) => {
          const submitted = isDateSubmitted(d.iso);
          const isSelected = selectedDateISO === d.iso;

          return (
            <button
              key={d.iso}
              className={`figma-cal-pill ${isSelected ? 'active' : ''}`}
              onClick={() => {
                handleSelectDate(d.iso);
                setStatusMessage('');
                setExpandedVideoExId(null);
              }}
            >
              <span className="cal-day-name">{d.dayName}</span>
              <span className="cal-day-num">{d.dayNum}</span>
              {submitted ? (
                <div
                  style={{
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: isSelected ? '#FFFFFF' : '#10B981',
                    color: isSelected ? '#059669' : '#FFFFFF',
                    boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.15)' : '0 2px 6px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                  title="Workout Completed & Submitted"
                >
                  <IconCheck size={9} color={isSelected ? '#059669' : '#FFFFFF'} />
                </div>
              ) : (
                <div
                  className="cal-dot-indicator"
                  style={{
                    background: isSelected ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. ACTIVE WORKOUT & SETS CARD */}
      <div className="figma-tracker-card">
        {/* INLINE HEADER WITH ZERO ADDED HEIGHT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ background: 'rgba(0, 163, 255, 0.12)', color: 'var(--figma-cyan)', padding: '3px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
            {activeWorkout.category}
          </span>
          <button
            onClick={() => setIsTvModeOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(0, 163, 255, 0.08)',
              color: 'var(--figma-cyan)',
              border: 'none',
              padding: '3px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            📺 TV Mode
          </button>
        </div>

        <h2 style={{ fontSize: '1.14rem', fontWeight: 800, marginTop: '6px', lineHeight: 1.3 }}>
          {activeWorkout.title}
        </h2>

        {/* WORKOUT OVERVIEW / DESCRIPTION BOX */}
        <div className="overview-box">
          {activeWorkout.overview}
        </div>

        {/* Exercises List */}
        {activeWorkout.exercises.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>
            No exercises scheduled for this date. Paste your new workout routine when ready!
          </div>
        ) : (
          activeWorkout.exercises.map((ex: ExerciseItem, idx: number) => {
            const isVideoOpen = expandedVideoExId === ex.id;

            return (
              <div key={ex.id} style={{ marginBottom: idx === activeWorkout.exercises.length - 1 ? '4px' : '22px' }}>
                <div className="exercise-name" style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '4px', lineHeight: 1.3 }}>
                  {ex.name}
                </div>

                {/* LIGHT CYAN DEMO BUTTON IN STANDARD VIEW */}
                {ex.youtubeId && (
                  <div style={{ marginBottom: '6px' }}>
                    <button
                      onClick={() => setExpandedVideoExId(isVideoOpen ? null : ex.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: isVideoOpen ? '#FFFFFF' : 'var(--figma-cyan)',
                        background: isVideoOpen ? 'var(--figma-cyan)' : 'rgba(0, 163, 255, 0.08)',
                        border: 'none',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <IconPlay size={9} color={isVideoOpen ? '#FFFFFF' : 'var(--figma-cyan)'} />
                      <span>{isVideoOpen ? 'Close Video Demo' : 'Watch Video Demo'}</span>
                    </button>
                  </div>
                )}

                {/* INLINE EXPANDABLE YOUTUBE PLAYER */}
                {isVideoOpen && ex.youtubeId && (
                  <div className="video-preview-container">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${ex.youtubeId}?autoplay=1&rel=0`}
                      title={ex.videoTitle || 'Exercise Video Demo'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                <div className="text-grey-var" style={{ fontSize: '0.74rem', lineHeight: 1.4, marginBottom: '10px' }}>
                  Note: {ex.note}
                </div>

                {/* COLUMN HEADER LABELS (EXPLICIT LBS WEIGHT LABEL) */}
                {ex.isDurationBased ? (
                  <div className="set-header-duration">
                    <span>SET</span>
                    <span style={{ textAlign: 'left' }}>PREVIOUS</span>
                    <span>DURATION</span>
                    <span>DONE</span>
                  </div>
                ) : (
                  <div className="set-header-strength">
                    <span>SET</span>
                    <span style={{ textAlign: 'left' }}>PREVIOUS</span>
                    <span>LBS</span>
                    <span>REPS</span>
                    <span>DONE</span>
                  </div>
                )}

                {/* CONTEXT-AWARE SET ROWS GRID */}
                {ex.sets.map((set: SetItem) => {
                  if (ex.isDurationBased) {
                    return (
                      <div key={set.id} className={`figma-set-grid-duration ${set.completed ? 'completed' : ''}`}>
                        <div className="text-grey-var" style={{ fontSize: '0.7rem', fontWeight: 700, textAlign: 'center' }}>
                          #{set.setType}
                        </div>
                        <div className="text-grey-var" style={{ fontSize: '0.68rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {set.previous}
                        </div>
                        <div>
                          <input
                            type="text"
                            className="figma-set-input"
                            value={set.durationValue || ''}
                            onChange={(e) => handleSetDurationChange(ex.id, set.id, e.target.value)}
                            placeholder="Time"
                          />
                        </div>
                        <div>
                          <button
                            className={`figma-set-check ${set.completed ? 'completed' : ''}`}
                            onClick={() => handleToggleSetCheck(ex.id, set.id)}
                            title="Toggle Set Completion"
                          >
                            <IconCheck size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Standard Weight & Reps Layout for Loaded Mobility & Strength (LBS)
                  return (
                    <div key={set.id} className={`figma-set-grid-strength ${set.completed ? 'completed' : ''}`}>
                      <div className="text-grey-var" style={{ fontSize: '0.7rem', fontWeight: 700, textAlign: 'center' }}>
                        #{set.setType}
                      </div>
                      <div className="text-grey-var" style={{ fontSize: '0.68rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {set.previous}
                      </div>
                      <div>
                        <input
                          type="number"
                          className="figma-set-input"
                          value={set.weightLbs}
                          onChange={(e) => handleSetWeightChange(ex.id, set.id, Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          className="figma-set-input"
                          value={set.reps}
                          onChange={(e) => handleSetRepsChange(ex.id, set.id, Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <button
                          className={`figma-set-check ${set.completed ? 'completed' : ''}`}
                          onClick={() => handleToggleSetCheck(ex.id, set.id)}
                          title="Toggle Set Completion"
                        >
                          <IconCheck size={12} color={set.completed ? '#FFFFFF' : 'currentColor'} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* 3. CLEAN RESULT NOTES CARD */}
      <div className="figma-tracker-card">
        <h3 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '8px' }}>
          Workout Notes & Reflection
        </h3>

        <div>
          <label className="text-grey-var" style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            Notes / RPE / Subjective Feel:
          </label>
          <input
            className="figma-set-input"
            style={{ width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: '0.75rem', fontWeight: 400 }}
            placeholder="e.g. ACL & meniscus felt 100% protected, VMO burn on tib raises..."
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '0.74rem', color: 'var(--figma-cyan)', fontWeight: 700, marginTop: '8px' }}>
          {statusMessage || (isAlreadySubmitted ? '✓ Session Saved (Tap below to update)' : 'Ready to Submit')}
        </div>

        <button className="figma-btn-finish" onClick={handleSubmitWorkout}>
          {isAlreadySubmitted ? 'Update Workout' : 'Finish Workout'}
        </button>
      </div>
    </div>
  );
};
