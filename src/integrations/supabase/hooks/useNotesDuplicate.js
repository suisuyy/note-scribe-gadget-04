import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/*
### notes_duplicate

| name         | type                     | format | required |
|--------------|--------------------------|--------|----------|
| id           | text                     | string | true     |
| content      | text                     | string | false    |
| last_updated | timestamp with time zone | string | false    |
| status       | jsonb                    | -      | false    |

Note: 
- 'id' is the Primary Key.
- 'last_updated' has a default value of CURRENT_TIMESTAMP.
- This is a duplicate of the 'notes' table.
*/

export const useNoteDuplicate = (id) => useQuery({
    queryKey: ['notes_duplicate', id],
    queryFn: () => fromSupabase(supabase.from('notes_duplicate').select('*').eq('id', id).single()),
});

export const useNotesDuplicate = () => useQuery({
    queryKey: ['notes_duplicate'],
    queryFn: () => fromSupabase(supabase.from('notes_duplicate').select('*')),
});

export const useAddNoteDuplicate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newNote) => fromSupabase(supabase.from('notes_duplicate').insert([newNote])),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes_duplicate'] });
        },
    });
};

export const useUpdateNoteDuplicate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('notes_duplicate').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes_duplicate'] });
        },
    });
};

export const useDeleteNoteDuplicate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('notes_duplicate').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes_duplicate'] });
        },
    });
};