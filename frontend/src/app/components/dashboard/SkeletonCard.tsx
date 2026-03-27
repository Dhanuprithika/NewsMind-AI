import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse flex flex-col">
      <div className="h-44 bg-gray-200 shrink-0" />
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <div className="h-1.5 bg-gray-200 rounded-full w-20" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-3 bg-gray-100 rounded w-16" />
        </div>
        <div className="h-8 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonNewsRow() {
  return (
    <div className="flex gap-4 p-4 border-b border-gray-100 animate-pulse">
      <div className="w-6 h-6 bg-gray-100 rounded shrink-0 mt-1" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded-full w-16" />
          <div className="h-3 bg-gray-100 rounded w-12" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-32" />
      </div>
      <div className="flex flex-col items-end justify-between gap-2 shrink-0">
        <div className="w-7 h-7 bg-gray-100 rounded-full" />
        <div className="w-6 h-6 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonCategoryCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      <div className="h-36 bg-gray-200" />
      <div className="p-3.5 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-full" />
        <div className="h-3.5 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="w-5 h-5 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}
