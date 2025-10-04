--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.grades DROP CONSTRAINT grades_student_user_id_fkey;
ALTER TABLE ONLY public.grades DROP CONSTRAINT grades_faculty_user_id_fkey;
ALTER TABLE ONLY public.grades DROP CONSTRAINT grades_course_id_fkey;
ALTER TABLE ONLY public.grades DROP CONSTRAINT grades_pkey;
ALTER TABLE public.grades ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.grades_id_seq;
DROP TABLE public.grades;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id integer NOT NULL,
    course_id integer NOT NULL,
    faculty_user_id integer NOT NULL,
    student_user_id integer NOT NULL,
    grade double precision NOT NULL,
    period character varying(50) NOT NULL,
    school_year character varying(20) NOT NULL,
    semester character varying(10) NOT NULL,
    remarks character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grades (id, course_id, faculty_user_id, student_user_id, grade, period, school_year, semester, remarks, created_at, updated_at) FROM stdin;
31	1	2	14	98	Prelim	2025-2026	1st	PASSED	2025-05-29 11:30:06.923026	\N
32	1	2	14	88	Midterm	2025-2026	1st	PASSED	2025-05-29 11:38:43.152016	\N
33	1	2	14	98	Pre-Final	2025-2026	1st	PASSED	2025-05-29 12:56:46.868843	\N
34	4	15	14	80	Prelim	2025-2026	1st	PASSED	2025-05-29 13:29:36.760118	\N
36	4	15	14	85	Prelim	2025-2026	1st	PASSED	2025-05-29 13:30:33.777442	\N
37	4	15	14	88	Pre-Final	2025-2026	1st	PASSED	2025-05-29 13:30:55.505027	\N
39	4	15	14	80	Midterm	2025-2026	1st	PASSED	2025-05-29 19:05:37.592312	\N
38	4	15	14	98	Prelim	2025-2026	2nd	PASSED	2025-05-29 13:31:18.700109	\N
35	4	15	14	85	Midterm	2024-2025	2nd	PASSED	2025-05-29 13:29:53.728304	\N
40	4	15	14	92	Final	2024-2025	2nd	PASSED	2025-05-29 19:06:04.272823	\N
41	4	15	14	88	Final	2025-2026	1st	PASSED	2025-05-30 16:22:46.097522	\N
42	4	15	14	78	Prelim	2024-2025	1st	PASSED	2025-05-30 16:28:31.444397	\N
43	4	15	14	89	Prelim	2024-2025	2nd	PASSED	2025-05-30 16:29:25.409084	\N
44	4	15	14	78	Pre-Final	2024-2025	2nd	PASSED	2025-05-30 16:30:11.51551	\N
45	4	15	14	88	Midterm	2024-2025	1st	PASSED	2025-06-09 13:51:37.175353	\N
46	4	15	14	94	Pre-Final	2024-2025	1st	PASSED	2025-06-09 13:52:05.066615	\N
47	4	15	14	95	Final	2024-2025	1st	PASSED	2025-06-09 13:52:36.812086	\N
49	4	15	8	86	Midterm	2024-2025	1st	PASSED	2025-06-09 13:57:42.612107	\N
50	4	15	8	90	Pre-Final	2024-2025	1st	PASSED	2025-06-09 13:58:16.584454	\N
51	4	15	8	95	Final	2024-2025	1st	PASSED	2025-06-09 13:58:43.486175	\N
48	4	15	8	69	Prelim	2024-2025	1st	FAILED	2025-06-09 13:57:10.228857	2025-06-09 14:31:09.002145
\.


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.grades_id_seq', 51, true);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: grades grades_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: grades grades_faculty_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_faculty_user_id_fkey FOREIGN KEY (faculty_user_id) REFERENCES public.users(id);


--
-- Name: grades grades_student_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_user_id_fkey FOREIGN KEY (student_user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

