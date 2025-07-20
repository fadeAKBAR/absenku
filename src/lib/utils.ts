
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type RecapData, type Category } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCsv(data: RecapData[], categories: Category[], period: string) {
  const categoryHeaders = categories.map(c => `${c.name} Avg.`);
  const headers = ['Student Name', 'Total Points', 'Overall Rating Avg.', 'Total Ratings', 'Attendance (%)', ...categoryHeaders];

  const rows = data.map(item => {
    const studentName = `"${item.studentName}"`;
    const totalPoints = item.totalPoints;
    const overallAverage = item.overallAverage.toFixed(2);
    const totalRatings = item.totalRatings;
    const attendance = item.attendancePercentage.toFixed(1);
    
    const categoryValues = categories.map(cat => {
      const catData = item.categoryAverages[cat.id];
      return catData ? catData.average.toFixed(2) : 'N/A';
    });
    
    return [studentName, totalPoints, overallAverage, totalRatings, attendance, ...categoryValues].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.href) {
    URL.revokeObjectURL(link.href);
  }
  link.href = URL.createObjectURL(blob);
  link.download = `gradewise_recap_${period.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
