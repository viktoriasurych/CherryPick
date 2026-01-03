import { XMarkIcon, CloudArrowUpIcon, CheckIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/solid';
import Button from '../../ui/Button';
import { formatDigitalTime, toLocalISO } from '../../../utils/formatters';

const SaveFormView = ({ 
    seconds, startTime, endTimeInput, noteForm, addToGallery, previewUrl,
    onDiscard, onSave, onEndTimeChange, onNoteChange, onFileSelect, onRemoveFile, onToggleGallery 
}) => {
    
    return (
        // 👇 ВИКОРИСТАВ ТВІЙ СНІПЕТ: bg-ash/90, border-border, shadow-black
        <form onSubmit={onSave} className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-ash/90 backdrop-blur-md border border-border rounded-sm shadow-2xl shadow-black p-6 w-full max-w-md">
            
            <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4 shrink-0">
                <div>
                    <span className="text-[10px] text-muted uppercase tracking-widest block mb-1">Session Time</span>
                    <div className="text-2xl md:text-3xl font-mono text-bone font-bold flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 md:w-6 md:h-6 text-blood" />
                        {formatDigitalTime(seconds)}
                    </div>
                </div>
                
                <button 
                    type="button" 
                    onClick={onDiscard} 
                    className="
                        flex items-center gap-2 
                        text-[10px] font-bold uppercase tracking-widest 
                        text-red-400 hover:text-red-200 
                        border border-red-900/30 hover:border-red-500/50 
                        px-3 py-1.5 rounded-sm transition-all bg-red-900/5 hover:bg-red-900/20
                    "
                >
                    <TrashIcon className="w-3 h-3" />
                    Discard
                </button>
            </div>

            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1 block">Start</label>
                        <input 
                            type="datetime-local" 
                            disabled 
                            step="1"
                            value={startTime ? toLocalISO(new Date(startTime)) : ''} 
                            className="w-full bg-black/20 border border-white/10 p-3 text-xs text-muted font-mono rounded-sm opacity-80 cursor-not-allowed" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-blood uppercase font-bold tracking-wider mb-1 block">End</label>
                        <input 
                            type="datetime-local" 
                            required 
                            step="1"
                            value={endTimeInput} 
                            min={startTime ? toLocalISO(new Date(startTime)) : ''} 
                            max={toLocalISO(new Date())} 
                            onChange={onEndTimeChange} 
                            className="w-full bg-black/20 border border-blood/30 focus:border-blood p-3 text-xs text-bone font-mono outline-none transition-colors rounded-sm" 
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
                        placeholder="Що було зроблено?" 
                    />
                </div>

                <div>
                    <label className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2 block">Photo Evidence</label>
                    {previewUrl ? (
                        <div className="relative border border-white/10 bg-black/20 aspect-video flex items-center justify-center overflow-hidden rounded-sm group">
                            <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                            <button type="button" onClick={onRemoveFile} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-900/80 text-white rounded transition"><XMarkIcon className="w-4 h-4" /></button>
                            
                            <div onClick={onToggleGallery} className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur px-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-black/90 transition rounded-sm border border-white/10">
                                <div className={`w-4 h-4 border flex items-center justify-center rounded-sm ${addToGallery ? 'bg-blood border-blood' : 'border-muted'}`}>
                                    {addToGallery && <CheckIcon className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-[10px] uppercase font-bold text-bone">Add to Gallery</span>
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
                <Button text="Save Ritual" className="w-full bg-blood hover:bg-blood-hover text-white py-3 font-gothic tracking-[0.2em] uppercase text-xs shadow-lg shadow-blood/10 rounded-sm" />
            </div>
        </form>
    );
};

export default SaveFormView;