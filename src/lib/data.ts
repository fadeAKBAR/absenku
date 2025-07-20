
import type { Student, Category, Rating, User, Attendance } from './types';

// --- In-memory data store for prototype ---
// In a real app, this would be a database.

let users: User[] = [
  { id: 'user1', name: 'Guru Contoh', email: 'guru@sekolah.id', password: 'password', createdAt: Date.now() }
];

let students: Student[] = [];

let categories: Category[] = [];

let ratings: Rating[] = [];

let attendance: Attendance[] = [];

// --- Helper Functions ---

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
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

// --- Data Initialization ---
// This ensures data persists across reloads in the browser.
if (typeof window !== 'undefined') {
  users = loadFromLocalStorage('app_users', users);
  students = loadFromLocalStorage('app_students', students);
  categories = loadFromLocalStorage('app_categories', categories);
  ratings = loadFromLocalStorage('app_ratings', ratings);
  attendance = loadFromLocalStorage('app_attendance', attendance);
}


// --- User Management ---
export const getUsers = async (): Promise<User[]> => {
  await simulateDelay(50);
  return [...users].sort((a,b) => a.name.localeCompare(b.name));
};

export const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  await simulateDelay(200);
  const newUser: User = {
    ...userData,
    id: `user${Date.now()}`,
    createdAt: Date.now(),
  };
  users.push(newUser);
  saveToLocalStorage('app_users', users);
  return newUser;
};

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

export const addStudent = async (data: { name: string; photoUrl?: string }): Promise<Student> => {
  await simulateDelay(200);
  const newStudent: Student = {
    id: String(Date.now()),
    name: data.name,
    photoUrl: data.photoUrl,
    createdAt: Date.now(),
  };
  students.push(newStudent);
  saveToLocalStorage('app_students', students);
  return newStudent;
};

export const updateStudent = async (id: string, data: { name: string; photoUrl?: string }): Promise<Student> => {
    await simulateDelay(200);
    let studentToUpdate = students.find(s => s.id === id);
    if (!studentToUpdate) {
        throw new Error("Student not found");
    }
    studentToUpdate.name = data.name;
    studentToUpdate.photoUrl = data.photoUrl;
    saveToLocalStorage('app_students', students);
    return studentToUpdate;
}


export const deleteStudent = async (id: string): Promise<void> => {
  await simulateDelay(200);
  students = students.filter(s => s.id !== id);
  ratings = ratings.filter(r => r.studentId !== id);
  attendance = attendance.filter(a => a.studentId !== id);
  saveToLocalStorage('app_students', students);
  saveToLocalStorage('app_ratings', ratings);
  saveToLocalStorage('app_attendance', attendance);
};

// --- Category Management ---
export const getCategories = async (): Promise<Category[]> => {
  await simulateDelay(100);
  return [...categories].sort((a,b) => a.name.localeCompare(b.name));
};

export const addCategory = async (name: string): Promise<Category> => {
  await simulateDelay(200);
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

export const saveRating = async (ratingData: Omit<Rating, 'id' | 'createdAt'>): Promise<Rating> => {
    await simulateDelay(300);
    const existingIndex = ratings.findIndex(r => r.studentId === ratingData.studentId && r.date === ratingData.date);
    const newRating: Rating = {
      ...ratingData,
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

// --- Attendance Management ---
export const getAttendance = async (): Promise<Attendance[]> => {
  await simulateDelay(50);
  return [...attendance];
}

export const saveAttendance = async (date: string, records: { [studentId: string]: 'present' | 'absent' | 'sick' | 'permit' }): Promise<void> => {
  await simulateDelay(300);
  Object.entries(records).forEach(([studentId, status]) => {
    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === date);
    const newRecord: Attendance = {
      id: `${studentId}-${date}`,
      studentId,
      date,
      status,
      createdAt: Date.now(),
    };
    if (existingIndex > -1) {
      attendance[existingIndex] = newRecord;
    } else {
      attendance.push(newRecord);
    }
  });
  saveToLocalStorage('app_attendance', attendance);
}
