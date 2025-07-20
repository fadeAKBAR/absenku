import React from 'react';
import { BookUser, GanttChartSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  onManageStudents: () => void;
  onManageCategories: () => void;
};

export function Header({ onManageStudents, onManageCategories }: HeaderProps) {
  return (
    <header className="bg-card border-b sticky top-0 z-10 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-primary-foreground"
                    >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary">GradeWise</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onManageStudents}>
            <BookUser className="mr-2 h-4 w-4" />
            Manage Students
          </Button>
          <Button variant="outline" onClick={onManageCategories}>
            <GanttChartSquare className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
        </div>
      </div>
    </header>
  );
}
