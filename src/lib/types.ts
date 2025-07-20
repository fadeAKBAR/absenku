

export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string;
  photoUrl?: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  createdAt: number;
}

export interface Rating {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  ratings: { [categoryId: string]: number };
  average: number;
  createdAt: number;
}

export interface Attendance {
    id: string;
    studentId: string;
    date: string; // YYYY-MM-DD
    checkIn: string | null; // ISO string
    checkOut: string | null; // ISO string
    status: 'present' | 'absent' | 'sick' | 'permit' | 'late' | 'no_checkout';
    createdAt: number;
}

export interface RecapData {
  studentId: string;
  studentName: string;
  photoUrl?: string;
  overallAverage: number;
  categoryAverages: { [categoryId: string]: { name: string; average: number } };
  totalRatings: number;
  attendancePercentage: number;
  daysPresent: number;
  dailyAverages: { date: string; average: number }[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Should be handled securely in a real app
    createdAt: number;
}

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  )
}
