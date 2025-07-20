import type { Student, Category, Rating } from './types';

let students: Student[] = [];

let categories: Category[] = [];

let ratings: Rating[] = [];

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
