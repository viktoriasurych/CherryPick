import { useState, useEffect } from 'react';
import { getDaysInMonth, MONTHS } from '../../utils/formatters'; 

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

        if (val.length > 4) val = val.slice(0, 4);
        if (val.length === 4 && parseInt(val) > currentYear) val = currentYear.toString();
        
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
        if (day > maxDays) { 
            newDay = ''; 
            setDay(''); 
        }
        updateParent(year, val, newDay);
    };

    const handleDayChange = (e) => {
        const val = e.target.value;
        setDay(val);
        updateParent(year, month, val);
    };

    const maxDays = getDaysInMonth(year, month);
    const daysOptions = Array.from({ length: maxDays }, (_, i) => i + 1);

    return (
        <div className="mb-4 w-full font-mono text-left text-xs">
            <style>{`
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; margin: 0; 
                }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>

            <label className="block text-[10px] font-bold text-muted mb-1.5 uppercase tracking-[0.2em]">
                {label}
            </label>
            
            <div className={`grid grid-cols-[80px_1fr_60px] gap-2 p-1 border rounded-sm transition-colors ${error ? 'border-blood bg-blood/5' : 'border-transparent'}`}>
                
                <input
                    type="number"
                    placeholder="Year"
                    value={year}
                    onChange={handleYearChange}
                    min="1900"
                    max={new Date().getFullYear()} 
                    className={`w-full bg-void border border-border rounded-sm p-2 text-bone focus:border-blood outline-none text-center transition-colors placeholder-muted/30 ${!year && 'border-dashed border-border/50'}`}
                />

                <select
                    value={month}
                    onChange={handleMonthChange}
                    disabled={!year || String(year).length < 4}
                    className={`w-full bg-void border border-border rounded-sm p-2 text-bone focus:border-blood outline-none cursor-pointer appearance-none transition-colors
                        ${(!year || String(year).length < 4) ? 'opacity-30 cursor-not-allowed border-dashed' : ''}
                    `}
                >
                    <option value="">Month</option>
                    {MONTHS.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>

                <select
                    value={day}
                    onChange={handleDayChange}
                    disabled={!month}
                    className={`w-full bg-void border border-border rounded-sm p-2 text-bone focus:border-blood outline-none cursor-pointer appearance-none transition-colors
                        ${!month ? 'opacity-30 cursor-not-allowed border-dashed' : ''}
                    `}
                >
                    <option value="">Day</option>
                    {daysOptions.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>
             {error && <span className="text-blood text-[10px] mt-1 block uppercase animate-pulse font-bold">{error}</span>}
        </div>
    );
};

export default FuzzyDateInput;