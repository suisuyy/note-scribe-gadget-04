import { supabase } from './supabase';
import { SupabaseAuthProvider, useSupabaseAuth, SupabaseAuthUI } from './auth';
import { useNote, useNotes, useAddNote, useUpdateNote, useDeleteNote } from './hooks/useNotes';
import { useNoteDuplicate, useNotesDuplicate, useAddNoteDuplicate, useUpdateNoteDuplicate, useDeleteNoteDuplicate } from './hooks/useNotesDuplicate';

export {
  supabase,
  SupabaseAuthProvider,
  useSupabaseAuth,
  SupabaseAuthUI,
  useNote,
  useNotes,
  useAddNote,
  useUpdateNote,
  useDeleteNote,
  useNoteDuplicate,
  useNotesDuplicate,
  useAddNoteDuplicate,
  useUpdateNoteDuplicate,
  useDeleteNoteDuplicate
};