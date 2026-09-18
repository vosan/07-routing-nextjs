'use client';

import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Yup from 'yup';
import { createNote, getErrorMessage } from '../../lib/api';
import type { NewNote, NoteTag } from '../../types/note';
import css from './NoteForm.module.css';

interface NoteFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const tags: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];
const initialValues: NewNote = { title: '', content: '', tag: 'Todo' };
const validationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(50, 'Title must be at most 50 characters')
    .required('Title is required'),
  content: Yup.string().max(500, 'Content must be at most 500 characters'),
  tag: Yup.string()
    .oneOf(tags, 'Choose a valid tag')
    .required('Tag is required'),
});

export default function NoteForm({ onCancel, onSuccess }: NoteFormProps) {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      onSuccess();
    },
  });

  async function handleSubmit(values: NewNote) {
    try {
      await createMutation.mutateAsync({
        ...values,
        title: values.title.trim(),
      });
    } catch {
      // The mutation error is displayed below; retain the user's draft for retry.
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field
              id="title"
              type="text"
              name="title"
              className={css.input}
              aria-required="true"
              aria-invalid={Boolean(touched.title && errors.title)}
              aria-describedby="title-error"
            />
            <ErrorMessage
              name="title"
              component="span"
              id="title-error"
              className={css.error}
            />
          </div>
          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field
              as="textarea"
              id="content"
              name="content"
              rows={8}
              className={css.textarea}
              aria-invalid={Boolean(touched.content && errors.content)}
              aria-describedby="content-error"
            />
            <ErrorMessage
              name="content"
              component="span"
              id="content-error"
              className={css.error}
            />
          </div>
          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field
              as="select"
              id="tag"
              name="tag"
              className={css.select}
              aria-required="true"
              aria-invalid={Boolean(touched.tag && errors.tag)}
              aria-describedby="tag-error"
            >
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Field>
            <ErrorMessage
              name="tag"
              component="span"
              id="tag-error"
              className={css.error}
            />
          </div>
          {createMutation.isError && (
            <p role="alert" className={css.error}>
              {getErrorMessage(createMutation.error)}
            </p>
          )}
          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={isSubmitting || createMutation.isPending}
            >
              {isSubmitting ? 'Creating…' : 'Create note'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
