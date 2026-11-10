import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Volume2, 
  VolumeX, 
  Settings2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { novaVoice, SpeechSettings, VoicePersona } from '../utils/speech';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  speechSettings: SpeechSettings;
  onUpdateSpeechSettings: (settings: SpeechSettings) => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  speechSettings,
  onUpdateSpeechSettings,
}) => {
  const [sessionState, setSessionState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const [novaTranscript, setNovaTranscript] = useState('مرحباً بك! أنا Cantrix Voice، كيف يمكنني مساعدتك اليوم؟');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(speechSettings.persona);
  const [speed, setSpeed] = useState<number>(speechSettings.rate);
  const [autoLoop, setAutoLoop] = useState(true);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      novaVoice.stop();
      novaVoice.stopListening();
    };
  }, []);

  // When modal opens, speak greeting and then start listening
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSessionState('speaking');
      novaVoice.speak(
        novaTranscript,
        speechSettings,
        'ar-SA',
        () => setSessionState('speaking'),
        () => {
          if (isMountedRef.current) {
            startListeningCycle();
          }
        },
        () => {
          if (isMountedRef.current) {
            startListeningCycle();
          }
        }
      );
    } else {
      novaVoice.stop();
      novaVoice.stopListening();
      setSessionState('idle');
    }
  }, [isOpen]);

  const startListeningCycle = () => {
    setErrorMsg(null);
    setUserTranscript('');
    setSessionState('listening');

    const success = novaVoice.startListening(
      (transcript, isFinal) => {
        setUserTranscript(transcript);
        if (isFinal) {
          handleSendVoiceQuery(transcript);
        }
      },
      (error) => {
        setErrorMsg(error);
        setSessionState('idle');
      },
      () => {
        // Recognition stopped
      }
    );

    if (!success) {
      setSessionState('idle');
    }
  };

  const handleSendVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    novaVoice.stopListening();
    setSessionState('thinking');

    try {
      const res = await fetch('/api/cantrix/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: queryText }],
          mode: 'fast',
          customPrompt: 'أنت في وضع المحادثة الصوتية الحية المباشرة (Cantrix Voice). اجعل إجابتك موجزة، طبيعية، ومركزة جداً لتكون ممتعة وسلسة عند الاستماع إليها.',
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'عذراً، لم أتمكن من الإجابة حالياً.';

      setNovaTranscript(reply);
      setSessionState('speaking');

      novaVoice.speak(
        reply,
        { ...speechSettings, persona: selectedPersona, rate: speed },
        undefined,
        () => setSessionState('speaking'),
        () => {
          if (isMountedRef.current && autoLoop) {
            // Auto continue conversation
            setTimeout(() => {
              if (isMountedRef.current) startListeningCycle();
            }, 600);
          } else {
            setSessionState('idle');
          }
        },
        () => {
          setSessionState('idle');
        }
      );
    } catch (err: any) {
      setErrorMsg('تعذر الاتصال بمحرك كامتريكس AI: ' + err.message);
      setSessionState('idle');
    }
  };

  const handlePersonaChange = (persona: VoicePersona) => {
    setSelectedPersona(persona);
    onUpdateSpeechSettings({ ...speechSettings, persona, rate: speed });
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    onUpdateSpeechSettings({ ...speechSettings, persona: selectedPersona, rate: newSpeed });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 text-white animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/30">
            Z
          </div>
          <div>
            <h2 className="font-bold text-base tracking-tight flex items-center gap-1.5">
              <span>Cantrix Voice</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                صوت حي
              </span>
            </h2>
            <p className="text-xs text-slate-400">تحدث بحرية بأي لغة أو بالدارجة</p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="إغلاق المحادثة الصوتية"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Interactive Sphere & Status */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full my-4">
        {/* Holographic Glowing Sphere */}
        <div className="relative mb-8">
          {/* Animated glow rings */}
          <div
            className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center transition-all duration-700 ${
              sessionState === 'listening'
                ? 'bg-rose-500/20 ring-8 ring-rose-500/30 animate-pulse scale-105'
                : sessionState === 'speaking'
                ? 'bg-indigo-500/20 ring-8 ring-indigo-500/30 animate-pulse scale-105'
                : sessionState === 'thinking'
                ? 'bg-purple-500/20 ring-8 ring-purple-500/30 animate-spin'
                : 'bg-slate-800/40 ring-4 ring-slate-800'
            }`}
          >
            <div
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                sessionState === 'listening'
                  ? 'bg-gradient-to-tr from-rose-600 via-purple-600 to-pink-400 shadow-rose-500/40'
                  : sessionState === 'speaking'
                  ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 shadow-indigo-500/40'
                  : sessionState === 'thinking'
                  ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-400 shadow-purple-500/40'
                  : 'bg-slate-800 shadow-slate-900'
              }`}
            >
              {sessionState === 'listening' ? (
                <Mic className="w-12 h-12 text-white animate-bounce" />
              ) : sessionState === 'speaking' ? (
                <Volume2 className="w-12 h-12 text-white animate-pulse" />
              ) : sessionState === 'thinking' ? (
                <Sparkles className="w-12 h-12 text-white animate-spin" />
              ) : (
                <MicOff className="w-12 h-12 text-slate-400" />
              )}
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="mb-4">
          <span className="text-sm font-semibold tracking-wide uppercase px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            {sessionState === 'listening' && '🎙️ استمع لصوتك الآن... تحدث'}
            {sessionState === 'thinking' && '✨ كامتريكس AI يفكر ويحلل...'}
            {sessionState === 'speaking' && '🔊 كامتريكس AI يتحدث الآن'}
            {sessionState === 'idle' && 'اضغط على الميكروفون لبدء المحادثة'}
          </span>
        </div>

        {/* Live Transcripts */}
        <div className="w-full space-y-3 px-4">
          {userTranscript && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 max-h-24 overflow-y-auto">
              <span className="text-slate-500 block mb-1">أنت:</span>
              <p className="font-medium text-white">{userTranscript}</p>
            </div>
          )}

          {novaTranscript && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 max-h-32 overflow-y-auto leading-relaxed">
              <span className="text-amber-400 block mb-1 font-bold">كامتريكس AI:</span>
              <p>{novaTranscript}</p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 max-w-md">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="max-w-2xl mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        {/* Personas Selector */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-400 shrink-0">نبرة الصوت:</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: 'female', label: 'امرأة' },
              { id: 'male', label: 'رجل' },
              { id: 'calm', label: 'هادئ' },
              { id: 'energetic', label: 'حماسي' },
              { id: 'narrative', label: 'سردي' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePersonaChange(p.id as VoicePersona)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedPersona === p.id
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Slider & Action Buttons */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">سرعة القراءة:</span>
            <div className="flex items-center gap-1">
              {[0.75, 1.0, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    speed === s ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (sessionState === 'listening') {
                  novaVoice.stopListening();
                  setSessionState('idle');
                } else {
                  startListeningCycle();
                }
              }}
              className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                sessionState === 'listening'
                  ? 'bg-rose-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {sessionState === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{sessionState === 'listening' ? 'إيقاف الاستماع' : 'ابدأ التحدث'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
