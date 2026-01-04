import { useState, useEffect, useRef, useMemo } from 'react';
import sessionService from '../../services/sessionService';
import quoteService from '../../services/quoteService';

// Views
import StartView from './views/StartView';
import TimerView from './views/TimerView';
import SaveFormView from './views/SaveFormView';
import OracleView from './views/OracleView';

// Utils & Shared
import { toLocalISO, formatDigitalTime } from '../../utils/formatters';
import ConfirmModal from '../shared/ConfirmModal'; 
import PageTitle from '../shared/PageTitle'; 

const SessionTimer = ({ artworkId, artworkTitle, initialSession, onSessionSaved }) => {

    const [status, setStatus] = useState(initialSession ? (initialSession.is_running ? 'RUNNING' : 'PAUSED') : 'IDLE');
    const [seconds, setSeconds] = useState(initialSession ? initialSession.current_total_seconds : 0);
    const [sessionId, setSessionId] = useState(initialSession?.id || null);
    const [startTime, setStartTime] = useState(initialSession ? initialSession.created_at : null);
    const [endTimeInput, setEndTimeInput] = useState('');
    const [isTimeEdited, setIsTimeEdited] = useState(false);
    const [noteForm, setNoteForm] = useState({ content: '', image: null });
    const [addToGallery, setAddToGallery] = useState(false); 
    const [previewUrl, setPreviewUrl] = useState(null);
    
    const [oracleQuote, setOracleQuote] = useState('');
    const [showDiscardModal, setShowDiscardModal] = useState(false);

    const intervalRef = useRef(null);

    useEffect(() => {
        if (status === 'RUNNING') {
            intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [status]);

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    const dynamicTitle = useMemo(() => {
        const timeStr = formatDigitalTime(seconds);
        const titleSuffix = artworkTitle || 'Session';

        switch (status) {
            case 'RUNNING':
                return `${timeStr} | ${titleSuffix}`;
            case 'PAUSED':
                return `[Paused] ${timeStr} | ${titleSuffix}`;
            case 'SAVING':
                return `Saving... | ${titleSuffix}`;
            case 'SHOWING_QUOTE':
                return `Session Complete | ${titleSuffix}`;
            default:
                return titleSuffix;
        }
    }, [status, seconds, artworkTitle]);

    const handleStart = async () => {
        try {
            const data = await sessionService.start(artworkId);
            setSessionId(data.id);
            setSeconds(data.current_total_seconds);
            setStartTime(data.created_at);
            setStatus('RUNNING');
        } catch (e) { console.error(e); } 
    };

    const handleTogglePause = async () => {
        const nextStatus = status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
        setStatus(nextStatus);
        try {
            const data = await sessionService.togglePause();
            setSeconds(data.current_total_seconds);
            setStatus(data.is_running ? 'RUNNING' : 'PAUSED');
        } catch (e) { 
            console.error(e);
            setStatus(status);
        }
    };

    const handleStopRequest = async () => {
        try {
            if (status === 'RUNNING') {
                const data = await sessionService.togglePause();
                setSeconds(data.current_total_seconds);
            }
            setStatus('SAVING');
            setEndTimeInput(toLocalISO(new Date()));
            setIsTimeEdited(false);
        } catch (e) { console.error(e); }
    };

    const handleSave = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        try {
            let finalDuration = (e && typeof e.manualDuration === 'number') 
                ? e.manualDuration 
                : seconds;

            await sessionService.stop({
                sessionId,
                manualDuration: finalDuration,
                content: noteForm.content,
                image: noteForm.image,
                addToGallery
            });

            const quoteData = await quoteService.getRandomQuote();
            setOracleQuote(quoteData.content);
            
            setStatus('SHOWING_QUOTE');
            
            setSeconds(0);
            setNoteForm({ content: '', image: null });
            setPreviewUrl(null);
            setAddToGallery(false);

            if (onSessionSaved) onSessionSaved();

        } catch (err) { console.error(err); }
    };

    const handleDiscardRequest = () => setShowDiscardModal(true);

    const performDiscard = async () => {
        try {
            await sessionService.discard();
            setStatus('IDLE');
            setSeconds(0);
            setStartTime(null);
            setNoteForm({ content: '', image: null });
            setPreviewUrl(null);
            setShowDiscardModal(false); 
        } catch (e) { 
            console.error(e);
            setShowDiscardModal(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNoteForm(prev => ({ ...prev, image: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    let content;
    switch (status) {
        case 'IDLE':
            content = <StartView onStart={handleStart} />;
            break;
        case 'RUNNING':
        case 'PAUSED':
            content = <TimerView status={status} seconds={seconds} onTogglePause={handleTogglePause} onStop={handleStopRequest} />;
            break;
        case 'SAVING':
            content = <SaveFormView 
                seconds={seconds} startTime={startTime} endTimeInput={endTimeInput}
                noteForm={noteForm} addToGallery={addToGallery} previewUrl={previewUrl}
                onDiscard={handleDiscardRequest} 
                onSave={handleSave}
                onEndTimeChange={(e) => { setEndTimeInput(e.target.value); setIsTimeEdited(true); }}
                onNoteChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                onFileSelect={handleFileSelect}
                onRemoveFile={() => { setNoteForm(p => ({...p, image: null})); setPreviewUrl(null); }}
                onToggleGallery={() => setAddToGallery(!addToGallery)}
            />;
            break;
        case 'SHOWING_QUOTE':
            content = <OracleView quote={oracleQuote} onClose={() => { setStatus('IDLE'); setOracleQuote(''); }} />;
            break;
        default:
            content = null;
    }

    return (
        <div className="w-full max-w-md mx-auto min-h-75 flex flex-col justify-center relative transition-all duration-500">
            
            <PageTitle title={dynamicTitle} />

            <div className="w-full relative z-10">
                {content}
            </div>

            <ConfirmModal 
                isOpen={showDiscardModal}
                onClose={() => setShowDiscardModal(false)}
                onConfirm={performDiscard}
                title="Discard Session?"
                message="This will permanently delete the current session progress. It cannot be undone."
                confirmText="Discard"
            />
        </div>
    );
};

export default SessionTimer;