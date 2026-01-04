import { useState, useEffect, useMemo } from 'react';
import { CloudArrowUpIcon, CheckIcon, ClockIcon, TrashIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import Button from '../../ui/Button';
import { formatDigitalTime, toLocalISO } from '../../../utils/formatters';

const SaveFormView = ({ 
    seconds, startTime, endTimeInput, noteForm, addToGallery, previewUrl,
    onDiscard, onSave, onNoteChange, onFileSelect, onRemoveFile, onToggleGallery 
}) => {
    
    const maxPossibleSeconds = useMemo(() => {
        if (!startTime || !endTimeInput) return seconds;
        const start = new Date(startTime).getTime();
        const end = new Date(endTimeInput).getTime();
        const diff = Math.floor((end - start) / 1000);
        return diff > 0 ? diff : seconds;
    }, [startTime, endTimeInput, seconds]);

    const [durationStr, setDurationStr] = useState(formatDigitalTime(seconds));
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        setDurationStr(formatDigitalTime(seconds));
    }, [seconds]);

    const parseDuration = (str) => {
        const parts = str.split(':').map(p => parseInt(p, 10) || 0);
        if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        if (parts.length === 2) return (parts[0] * 60) + parts[1];
        if (parts.length === 1) return parts[0] * 60;
        return seconds;
    };

    const handleBlur = () => {
        let enteredSeconds = parseDuration(durationStr);
        if (enteredSeconds > maxPossibleSeconds) {
            setErrorMsg(`Limit: ${formatDigitalTime(maxPossibleSeconds)}`);
        } else {
            setErrorMsg(null);
        }
        setDurationStr(formatDigitalTime(enteredSeconds));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let finalSeconds = parseDuration(durationStr);

        if (finalSeconds > maxPossibleSeconds) {
            setErrorMsg(`Limit exceeded: max ${formatDigitalTime(maxPossibleSeconds)}`);
            return;
        }
        
        setErrorMsg(null);
        onSave({
            preventDefault: () => {},
            manualDuration: finalSeconds
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-ash/90 backdrop-blur-md border border-border rounded-sm shadow-2xl shadow-black p-6 w-full max-w-md">
            
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4 shrink-0 gap-4 relative">
                
                <div className="w-full relative flex flex-col">
                    <span className="text-[10px] text-muted uppercase tracking-widest mb-1 flex justify-between items-center w-full">
                        <span>Active Time</span>
                        
                        <button 
                            type="button" 
                            onClick={onDiscard} 
                            className="hidden md:flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-red-400 hover:text-red-200 border border-red-900/30 hover:border-red-500/50 px-2 py-1 rounded-sm transition-all bg-red-900/5 hover:bg-red-900/20"
                        >
                            <TrashIcon className="w-3 h-3" />
                            Discard
                        </button>
                    </span>
                    
                    <div className="relative flex items-center w-full mt-1">
                        <ClockIcon className="w-5 h-5 md:w-6 md:h-6 text-blood absolute left-0 pointer-events-none" />
                        
                        <input 
                            type="text"
                            value={durationStr}
                            onChange={(e) => {
                                setDurationStr(e.target.value);
                                if (errorMsg) setErrorMsg(null);
                            }}
                            onBlur={handleBlur}
                            className={`
                                bg-transparent w-full pl-8 py-1
                                text-3xl md:text-4xl font-mono font-bold 
                                outline-none border-b 
                                transition-all placeholder-white/10
                                ${errorMsg 
                                    ? 'text-blood border-blood' 
                                    : 'text-bone border-transparent hover:border-white/30 focus:border-blood'}
                            `}
                            placeholder="00:00:00"
                        />
                    </div>

                    <div className="h-4 mt-1 min-h-4">
                        {errorMsg && (
                            <span className="text-[9px] text-blood flex items-center gap-1 animate-pulse font-bold leading-tight">
                                <ExclamationTriangleIcon className="w-3 h-3 shrink-0"/> 
                                {errorMsg}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="md:hidden flex justify-end -mt-2 mb-4">
                <button 
                    type="button" 
                    onClick={onDiscard} 
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-200 border border-red-900/30 hover:border-red-500/50 px-3 py-1.5 rounded-sm transition-all bg-red-900/5 hover:bg-red-900/20 w-full justify-center"
                >
                    <TrashIcon className="w-3 h-3" />
                    Discard Session
                </button>
            </div>

            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 opacity-60">
                    <div>
                        <label className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1 block">Started At</label>
                        <input 
                            type="datetime-local" 
                            disabled 
                            value={startTime ? toLocalISO(new Date(startTime)) : ''} 
                            className="w-full bg-black/20 border border-white/5 p-2 text-[10px] text-muted font-mono rounded-sm cursor-not-allowed" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-blood uppercase font-bold tracking-wider mb-1 block">Finished At</label>
                        <input 
                            type="datetime-local" 
                            disabled 
                            value={endTimeInput} 
                            className="w-full bg-black/20 border border-white/5 p-2 text-[10px] text-muted font-mono rounded-sm cursor-not-allowed" 
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1 block">Notes</label>
                    <textarea 
                        rows="2" 
                        className="w-full bg-black/20 border border-white/10 focus:border-blood/50 p-3 text-sm text-bone font-sans placeholder-muted/50 outline-none resize-none rounded-sm transition-colors" 
                        value={noteForm.content} 
                        onChange={onNoteChange} 
                        placeholder="What was accomplished?" 
                    />
                </div>

                <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2 block">Photo Evidence</label>
                    {previewUrl ? (
                        <div className="space-y-3">
                            <div className="relative border border-white/10 bg-black/20 aspect-video flex items-center justify-center overflow-hidden rounded-sm group">
                                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                                <button type="button" onClick={onRemoveFile} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-900/80 text-white rounded transition"><XMarkIcon className="w-4 h-4" /></button>
                            </div>

                            <div 
                                onClick={onToggleGallery} 
                                className="flex items-center gap-3 p-3 bg-black/20 border border-white/10 rounded-sm cursor-pointer hover:border-blood/50 hover:bg-black/40 transition-all group"
                            >
                                <div className={`w-4 h-4 border flex items-center justify-center rounded-sm transition-colors ${addToGallery ? 'bg-blood border-blood' : 'border-muted group-hover:border-bone'}`}>
                                    {addToGallery && <CheckIcon className="w-3 h-3 text-white" />}
                                </div>
                                <span className={`text-[10px] uppercase font-bold transition-colors ${addToGallery ? 'text-bone' : 'text-muted group-hover:text-bone'}`}>
                                    Add this evidence to Gallery
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <input type="file" id="file-upload" onChange={onFileSelect} className="hidden" accept="image/*" />
                            <label htmlFor="file-upload" className="flex items-center justify-center gap-2 w-full border border-dashed border-white/20 hover:border-blood hover:bg-white/5 p-4 cursor-pointer transition-all rounded-sm text-muted hover:text-bone h-20 bg-transparent">
                                <CloudArrowUpIcon className="w-5 h-5" />
                                <span className="text-[10px] uppercase font-bold tracking-widest">Attach Photo</span>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 shrink-0">
                <Button 
                    text={errorMsg ? "Fix Timer Error" : "Save Ritual"} 
                    disabled={!!errorMsg}
                    className={`
                        w-full py-3 font-gothic tracking-[0.2em] uppercase text-xs shadow-lg rounded-sm transition-all
                        ${errorMsg 
                            ? 'bg-red-900/20 text-red-400 cursor-not-allowed border border-red-900/50' 
                            : 'bg-blood hover:bg-blood-hover text-white shadow-blood/10'}
                    `} 
                />
            </div>
        </form>
    );
};

export default SaveFormView;