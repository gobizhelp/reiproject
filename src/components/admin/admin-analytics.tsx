'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, MessageCircle, Heart } from 'lucide-react';

interface TimeSeriesData {
  usersByDay: Record<string, number>;
  propertiesByDay: Record<string, number>;
  messagesByDay: Record<string, number>;
}

function BarChart({
  data,
  label,
  color,
}: {
  data: { date: string; count: number }[];
  label: string;
  color: string;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-muted mb-4">{label}</h3>
      <div className="flex items-end gap-1 h-32">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted">{d.count > 0 ? d.count : ''}</span>
            <div
              className={`w-full rounded-t ${color} transition-all`}
              style={{ height: `${Math.max((d.count / max) * 100, 2)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-muted">{data[0]?.date}</span>
        <span className="text-[10px] text-muted">{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function bucketByDay(dates: string[], days: number): { date: string; count: number }[] {
  const now = new Date();
  const buckets: { date: string; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    buckets.push({ date: label, count: 0 });
  }

  dates.forEach((dateStr) => {
    const d = new Date(dateStr);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
    const idx = days - 1 - diffDays;
    if (idx >= 0 && idx < buckets.length) {
      buckets[idx].count++;
    }
  });

  return buckets;
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [userDates, setUserDates] = useState<string[]>([]);
  const [propertyDates, setPropertyDates] = useState<string[]>([]);
  const [messageDates, setMessageDates] = useState<string[]>([]);
  const [savedDates, setSavedDates] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/admin/metrics');
      // Fetch time series data from a separate call
      const tsRes = await fetch('/api/admin/activity?type=timeseries');
      if (tsRes.ok) {
        const data = await tsRes.json();
        setUserDates(data.userDates || []);
        setPropertyDates(data.propertyDates || []);
        setMessageDates(data.messageDates || []);
        setSavedDates(data.savedDates || []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-card rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-card border border-border rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const days = 30;
  const userChart = bucketByDay(userDates, days);
  const propertyChart = bucketByDay(propertyDates, days);
  const messageChart = bucketByDay(messageDates, days);
  const savedChart = bucketByDay(savedDates, days);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Analytics</h1>
      <p className="text-sm text-muted mb-6">Last 30 days</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BarChart data={userChart} label="New User Signups" color="bg-blue-500" />
        <BarChart data={propertyChart} label="New Properties Created" color="bg-green-500" />
        <BarChart data={messageChart} label="Messages Sent" color="bg-purple-500" />
        <BarChart data={savedChart} label="Listings Saved" color="bg-orange-500" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{userDates.length}</p>
          <p className="text-xs text-muted">Signups (30d)</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Building2 className="w-5 h-5 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{propertyDates.length}</p>
          <p className="text-xs text-muted">Properties (30d)</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <MessageCircle className="w-5 h-5 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{messageDates.length}</p>
          <p className="text-xs text-muted">Messages (30d)</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Heart className="w-5 h-5 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{savedDates.length}</p>
          <p className="text-xs text-muted">Saves (30d)</p>
        </div>
      </div>
    </div>
  );
}
