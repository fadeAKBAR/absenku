

import type { Student, Category, Rating, User, Attendance, AppSettings, RecapData, Position, PointRecord } from './types';
import { format, set, startOfWeek, differenceInMinutes } from 'date-fns';

// --- In-memory data store for prototype ---
// In a real app, this would be a database.

let users: User[] = [
  { id: 'user1', name: 'Guru Contoh', email: 'guru@sekolah.id', password: 'password', role: 'teacher', createdAt: Date.now() }
];

let students: Student[] = [];

let categories: Category[] = [];

let ratings: Rating[] = [];

let attendance: Attendance[] = [];

let positions: Position[] = [];

let pointRecords: PointRecord[] = [];

let settings: AppSettings = {
    schoolName: "SMKN 3 SOPPENG",
    schoolLogoUrl: "https://www.smkn3soppeng.sch.id/media_library/images/355dfdca525613f8b5e873ec18c6a658.png",
    location: {
        latitude: -4.329808,
        longitude: 120.028856,
    },
    checkInRadius: 50,
    lateTime: "07:00",
    checkOutTime: "15:30"
}

const ATTENDANCE_CATEGORY_ID = "kehadiran-sistem";


// --- Helper Functions ---

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
        const parsedItem = JSON.parse(item);
        // Ensure that if the default is an array, the loaded value is also treated as one.
        if (Array.isArray(defaultValue) && !Array.isArray(parsedItem)) {
            return defaultValue;
        }
        if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
          return { ...defaultValue, ...parsedItem };
        }
        return parsedItem;
    }
    return defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};


const saveToLocalStorage = <T>(key: string, value: T) => {
   if (typeof window === 'undefined') return;
  try {
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

const ensureAttendanceCategory = () => {
    if (!categories.find(c => c.id === ATTENDANCE_CATEGORY_ID)) {
        categories.unshift({
            id: ATTENDANCE_CATEGORY_ID,
            name: "Kehadiran",
            isSystem: true,
            createdAt: 0
        });
        saveToLocalStorage('app_categories', categories);
    }
}

// --- Data Initialization ---
if (typeof window !== 'undefined') {
  users = loadFromLocalStorage('app_users', users);
  students = loadFromLocalStorage('app_students', []);
  categories = loadFromLocalStorage('app_categories', []);
  ratings = loadFromLocalStorage('app_ratings', []);
  attendance = loadFromLocalStorage('app_attendance', []);
  positions = loadFromLocalStorage('app_positions', []);
  pointRecords = loadFromLocalStorage('app_point_records', []);
  settings = loadFromLocalStorage('app_settings', settings);
  ensureAttendanceCategory();
}


// --- Settings Management ---
export const getSettings = async (): Promise<AppSettings> => {
    await simulateDelay(50);
    return settings;
}

export const saveSettings = async (newSettings: AppSettings): Promise<AppSettings> => {
    await simulateDelay(300);
    settings = newSettings;
    saveToLocalStorage('app_settings', settings);
    return settings;
}


// --- User Management ---
export const getUsers = async (): Promise<User[]> => {
  await simulateDelay(50);
  if (!users || !Array.isArray(users)) {
    users = [];
  }
  return [...users].sort((a,b) => a.name.localeCompare(b.name));
};

export const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'role'>): Promise<User> => {
  await simulateDelay(200);
  const newUser: User = {
    ...userData,
    id: `user${Date.now()}`,
    role: 'teacher',
    createdAt: Date.now(),
  };
  users.push(newUser);
  saveToLocalStorage('app_users', users);
  return newUser;
};

export const updateUser = async (id: string, data: Partial<Omit<User, 'id'|'createdAt'| 'role'>>): Promise<User> => {
    await simulateDelay(200);
    let userToUpdate = users.find(u => u.id === id);
    if (!userToUpdate) {
        throw new Error("Pengguna tidak ditemukan");
    }

    Object.assign(userToUpdate, data);
     if (data.password && data.password.trim() === "") {
        delete userToUpdate.password;
    } else if (data.password) {
        userToUpdate.password = data.password;
    }

    saveToLocalStorage('app_users', users);
    return userToUpdate;
}


export const deleteUser = async (id: string): Promise<void> => {
  await simulateDelay(200);
  users = users.filter(u => u.id !== id);
  saveToLocalStorage('app_users', users);
};


// --- Student Management ---
export const getStudents = async (): Promise<Student[]> => {
  await simulateDelay(100);
  return [...students].sort((a,b) => a.name.localeCompare(b.name));
};

export const addStudent = async (data: Omit<Student, 'id' | 'createdAt'>): Promise<Student> => {
  await simulateDelay(200);
  if (students.some(s => s.email === data.email)) {
    throw new Error("Email siswa sudah terdaftar.");
  }
  const newStudent: Student = {
    id: String(Date.now()),
    ...data,
    createdAt: Date.now(),
  };
  students.push(newStudent);
  saveToLocalStorage('app_students', students);
  return newStudent;
};

export const updateStudent = async (id: string, data: Partial<Omit<Student, 'id' | 'createdAt'>>): Promise<Student> => {
    await simulateDelay(200);
    let studentToUpdate = students.find(s => s.id === id);
    if (!studentToUpdate) {
        throw new Error("Siswa tidak ditemukan");
    }
    
    // Create a new object for the updated student data to avoid direct mutation issues
    const updatedData = { ...studentToUpdate, ...data };

    // If password field is present but empty, it means we don't want to update it.
    if (data.password && data.password.trim() !== "") {
        updatedData.password = data.password;
    } else {
        // Keep the old password if the new one is empty
        updatedData.password = studentToUpdate.password;
    }

    // Find index and replace
    const studentIndex = students.findIndex(s => s.id === id);
    if (studentIndex > -1) {
        students[studentIndex] = updatedData;
    }

    saveToLocalStorage('app_students', students);
    return updatedData;
}


export const deleteStudent = async (id: string): Promise<void> => {
  await simulateDelay(200);
  students = students.filter(s => s.id !== id);
  ratings = ratings.filter(r => r.studentId !== id);
  attendance = attendance.filter(a => a.studentId !== id);
  pointRecords = pointRecords.filter(p => p.studentId !== id);
  saveToLocalStorage('app_students', students);
  saveToLocalStorage('app_ratings', ratings);
  saveToLocalStorage('app_attendance', attendance);
  saveToLocalStorage('app_point_records', pointRecords);
};

export const resetDevice = async (id: string): Promise<void> => {
    await simulateDelay(200);
    let studentToUpdate = students.find(s => s.id === id);
    if (!studentToUpdate) {
        throw new Error("Siswa tidak ditemukan");
    }
    studentToUpdate.deviceId = undefined;
    saveToLocalStorage('app_students', students);
};

// --- Position Management ---
export const getPositions = async (): Promise<Position[]> => {
    await simulateDelay(50);
    return [...positions].sort((a, b) => a.name.localeCompare(b.name));
};

export const addPosition = async (name: string): Promise<Position> => {
    await simulateDelay(200);
    const newPosition: Position = {
        id: `pos${Date.now()}`,
        name,
        createdAt: Date.now(),
    };
    positions.push(newPosition);
    saveToLocalStorage('app_positions', positions);
    return newPosition;
};

export const updatePosition = async (id: string, name: string): Promise<Position> => {
    await simulateDelay(200);
    let positionToUpdate = positions.find(p => p.id === id);
    if (!positionToUpdate) {
        throw new Error("Jabatan tidak ditemukan");
    }
    positionToUpdate.name = name;
    saveToLocalStorage('app_positions', positions);
    return positionToUpdate;
};

export const deletePosition = async (id: string): Promise<void> => {
    await simulateDelay(200);
    positions = positions.filter(p => p.id !== id);
    // Remove this position from all students
    students.forEach(student => {
        if (student.positionId === id) {
            student.positionId = undefined;
        }
    });
    saveToLocalStorage('app_positions', positions);
    saveToLocalStorage('app_students', students);
};


// --- Category Management ---
export const getCategories = async (): Promise<Category[]> => {
  await simulateDelay(100);
  ensureAttendanceCategory();
  return [...categories].sort((a,b) => a.name.localeCompare(b.name));
};

export const addCategory = async (name: string): Promise<Category> => {
  await simulateDelay(200);
  if (name.toLowerCase() === 'kehadiran') {
    throw new Error("Kategori 'Kehadiran' adalah kategori sistem dan tidak dapat ditambahkan secara manual.");
  }
  const newCategory: Category = {
    id: `cat${Date.now()}`,
    name,
    createdAt: Date.now(),
  };
  categories.push(newCategory);
  saveToLocalStorage('app_categories', categories);
  return newCategory;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await simulateDelay(200);
  const categoryToDelete = categories.find(c => c.id === id);
  if (categoryToDelete?.isSystem) {
      throw new Error("Kategori sistem tidak dapat dihapus.");
  }

  categories = categories.filter(c => c.id !== id);
  // Also remove this category from all ratings
  ratings.forEach(rating => {
    if (rating.ratings[id]) {
      delete rating.ratings[id];
      const newTotal = Object.values(rating.ratings).reduce((sum, r) => sum + r, 0);
      const newCount = Object.keys(rating.ratings).length;
      rating.average = newCount > 0 ? newTotal / newCount : 0;
    }
  });
  saveToLocalStorage('app_categories', categories);
  saveToLocalStorage('app_ratings', ratings);
};

// --- Rating Management ---
export const getRatings = async (): Promise<Rating[]> => {
    await simulateDelay(100);
    return [...ratings];
};

const calculateAttendanceRating = (date: string, studentId: string): number | null => {
    const studentAttendance = attendance.find(a => a.studentId === studentId && a.date === date);

    if (!studentAttendance || !studentAttendance.checkIn) {
        // Absent or no check-in yet, so no rating is applicable.
        return null;
    }

    if (studentAttendance.status === 'present') {
        return 5;
    }

    if (studentAttendance.status === 'late') {
        const checkInTime = new Date(studentAttendance.checkIn);
        const [h, m] = settings.lateTime.split(':').map(Number);
        const lateTimeThreshold = set(checkInTime, { hours: h, minutes: m, seconds: 0, milliseconds: 0 });

        const minutesLate = differenceInMinutes(checkInTime, lateTimeThreshold);

        if (minutesLate <= 10) return 4;
        if (minutesLate <= 30) return 3;
        return 1;
    }
    
    // For sick/permit, maybe a neutral score? Let's give 5 for now as they are excused.
    if (studentAttendance.status === 'sick' || studentAttendance.status === 'permit') {
        return 5;
    }

    return 0; // Fallback, e.g. for 'no_checkout' status
}

export const saveRating = async (ratingData: Omit<Rating, 'id' | 'createdAt' | 'average'>): Promise<Rating> => {
    await simulateDelay(300);
    
    const attendanceRating = calculateAttendanceRating(ratingData.date, ratingData.studentId);
    const existingIndex = ratings.findIndex(r => r.studentId === ratingData.studentId && r.date === ratingData.date);

    let finalRatings: { [categoryId: string]: number } = { ...ratingData.ratings };

    if (existingIndex > -1) {
        // If updating, merge with existing manual ratings
        finalRatings = { ...ratings[existingIndex].ratings, ...ratingData.ratings };
    }
    
    if (attendanceRating !== null) {
        finalRatings[ATTENDANCE_CATEGORY_ID] = attendanceRating;
    }
    
    const ratedValues = Object.values(finalRatings).filter(r => r !== undefined && r !== null);
    const average = ratedValues.length > 0 ? ratedValues.reduce((acc, r) => acc + r, 0) / ratedValues.length : 0;

    const newRating: Rating = {
      ...ratingData,
      ratings: finalRatings,
      average: average,
      id: `${ratingData.studentId}-${ratingData.date}`,
      createdAt: new Date(ratingData.date).getTime(),
    }

    if (existingIndex > -1) {
        ratings[existingIndex] = newRating;
    } else {
        ratings.push(newRating);
    }
    saveToLocalStorage('app_ratings', ratings);
    return newRating;
};

// --- Point Record Management ---
export const getPointRecords = async (): Promise<PointRecord[]> => {
  await simulateDelay(50);
  return [...pointRecords];
}

export const getPointRecordsForStudent = async (studentId: string): Promise<PointRecord[]> => {
  await simulateDelay(50);
  return pointRecords.filter(p => p.studentId === studentId);
}

export const addPointRecord = async (data: Omit<PointRecord, 'id' | 'createdAt'>): Promise<PointRecord> => {
  await simulateDelay(200);
  const newRecord: PointRecord = {
    ...data,
    id: `pr-${Date.now()}`,
    createdAt: Date.now(),
  };
  pointRecords.push(newRecord);
  saveToLocalStorage('app_point_records', pointRecords);

  // Here we can add a trigger for notifications in the future.
  // For now, just save the record.

  return newRecord;
}


// --- Attendance Management ---
export const getAttendance = async (): Promise<Attendance[]> => {
  await simulateDelay(50);
  // Logic to mark 'no_checkout' for past days
  const todayString = format(new Date(), 'yyyy-MM-dd');
  attendance.forEach(att => {
      if (att.date < todayString && att.checkIn && !att.checkOut && att.status !== 'no_checkout' && att.status !== 'absent' && att.status !== 'sick' && att.status !== 'permit' ) {
          att.status = 'no_checkout';
      }
  });
  saveToLocalStorage('app_attendance', attendance);
  return [...attendance];
}

export const getAttendanceForStudent = async(studentId: string): Promise<Attendance[]> => {
  await simulateDelay(50);
  // This logic should also be here to ensure student sees the most updated status
  const todayString = format(new Date(), 'yyyy-MM-dd');
  attendance.forEach(att => {
      if (att.studentId === studentId && att.date < todayString && att.checkIn && !att.checkOut && att.status !== 'no_checkout' && att.status !== 'absent' && att.status !== 'sick' && att.status !== 'permit') {
          att.status = 'no_checkout';
      }
  });
  return attendance.filter(a => a.studentId === studentId);
}

const saveAttendanceRecord = (studentId: string, date: string, status: Attendance['status'], details: Partial<Omit<Attendance, 'id' | 'studentId' | 'date' | 'status' | 'createdAt'>> = {}) => {
    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === date);
    
    if (existingIndex > -1) {
        const existingRecord = attendance[existingIndex];
        // Teacher override
        if (['sick', 'permit', 'absent'].includes(status) && !details.checkIn) {
            existingRecord.status = status;
            existingRecord.checkIn = null;
            existingRecord.checkOut = null;
            existingRecord.reason = details.reason;
        } else { // Student action
            Object.assign(existingRecord, details);
            existingRecord.status = status;
        }
    } else {
      const newRecord: Attendance = {
        id: `${studentId}-${date}`,
        studentId,
        date,
        checkIn: details.checkIn || null,
        checkOut: details.checkOut || null,
        reason: details.reason,
        status,
        createdAt: Date.now(),
      };
      attendance.push(newRecord);
    }
}

export const checkInStudent = async (studentId: string, checkInTime: Date, deviceId: string): Promise<void> => {
    await simulateDelay(300);
    const dateString = format(checkInTime, 'yyyy-MM-dd');
    
    // Device validation logic
    const student = students.find(s => s.id === studentId);
    if (!student) {
        throw new Error("Siswa tidak ditemukan.");
    }

    if (!student.deviceId) {
        // First check-in, register device
        student.deviceId = deviceId;
        saveToLocalStorage('app_students', students);
    } else if (student.deviceId !== deviceId) {
        // Device mismatch
        throw new Error("Perangkat tidak terdaftar. Silakan check-in menggunakan perangkat yang pertama kali Anda gunakan, atau hubungi guru untuk mereset perangkat Anda.");
    }
    
    const [h, m] = settings.lateTime.split(':').map(Number);
    const lateTime = set(new Date(checkInTime), { hours: h, minutes: m, seconds: 0, milliseconds: 0 });

    const status = checkInTime > lateTime ? 'late' : 'present';

    // 1. Save the attendance record first
    saveAttendanceRecord(studentId, dateString, status, { checkIn: checkInTime.toISOString() });
    saveToLocalStorage('app_attendance', attendance);

    // 2. Automatically create/update a rating with just the attendance score
    await saveRating({
        studentId: studentId,
        date: dateString,
        ratings: {}, // No manual ratings yet
    });
}

export const reportAbsence = async (studentId: string, status: 'sick' | 'permit', reason: string): Promise<void> => {
    await simulateDelay(300);
    const dateString = format(new Date(), 'yyyy-MM-dd');
    saveAttendanceRecord(studentId, dateString, status, { reason });
    saveToLocalStorage('app_attendance', attendance);
};


export const checkOutStudent = async (studentId: string, checkOutTime: Date): Promise<void> => {
    await simulateDelay(300);
    const dateString = format(checkOutTime, 'yyyy-MM-dd');
    const existingRecord = attendance.find(a => a.studentId === studentId && a.date === dateString);
    if (existingRecord) {
        saveAttendanceRecord(studentId, dateString, existingRecord.status, { checkOut: checkOutTime.toISOString() });
        saveToLocalStorage('app_attendance', attendance);
    }
}


export const saveAttendance = async (date: string, records: { [studentId: string]: Attendance['status'] }): Promise<void> => {
  await simulateDelay(300);
  Object.entries(records).forEach(([studentId, status]) => {
     // Don't overwrite student's own report unless it's to mark as absent
     const existingRecord = attendance.find(a => a.studentId === studentId && a.date === date);
     if (!existingRecord || (existingRecord && !['sick', 'permit'].includes(existingRecord.status))) {
        saveAttendanceRecord(studentId, date, status);
     }
  });
  saveToLocalStorage('app_attendance', attendance);
}

// --- Leaderboard Data ---
export const getWeeklyLeaderboard = async(): Promise<RecapData[]> => {
    await simulateDelay(200);
    const now = new Date();
    const startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const startDateString = format(startDate, 'yyyy-MM-dd');

    const weeklyRatings = ratings.filter(r => r.date >= startDateString);
    const weeklyPoints = pointRecords.filter(p => p.date >= startDateString);

    const weeklyRecap = students.map(student => {
        const studentRatings = weeklyRatings.filter(r => r.studentId === student.id);
        const totalRatings = studentRatings.length;
        const overallAverage = totalRatings > 0 
          ? studentRatings.reduce((sum, r) => sum + r.average, 0) / totalRatings 
          : 0;
        
        const totalPoints = weeklyPoints
          .filter(p => p.studentId === student.id)
          .reduce((sum, p) => sum + p.points, 0);
        
        return {
          studentId: student.id,
          studentName: student.name,
          photoUrl: student.photoUrl,
          overallAverage,
          totalPoints,
          totalRatings,
          // Add dummy values for other RecapData fields that aren't needed here
          categoryAverages: {},
          attendancePercentage: 0,
          daysPresent: 0,
          dailyAverages: []
        };
    }).filter(s => s.totalRatings > 0 || s.totalPoints !== 0).sort((a,b) => (b.overallAverage + b.totalPoints) - (a.overallAverage + a.totalPoints));
    
    return weeklyRecap;
}
