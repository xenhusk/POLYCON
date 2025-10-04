ALTER TABLE public.users DROP CONSTRAINT users_department_id_fkey;
ALTER TABLE public.programs DROP CONSTRAINT programs_department_id_fkey;
ALTER TABLE public.courses DROP CONSTRAINT courses_department_id_fkey;
ALTER TABLE public.consultation_sessions DROP CONSTRAINT consultation_sessions_booking_id_fkey;
ALTER TABLE public.teacher_schedules DROP CONSTRAINT teacher_schedules_semester_id_fkey;
ALTER TABLE public.students DROP CONSTRAINT students_user_id_fkey;
ALTER TABLE public.students DROP CONSTRAINT students_program_id_fkey;
ALTER TABLE public.faculty DROP CONSTRAINT faculty_user_id_fkey;
