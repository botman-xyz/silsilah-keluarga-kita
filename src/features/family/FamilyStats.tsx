import React from 'react';
import { Member } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Users, Baby, Heart, Calendar, TrendingUp, History, Layers } from 'lucide-react';
import { calculateAge } from '../../lib/utils';

interface FamilyStatsProps {
  members: Member[];
}

export default function FamilyStats({ members }: FamilyStatsProps) {
  // Gender Data
  const genderData = [
    { name: 'Pria', value: members.filter(m => m.gender === 'male').length, color: '#3b82f6' },
    { name: 'Wanita', value: members.filter(m => m.gender === 'female').length, color: '#ec4899' },
    { name: 'Lainnya', value: members.filter(m => m.gender === 'other').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const ages = members.map(m => calculateAge(m.birthDate)).filter(a => a !== null) as number[];
  const ageGroups = [
    { name: '0-12', value: ages.filter(a => a <= 12).length },
    { name: '13-19', value: ages.filter(a => a > 12 && a <= 19).length },
    { name: '20-39', value: ages.filter(a => a > 19 && a <= 39).length },
    { name: '40-59', value: ages.filter(a => a > 39 && a <= 59).length },
    { name: '60+', value: ages.filter(a => a >= 60).length },
  ].filter(g => g.value > 0);

  // Upcoming Birthdays (Next 30 days)
  const getUpcomingBirthdays = () => {
    const today = new Date();
    return members
      .filter(m => m.birthDate)
      .map(m => {
        const bday = new Date(m.birthDate!);
        const nextBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
        if (nextBday < today) nextBday.setFullYear(today.getFullYear() + 1);
        const diff = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { ...m, daysUntil: diff };
      })
      .filter(m => m.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const upcoming = getUpcomingBirthdays();

  // Births per Decade Data
  const getDecadeData = () => {
    const decades: { [key: string]: number } = {};
    members.forEach(m => {
      if (m.birthDate) {
        const year = new Date(m.birthDate).getFullYear();
        const decade = Math.floor(year / 10) * 10;
        const label = `${decade}s`;
        decades[label] = (decades[label] || 0) + 1;
      }
    });
    return Object.keys(decades)
      .sort()
      .map(label => ({ name: label, value: decades[label] }));
  };

  const decadeData = getDecadeData();

  // Generation Distribution Data
  const getGenerationData = () => {
    const genMap = new Map<string, number>();
    
    // Find roots (members without parents in the list)
    const memberIds = new Set(members.map(m => m.id));
    const roots = members.filter(m => 
      (!m.fatherId || !memberIds.has(m.fatherId)) && 
      (!m.motherId || !memberIds.has(m.motherId))
    );

    const assignGen = (memberId: string, level: number) => {
      if (genMap.has(memberId) && genMap.get(memberId)! >= level) return;
      genMap.set(memberId, level);
      const children = members.filter(m => m.fatherId === memberId || m.motherId === memberId);
      children.forEach(c => assignGen(c.id, level + 1));
    };

    roots.forEach(r => assignGen(r.id, 1));

    const counts: { [key: string]: number } = {};
    genMap.forEach((level) => {
      const label = `Gen ${level}`;
      counts[label] = (counts[label] || 0) + 1;
    });

    return Object.keys(counts)
      .sort()
      .map(label => ({ name: label, value: counts[label] }));
  };

  const genData = getGenerationData();

  // Marital Status Data
  const maritalData = [
    { name: 'Lajang', value: members.filter(m => m.maritalStatus === 'single' || (!m.maritalStatus && !m.spouseId)).length, color: '#94a3b8' },
    { name: 'Menikah', value: members.filter(m => m.maritalStatus === 'married' || (!m.maritalStatus && m.spouseId)).length, color: '#ef4444' },
    { name: 'Cerai', value: members.filter(m => m.maritalStatus === 'divorced').length, color: '#f59e0b' },
    { name: 'Janda/Duda', value: members.filter(m => m.maritalStatus === 'widowed').length, color: '#6366f1' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-24 min-h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />} 
          label="Total Anggota" 
          value={members.length} 
          sub="Orang"
        />
        <StatCard 
          icon={<Baby className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />} 
          label="Lahir Bulan Ini" 
          value={members.filter(m => {
            if (!m.birthDate) return false;
            return new Date(m.birthDate).getMonth() === new Date().getMonth();
          }).length} 
          sub="Anggota"
        />
        <StatCard 
          icon={<Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />} 
          label="Sudah Menikah" 
          value={members.filter(m => m.spouseId).length} 
          sub="Orang"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />} 
          label="Rata-rata Usia" 
          value={ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : '-'} 
          sub="Tahun"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Gender Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6">Distribusi Gender</h3>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Groups */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6">Kelompok Usia</h3>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageGroups}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marital Status Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6">Status Perkawinan</h3>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={maritalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {maritalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Births per Decade */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <History className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Tren Kelahiran per Dekade</h3>
          </div>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={decadeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Generation Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Distribusi Generasi</h3>
          </div>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={50} fontSize={10} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming Birthdays */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Ulang Tahun Mendatang (30 Hari)</h3>
        </div>
        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {upcoming.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 shadow-sm text-xs sm:text-sm">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs text-slate-500">{m.name}</div>
                    <div className="text-[10px] sm:text-xs text-slate-500">
                      {m.birthDate ? `${new Date(m.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} (${calculateAge(m.birthDate)} tahun)` : 'Tanggal lahir tidak diketahui'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] sm:text-xs font-bold text-blue-600">{m.daysUntil} Hari lagi</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider">H- {m.daysUntil}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            Tidak ada ulang tahun dalam 30 hari ke depan.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string | number, sub: string }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900">{value}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{sub}</span>
        </div>
      </div>
    </div>
  );
}
