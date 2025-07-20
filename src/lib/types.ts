
export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string;
  photoUrl?: string;
  address?: string;
  phone?: string;
  parentPhone?: string;
  positionId?: string; // ID of the assigned position
  deviceId?: string; // Unique ID for the registered device
  createdAt: number;
}

export interface Position {
  id: string;
  name: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  isSystem?: boolean; // To identify the "Kehadiran" category
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

export interface PointRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  type: 'award' | 'violation';
  description: string;
  points: number; // can be positive (award) or negative (violation)
  issuedBy: string; // User ID of the teacher
  createdAt: number;
}

export interface Attendance {
    id: string;
    studentId: string;
    date: string; // YYYY-MM-DD
    checkIn: string | null; // ISO string
    checkOut: string | null; // ISO string
    status: 'present' | 'absent' | 'sick' | 'permit' | 'late' | 'no_checkout';
    reason?: string; // Alasan untuk izin atau sakit
    createdAt: number;
}

export interface RecapData {
  studentId: string;
  studentName: string;
  photoUrl?: string;
  parentPhone?: string;
  overallAverage: number;
  totalPoints: number; // New field for accumulated points
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
    role: 'teacher'; // Added for clarity
    createdAt: number;
}

export interface AppSettings {
    schoolName: string;
    schoolLogoUrl: string;
    location: {
        latitude: number;
        longitude: number;
    };
    checkInRadius: number; // in meters
    lateTime: string; // HH:mm
    checkOutTime: string; // HH:mm
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
