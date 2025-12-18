import { useState, useEffect } from 'react';

const FuzzyDateInput = ({ label, value, onChange, error }) => {
    const [year, setYear] = useState(value?.year || '');
    const [month, setMonth] = useState(value?.month || '');
    const [day, setDay] = useState(value?.day || '');

    useEffect(() => {
        setYear(value?.year || '');
        setMonth(value?.month || '');
        setDay(value?.day || '');
    }, [value]);

    const updateParent = (y, m, d) => {
        onChange({
            year: y ? parseInt(y) : null,
            month: m ? parseInt(m) : null,
            day: d ? parseInt(d) : null
        });
    };

    const handleYearChange = (e) => {
        let val = e.target.value;
        const currentYear = new Date().getFullYear();

        // Валідація року: макс 4 цифри, не більше поточного року
        if (val.length > 4) val = val.slice(0, 4);
        if (parseInt(val) > currentYear) val = currentYear.toString();
        if (val < 0) val = ''; // Заборона мінусів

        setYear(val);

        if (!val) {
            setMonth('');
            setDay('');
            updateParent(null, null, null);
        } else {
            updateParent(val, month, day);
        }
    };

    const handleMonthChange = (e) => {
        const val = e.target.value;
        setMonth(val);
        const maxDays = getDaysInMonth(year, val);
        let newDay = day;
        if (day > maxDays) { newDay = ''; setDay(''); }
        updateParent(year, val, newDay);
    };

    const handleDayChange = (e) => {
        const val = e.target.value;
        setDay(val);
        updateParent(year, month, val);
    };

    // Логіка днів
    const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    const getDaysInMonth = (y, m) => {
        if (!m) return 31;
        const mInt = parseInt(m);
        if ([4, 6, 9, 11].includes(mInt)) return 30;
        if (mInt === 2) return isLeapYear(y) ? 29 : 28;
        return 31;
    };

    const maxDays = getDaysInMonth(year, month);
    const daysOptions = Array.from({ length: maxDays }, (_, i) => i + 1);
    const months = [
        { id: 1, name: 'Січ' }, { id: 2, name: 'Лют' }, { id: 3, name: 'Бер' }, // Скорочені назви для економії місця на мобілці
        { id: 4, name: 'Кві' }, { id: 5, name: 'Тра' }, { id: 6, name: 'Чер' },
        { id: 7, name: 'Лип' }, { id: 8, name: 'Сер' }, { id: 9, name: 'Вер' },
        { id: 10, name: 'Жов' }, { id: 11, name: 'Лис' }, { id: 12, name: 'Гру' }
    ];

    return (
        <div className="mb-4 w-full">
            {/* Стилі для приховання спінерів (стрілочок) в інпуті number */}
            <style>{`
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; margin: 0; 
                }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>

            <label className="block text-sm font-medium text-slate-400 mb-1 justify-between">
                <span>{label}</span>
                {error && <span className="text-red-500 text-xs animate-pulse">{error}</span>}
            </label>
            
            {/* 👇 СІТКА ВИПРАВЛЕНА: 
               grid-cols-[70px_1fr_60px] -> Рік фіксовано 70px, День 60px, Місяць забирає решту.
               Це гарантує, що рік не стиснеться в крапку.
            */}
            <div className={`grid grid-cols-[70px_1fr_60px] gap-2 p-1 rounded border ${error ? 'border-red-500 bg-red-900/10' : 'border-transparent'}`}>
                
                {/* 1. РІК */}
                <input
                    type="number"
                    placeholder="Рік"
                    value={year}
                    onChange={handleYearChange}
                    min="1900"
                    max={new Date().getFullYear()} // Максимум поточний рік
                    className={`w-full bg-slate-950 border border-slate-700 rounded p-2 text-bone-200 focus:border-cherry-500 outline-none text-center text-sm ${!year && 'border-dashed border-slate-600'}`}
                />

                {/* 2. МІСЯЦЬ */}
                <select
                    value={month}
                    onChange={handleMonthChange}
                    disabled={!year || String(year).length < 4}
                    className={`w-full bg-slate-950 border border-slate-700 rounded p-2 text-bone-200 focus:border-cherry-500 outline-none text-sm cursor-pointer
                        ${(!year || String(year).length < 4) ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <option value="">Місяць</option>
                    {months.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>

                {/* 3. ДЕНЬ */}
                <select
                    value={day}
                    onChange={handleDayChange}
                    disabled={!month}
                    className={`w-full bg-slate-950 border border-slate-700 rounded p-2 text-bone-200 focus:border-cherry-500 outline-none text-sm cursor-pointer
                        ${!month ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <option value="">Дн</option>
                    {daysOptions.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default FuzzyDateInput;