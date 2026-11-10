/**
 * Nova Voice - Advanced Web Speech System
 * Handles Text-to-Speech (TTS) and Speech-to-Text (STT) with multi-persona voices,
 * natural pitch/speed adjustment, and graceful permission handling.
 */

export type VoicePersona = 'male' | 'female' | 'calm' | 'energetic' | 'narrative';

export interface SpeechSettings {
  rate: number; // 0.75 - 1.5
  pitch: number; // 0.8 - 1.2
  persona: VoicePersona;
  autoPlayReplies: boolean;
}

export const defaultSpeechSettings: SpeechSettings = {
  rate: 1.0,
  pitch: 1.0,
  persona: 'female',
  autoPlayReplies: false,
};

// Singleton Speech Manager
class NovaVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  // Speak text with persona tuning
  public speak(
    text: string,
    settings: SpeechSettings = defaultSpeechSettings,
    lang?: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): boolean {
    if (!this.synth) return false;

    this.stop(); // Stop any currently playing audio

    // Clean markdown formatting characters for natural speech
    const cleanText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, 'رابط إلكتروني')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Auto-detect language if not provided
    const isArabic = /[\u0600-\u06FF]/.test(cleanText);
    utterance.lang = lang || (isArabic ? 'ar-SA' : 'en-US');

    // Tune persona parameters
    let effectivePitch = settings.pitch;
    let effectiveRate = settings.rate;

    switch (settings.persona) {
      case 'male':
        effectivePitch = Math.max(0.6, settings.pitch * 0.85);
        break;
      case 'female':
        effectivePitch = Math.min(1.4, settings.pitch * 1.15);
        break;
      case 'calm':
        effectivePitch = settings.pitch * 0.95;
        effectiveRate = Math.max(0.7, settings.rate * 0.88);
        break;
      case 'energetic':
        effectivePitch = settings.pitch * 1.1;
        effectiveRate = Math.min(1.5, settings.rate * 1.15);
        break;
      case 'narrative':
        effectivePitch = settings.pitch * 0.9;
        effectiveRate = settings.rate * 0.92;
        break;
    }

    utterance.pitch = effectivePitch;
    utterance.rate = effectiveRate;

    // Pick best matching system voice
    const voices = this.synth.getVoices();
    const matchedVoice = voices.find((v) => {
      if (isArabic) {
        return v.lang.startsWith('ar');
      }
      return v.lang.startsWith(utterance.lang.slice(0, 2));
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  // Stop current speech
  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  // Check if speech synthesis is currently speaking
  public isSpeaking(): boolean {
    return Boolean(this.synth && this.synth.speaking);
  }

  // Speech Recognition (Voice Input)
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (errorMsg: string) => void,
    onEnd: () => void,
    langHint: string = 'ar-SA'
  ): boolean {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError('خاصية التعرف على الصوت غير مدعومة في هذا المتصفح. ننصح باستخدام متصفح Google Chrome.');
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = langHint;

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        // Iterate through all results to retain cumulative speech across breathing pauses
        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + ' ';
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const fullSentence = (finalTranscript + interimTranscript).trim();
        if (fullSentence) {
          onResult(fullSentence, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        let msg = 'حدث خطأ في التعرف على الصوت.';
        if (event.error === 'not-allowed') {
          msg = 'لم يتم منح إذن الميكروفون. يرجى الضغط على أيقونة القفل أو الكاميرا في شريط العنوان وتفعيل إذن الميكروفون ثم المحاولة مرة أخرى.';
        } else if (event.error === 'no-speech') {
          // If simply silent momentarily, don't crash or display error
          return;
        }
        onError(msg);
      };

      this.recognition.onend = () => {
        // If user didn't explicitly click stop, smoothly restart listening to allow long thought pauses
        if (this.isListening) {
          try {
            this.recognition.start();
            return;
          } catch (e) {
            // Already started or terminated
          }
        }
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      onError('تعذر بدء الاستماع الصوتي: ' + (err.message || 'خطأ غير معروف'));
      return false;
    }
  }

  public stopListening(): void {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const novaVoice = new NovaVoiceEngine();
