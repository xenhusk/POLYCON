ALTER TABLE public.users ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE public.programs ADD CONSTRAINT programs_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE public.courses ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE public.consultation_sessions ADD CONSTRAINT consultation_sessions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id);
ALTER TABLE public.teacher_schedules ADD CONSTRAINT teacher_schedules_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES semesters(id);
ALTER TABLE public.students ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE public.students ADD CONSTRAINT students_program_id_fkey FOREIGN KEY (program_id) REFERENCES programs(id);
ALTER TABLE public.faculty ADD CONSTRAINT faculty_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
