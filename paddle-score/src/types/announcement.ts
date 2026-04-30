/** Base filename (without .m4a) for each bundled recording in assets/audio/ */
export type ClipId =
  | 'efes'
  | 'hamesh_esre'
  | 'shloshim'
  | 'arbaim'
  | 'achat'
  | 'shtaim'
  | 'shalosh'
  | 'arba'
  | 'hamesh'
  | 'shesh'
  | 'sheva'
  | 'dius'
  | 'yitron'
  | 'giim'
  | 'set'
  | 'umatch'
  | 'lekol'
  | 'le'
  | 'servim_shel'
  | 'setim';

export type AnnouncementStep =
  | { type: 'clip'; id: ClipId }
  | {
      type: 'tts';
      text: string;
      /** BCP-47 language for this utterance (default: Hebrew for names) */
      language?: string;
      /** When true, do not apply cached Hebrew voice (use system voice for `language`) */
      useSystemVoice?: boolean;
      rate?: number;
    };

export const ALL_CLIP_IDS: ClipId[] = [
  'efes',
  'hamesh_esre',
  'shloshim',
  'arbaim',
  'achat',
  'shtaim',
  'shalosh',
  'arba',
  'hamesh',
  'shesh',
  'sheva',
  'dius',
  'yitron',
  'giim',
  'set',
  'umatch',
  'lekol',
  'le',
  'servim_shel',
  'setim',
];
