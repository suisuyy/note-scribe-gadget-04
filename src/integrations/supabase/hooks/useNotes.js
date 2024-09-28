import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/*
### notes

| name         | type                     | format | required |
|--------------|--------------------------|--------|----------|
| id           | text                     | string | true     |
| content      | text                     | string | false    |
| last_updated | timestamp with time zone | string | false    |
| status       | jsonb                    | -      | false    |

Note: 
- 'id' is the Primary Key.
- 'last_updated' has a default value of CURRENT_TIMESTAMP.
*/

export const useNote = (id) => useQuery({
    queryKey: ['notes', id],
    queryFn: () => fromSupabase(supabase.from('notes').select('*').eq('id', id).single()),
});

export const useNotes = () => useQuery({
    queryKey: ['notes'],
    queryFn: () => fromSupabase(supabase.from('notes').select('*')),
});

export const useAddNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newNote) => fromSupabase(supabase.from('notes').insert([newNote])),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });
};

export const useUpdateNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('notes').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });
};

export const useDeleteNote = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('notes').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });
};