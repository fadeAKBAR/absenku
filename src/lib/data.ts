import type { Student, Category, Rating } from './types';

let students: Student[] = [
  { id: '1', name: 'Budi Hartono', createdAt: Date.now() },
  { id: '2', name: 'Citra Lestari', createdAt: Date.now() },
  { id: '3', name: 'Ahmad Dahlan', createdAt: Date.now() },
  { id: '4', name: 'Dewi Sartika', createdAt: Date.now() },
  { id: '5', name: 'Eka Wijaya', createdAt: Date.now() },
  { id: '6', name: 'Fitriani', createdAt: Date.now() },
];

let categories: Category[] = [
  { id: 'cat1', name: 'Kehadiran', createdAt: Date.now() },
  { id: 'cat2', name: 'Kerapihan', createdAt: Date.now() },
  { id: 'cat3', name: 'Partisipasi', createdAt: Date.now() },
];

let ratings: Rating[] = [];

// Simulate some historical data
const today = new Date();
const dates = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(today.getDate() - i);
  return d.toISOString().split('T')[0];
});

students.forEach(student => {
  dates.forEach(date => {
    const shouldHaveRating = Math.random() > 0.2;
    if (shouldHaveRating) {
      const dailyRatings: { [key: string]: number } = {};
      let total = 0;
      let count = 0;
      categories.forEach(cat => {
        const rating = Math.floor(Math.random() * 3) + 3; // a rating between 3-5
        dailyRatings[cat.id] = rating;
        total += rating;
        count++;
      });
      ratings.push({
        id: `${student.id}-${date}`,
        studentId: student.id,
        date,
        ratings: dailyRatings,
        average: total / count,
        createdAt: new Date(date).getTime(),
      });
    }
  });
});


const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Student Management
export const getStudents = async (): Promise<Student[]> => {
  await simulateDelay(100);
  return [...students].sort((a,b) => a.name.localeCompare(b.name));
};

export const addStudent = async (name: string): Promise<Student> => {
  await simulateDelay(200);
  const newStudent: Student = {
    id: String(Date.now()),
    name,
    createdAt: Date.now(),
  };
  students.push(newStudent);
  return newStudent;
};

export const deleteStudent = async (id: string): Promise<void> => {
  await simulateDelay(200);
  students = students.filter(s => s.id !== id);
  ratings = ratings.filter(r => r.studentId !== id);
};

// Category Management
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
};

// Rating Management
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
    return newRating;
};
