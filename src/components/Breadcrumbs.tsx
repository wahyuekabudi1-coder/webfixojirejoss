import React from 'react';
import { useApp } from '../AppContext';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  page?: string;
  action?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { setPage } = useApp();

  return (
    <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <ol className="flex items-center flex-wrap gap-1.5 text-xs font-medium text-neutral-500">
        <li>
          <button
            onClick={() => setPage('home')}
            className="flex items-center gap-1 hover:text-amber-600 transition-colors cursor-pointer py-1"
          >
            <Home className="h-3.5 w-3.5 text-amber-500" />
            <span>Home</span>
          </button>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-neutral-400 shrink-0" />
              {isLast || (!item.page && !item.action) ? (
                <span className="text-neutral-900 font-bold truncate max-w-[200px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.page) {
                      setPage(item.page as any);
                    }
                  }}
                  className="hover:text-amber-600 transition-colors cursor-pointer py-1 truncate max-w-[150px] sm:max-w-xs"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
