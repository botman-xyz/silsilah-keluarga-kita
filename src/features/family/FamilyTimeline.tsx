import React from 'react';
import { Member } from '../../types';
import { Calendar, Baby, Cross, Heart } from 'lucide-react';

interface FamilyTimelineProps {
  members: Member[];
}

export default function FamilyTimeline({ members }: FamilyTimelineProps) {
  const events = members.flatMap(m => {
    const memberEvents = [];
    if (m.birthDate) {
      memberEvents.push({
        date: new Date(m.birthDate),
        type: 'birth',
        member: m,
        label: `Kelahiran ${m.name}`
      });
    }
    if (m.deathDate) {
      memberEvents.push({
        date: new Date(m.deathDate),
        type: 'death',
        member: m,
        label: `Wafatnya ${m.name}`
      });
    }
    return memberEvents;
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Calendar className="w-12 h-12 mb-4 opacity-20" />
        <p>Belum ada data tanggal lahir atau wafat untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="relative border-l-2 border-slate-100 ml-2 sm:ml-4 space-y-8 sm:space-y-12 pb-12">
        {events.map((event, index) => (
          <div key={index} className="relative pl-6 sm:pl-8">
            {/* Timeline Dot */}
            <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
              event.type === 'birth' ? 'bg-blue-500' : 'bg-slate-500'
            }`}>
              {event.type === 'birth' ? (
                <Baby className="w-2 h-2 text-white" />
              ) : (
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </div>

            {/* Event Content */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-widest">
                  {event.date.getFullYear()}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                  {event.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">{event.label}</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${event.member.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'}`} />
                <span className="text-xs sm:text-sm text-slate-500 font-medium">{event.member.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
