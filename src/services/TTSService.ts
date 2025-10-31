/**
 * Text-to-Speech Service
 * Handles converting text to speech using device's built-in TTS capabilities
 */

import Tts from 'react-native-tts';
import { Platform } from 'react-native';

export class TTSService {
  private static isInitialized = false;

  /**
   * Initialize TTS service with default settings
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set default TTS settings
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.5); // Slower rate for better comprehension
      await Tts.setDefaultPitch(1.0);

      // Configure iOS-specific settings
      if (Platform.OS === 'ios') {
        // iOS uses AVSpeechSynthesizer
        await Tts.setDucking(true); // Duck audio during speech
      }

      // Set up event listeners
      Tts.addEventListener('tts-start', this.onTtsStart);
      Tts.addEventListener('tts-finish', this.onTtsFinish);
      Tts.addEventListener('tts-cancel', this.onTtsCancel);

      this.isInitialized = true;
      console.log('TTS Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TTS:', error);
      throw new Error('TTS initialization failed');
    }
  }

  /**
   * Speak the provided text
   * @param text - The text to convert to speech
   * @param options - Optional speech configuration
   */
  static async speak(text: string, options?: TTSSpeechOptions): Promise<void> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text to speak cannot be empty');
    }

    // Initialize if not already done
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Apply any custom options
      if (options) {
        if (options.language) {
          await Tts.setDefaultLanguage(options.language);
        }
        if (options.rate) {
          await Tts.setDefaultRate(options.rate);
        }
        if (options.pitch) {
          await Tts.setDefaultPitch(options.pitch);
        }
      }

      // Start speaking
      await Tts.speak(text.trim());
      console.log('TTS speaking:', text);
    } catch (error) {
      console.error('TTS speech error:', error);
      throw new Error('Failed to speak text');
    }
  }

  /**
   * Stop any ongoing speech
   */
  static async stop(): Promise<void> {
    try {
      await Tts.stop();
      console.log('TTS stopped');
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  /**
   * Get available voices (platform-specific)
   */
  static async getVoices(): Promise<TTSVoice[]> {
    try {
      const voices = await Tts.voices();
      return voices.map(voice => ({
        id: voice.id,
        name: voice.name,
        language: voice.language,
      }));
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }

  /**
   * Set the default voice for speech
   * @param voiceId - The ID of the voice to use
   */
  static async setVoice(voiceId: string): Promise<void> {
    try {
      // Note: react-native-tts doesn't have a direct setVoice method
      // This would require platform-specific implementation
      console.log(`Setting voice to: ${voiceId}`);
    } catch (error) {
      console.error('Error setting voice:', error);
    }
  }

  /**
   * Get current TTS settings
   */
  static async getSettings(): Promise<TTSSettings> {
    try {
      const settings = await Tts.getDefaultSettings();
      return {
        language: settings.language || 'en-US',
        rate: settings.rate || 0.5,
        pitch: settings.pitch || 1.0,
      };
    } catch (error) {
      console.error('Error getting TTS settings:', error);
      return {
        language: 'en-US',
        rate: 0.5,
        pitch: 1.0,
      };
    }
  }

  /**
   * Test TTS with a default message
   */
  static async test(): Promise<void> {
    try {
      await this.speak('Voice reminder is working correctly');
    } catch (error) {
      console.error('TTS test failed:', error);
      throw error;
    }
  }

  /**
   * Event handler for TTS start
   */
  private static onTtsStart = (event: any): void => {
    console.log('TTS started:', event);
  };

  /**
   * Event handler for TTS finish
   */
  private static onTtsFinish = (event: any): void => {
    console.log('TTS finished:', event);
  };

  /**
   * Event handler for TTS cancel
   */
  private static onTtsCancel = (event: any): void => {
    console.log('TTS cancelled:', event);
  };

  /**
   * Cleanup TTS event listeners
   */
  static cleanup(): void {
    Tts.removeEventListener('tts-start', this.onTtsStart);
    Tts.removeEventListener('tts-finish', this.onTtsFinish);
    Tts.removeEventListener('tts-cancel', this.onTtsCancel);
    this.isInitialized = false;
  }
}

// Type definitions for TTS options and interfaces
export interface TTSSpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
}

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
}

export interface TTSSettings {
  language: string;
  rate: number;
  pitch: number;
}