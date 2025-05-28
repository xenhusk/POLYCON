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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id character varying(100) NOT NULL,
    subject character varying(200),
    description text,
    schedule timestamp without time zone NOT NULL,
    venue character varying(200),
    status character varying(50) NOT NULL,
    teacher_id character varying(50) NOT NULL,
    student_ids json NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    created_by character varying(50)
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: consultation_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consultation_sessions (
    id integer NOT NULL,
    session_date timestamp without time zone NOT NULL,
    duration character varying(20),
    student_ids json NOT NULL,
    summary text,
    teacher_id character varying(50),
    transcription text,
    concern text,
    action_taken text,
    outcome text,
    remarks text,
    venue character varying(255),
    audio_file_path character varying(512),
    quality_score double precision,
    quality_metrics json,
    raw_sentiment_analysis json,
    booking_id character varying(100)
);


ALTER TABLE public.consultation_sessions OWNER TO postgres;

--
-- Name: consultation_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consultation_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consultation_sessions_id_seq OWNER TO postgres;

--
-- Name: consultation_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consultation_sessions_id_seq OWNED BY public.consultation_sessions.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    credits integer NOT NULL,
    department_id integer NOT NULL,
    program_ids integer[]
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: faculty; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculty (
    id integer NOT NULL,
    user_id integer NOT NULL,
    is_active boolean
);


ALTER TABLE public.faculty OWNER TO postgres;

--
-- Name: faculty_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faculty_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faculty_id_seq OWNER TO postgres;

--
-- Name: faculty_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faculty_id_seq OWNED BY public.faculty.id;


--
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.grades OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grades_id_seq OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grades_id_seq OWNED BY public.grades.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    data json NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: programs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.programs (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    department_id integer NOT NULL
);


ALTER TABLE public.programs OWNER TO postgres;

--
-- Name: semesters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.semesters (
    id integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    school_year character varying(20) NOT NULL,
    semester character varying(10) NOT NULL
);


ALTER TABLE public.semesters OWNER TO postgres;

--
-- Name: semesters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.semesters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.semesters_id_seq OWNER TO postgres;

--
-- Name: semesters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.semesters_id_seq OWNED BY public.semesters.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id integer NOT NULL,
    user_id integer NOT NULL,
    program_id integer NOT NULL,
    sex character varying(10) NOT NULL,
    year_section character varying(50) NOT NULL,
    is_enrolled boolean,
    enrolled_by character varying(50)
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    id_number character varying(50) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    full_name character varying(200) NOT NULL,
    email character varying(120) NOT NULL,
    password character varying(200) NOT NULL,
    department_id integer NOT NULL,
    role character varying(50) NOT NULL,
    archived boolean,
    profile_picture character varying(255),
    is_verified boolean
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: consultation_sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultation_sessions ALTER COLUMN id SET DEFAULT nextval('public.consultation_sessions_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: faculty id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty ALTER COLUMN id SET DEFAULT nextval('public.faculty_id_seq'::regclass);


--
-- Name: grades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades ALTER COLUMN id SET DEFAULT nextval('public.grades_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: semesters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semesters ALTER COLUMN id SET DEFAULT nextval('public.semesters_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
fix_models_syntax
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, subject, description, schedule, venue, status, teacher_id, student_ids, created_at, created_by) FROM stdin;
BOOKING_SAMPLE_001	Academic Consultation	Discussion about project progress.	2025-05-31 13:04:48.658001	Consultation Room 1	pending	F2024002	[8]	2025-05-28 22:04:48.658007	S2024003
BOOKING_SAMPLE_002	Career Advice	Discussion about upcoming exams.	2025-06-10 11:04:48.659002	Consultation Room 1	completed	F2024003	[7]	2025-05-28 22:04:48.658007	S2024002
BOOKING_SAMPLE_003	Project Guidance	Discussion about upcoming exams.	2025-05-31 15:04:48.662563	Library Cubicle A	confirmed	F2024004	[9, 6, 12]	2025-05-28 22:04:48.658007	S2024001
BOOKING_SAMPLE_004	Career Advice	Discussion about course material.	2025-06-27 08:04:48.663563	Library Cubicle A	confirmed	F2024002	[12]	2025-05-28 22:04:48.658007	S2024007
BOOKING_SAMPLE_005	Academic Consultation	Discussion about course material.	2025-06-12 13:04:48.664562	Consultation Room 1	completed	F2024003	[10, 13]	2025-05-28 22:04:48.658007	S2024008
BOOKING_SAMPLE_006	Thesis Discussion	Discussion about upcoming exams.	2025-06-15 15:04:48.664562	Faculty Room	completed	F2024002	[7]	2025-05-28 22:04:48.658007	S2024002
BOOKING_SAMPLE_007	Project Guidance	Discussion about project progress.	2025-06-28 12:04:48.664562	Consultation Room 1	completed	F2024004	[10]	2025-05-28 22:04:48.658007	S2024005
BOOKING_SAMPLE_008	Academic Consultation	Discussion about upcoming exams.	2025-06-20 12:04:48.664562	Consultation Room 1	completed	F2024001	[12, 13, 7]	2025-05-28 22:04:48.658007	S2024008
BOOKING_SAMPLE_009	Career Advice	Discussion about course material.	2025-06-26 12:04:48.665562	Consultation Room 1	pending	F2024002	[8]	2025-05-28 22:04:48.658007	S2024003
BOOKING_SAMPLE_010	Project Guidance	Discussion about course material.	2025-06-20 14:04:48.665562	Online Meeting	completed	F2024001	[6, 12]	2025-05-28 22:04:48.658007	S2024007
9c9c27ed-0bb8-49f5-851c-f7ea85582539	Consultation		2025-05-28 22:43:00	B303	confirmed	22-3191-535	[6, 13, 8]	2025-05-28 22:43:37.119034	22-3191-535
\.


--
-- Data for Name: consultation_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consultation_sessions (id, session_date, duration, student_ids, summary, teacher_id, transcription, concern, action_taken, outcome, remarks, venue, audio_file_path, quality_score, quality_metrics, raw_sentiment_analysis, booking_id) FROM stdin;
1	2025-06-10 11:04:48.659002	24 minutes	[7]	Summary of consultation for booking BOOKING_SAMPLE_002.	F2024003	Sample transcription of the session...	Discussed student's concern about X.	Advised student to Y.	Student understood the concept.	Productive session.	Consultation Room 1	\N	4.2	\N	\N	BOOKING_SAMPLE_002
2	2025-06-12 13:04:48.664562	40 minutes	[10, 13]	Summary of consultation for booking BOOKING_SAMPLE_005.	F2024003	Sample transcription of the session...	Discussed student's concern about X.	Advised student to Y.	Student understood the concept.	Productive session.	Consultation Room 1	\N	3.4	\N	\N	BOOKING_SAMPLE_005
3	2025-06-15 15:04:48.664562	47 minutes	[7]	Summary of consultation for booking BOOKING_SAMPLE_006.	F2024002	Sample transcription of the session...	Discussed student's concern about X.	Advised student to Y.	Student understood the concept.	Productive session.	Faculty Room	\N	\N	\N	\N	BOOKING_SAMPLE_006
4	2025-06-28 12:04:48.664562	18 minutes	[10]	Summary of consultation for booking BOOKING_SAMPLE_007.	F2024004	Sample transcription of the session...	Discussed student's concern about X.	Advised student to Y.	Student understood the concept.	Productive session.	Consultation Room 1	\N	3.3	\N	\N	BOOKING_SAMPLE_007
5	2025-06-20 12:04:48.664562	34 minutes	[12, 13, 7]	Summary of consultation for booking BOOKING_SAMPLE_008.	F2024001	Sample transcription of the session...	Discussed student's concern about X.	Advised student to Y.	Student understood the concept.	Productive session.	Consultation Room 1	\N	4.7	\N	\N	BOOKING_SAMPLE_008
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, code, name, credits, department_id, program_ids) FROM stdin;
1	IT101	Introduction to Programming	3	1	{1,2}
2	CS201	Data Structures and Algorithms	3	1	{2}
3	IT202	Database Management Systems	3	1	{1}
4	ACC101	Basic Accounting	3	2	{3,4}
5	ED101	Principles of Teaching	3	3	{5}
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name) FROM stdin;
1	College of Information Technology and Engineering
2	College of Business and Accountancy
3	College of Education
\.


--
-- Data for Name: faculty; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculty (id, user_id, is_active) FROM stdin;
1	2	t
2	3	t
3	4	t
4	5	t
5	15	t
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (id, course_id, faculty_user_id, student_user_id, grade, period, school_year, semester, remarks, created_at, updated_at) FROM stdin;
1	3	5	6	3.23	Midterm	2024-2025	1st	Failed	2025-05-28 22:04:48.637003	\N
2	3	4	6	2.91	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
3	1	2	7	3.22	Midterm	2024-2025	1st	Failed	2025-05-28 22:04:48.637003	\N
4	1	5	7	1.97	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
5	4	4	8	1.81	Midterm	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
6	4	3	8	1.88	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
7	5	3	8	1.64	Midterm	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
8	5	3	8	3.44	Final	2024-2025	1st	Failed	2025-05-28 22:04:48.637003	\N
9	4	2	9	3.3	Midterm	2024-2025	1st	Failed	2025-05-28 22:04:48.637003	\N
10	4	4	9	2.96	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
11	2	5	9	1.76	Midterm	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
12	2	2	9	2.05	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
13	5	5	10	1.25	Midterm	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
14	5	3	10	2.97	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
15	2	5	10	2.4	Midterm	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
16	2	5	10	2.67	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
17	4	5	10	3.29	Midterm	2024-2025	1st	Failed	2025-05-28 22:04:48.637003	\N
18	4	5	10	2.98	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
19	2	5	11	1.57	Midterm	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
20	2	2	11	3.59	Final	2024-2025	1st	Failed	2025-05-28 22:04:48.637003	\N
21	5	4	11	2.7	Midterm	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
22	5	4	11	3.74	Final	2024-2025	1st	Failed	2025-05-28 22:04:48.637003	\N
23	1	4	12	3.31	Midterm	2024-2025	1st	Failed	2025-05-28 22:04:48.637003	\N
24	1	4	12	2	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
25	4	2	12	3.35	Midterm	2024-2025	1st	Failed	2025-05-28 22:04:48.637003	\N
26	4	2	12	1.69	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
27	3	2	12	1.1	Midterm	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
28	3	2	12	2.27	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
29	4	2	13	3.56	Midterm	2024-2025	1st	Failed	2025-05-28 22:04:48.637003	\N
30	4	4	13	2.9	Final	2024-2025	1st	Passed	2025-05-28 22:04:48.637003	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, data, created_at) FROM stdin;
1	{"user_id": 12, "message": "Sample notification 1: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_003", "read": true}	2025-05-28 22:04:48.683727
2	{"user_id": 10, "message": "Sample notification 2: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_005", "read": false}	2025-05-28 22:04:48.683727
3	{"user_id": 2, "message": "Sample notification 3: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_010", "read": true}	2025-05-28 22:04:48.683727
4	{"user_id": 10, "message": "Sample notification 4: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_005", "read": false}	2025-05-28 22:04:48.683727
5	{"user_id": 3, "message": "Sample notification 5: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_005", "read": false}	2025-05-28 22:04:48.683727
6	{"user_id": 4, "message": "Sample notification 6: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_002", "read": false}	2025-05-28 22:04:48.683727
7	{"user_id": 9, "message": "Sample notification 7: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_001", "read": true}	2025-05-28 22:04:48.683727
8	{"user_id": 4, "message": "Sample notification 8: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_010", "read": false}	2025-05-28 22:04:48.683727
9	{"user_id": 11, "message": "Sample notification 9: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_002", "read": false}	2025-05-28 22:04:48.683727
10	{"user_id": 10, "message": "Sample notification 10: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_005", "read": false}	2025-05-28 22:04:48.683727
11	{"user_id": 9, "message": "Sample notification 11: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_005", "read": true}	2025-05-28 22:04:48.683727
12	{"user_id": 8, "message": "Sample notification 12: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_004", "read": false}	2025-05-28 22:04:48.683727
13	{"user_id": 5, "message": "Sample notification 13: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_007", "read": false}	2025-05-28 22:04:48.683727
14	{"user_id": 8, "message": "Sample notification 14: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_010", "read": false}	2025-05-28 22:04:48.683727
15	{"user_id": 6, "message": "Sample notification 15: Your booking has been updated.", "type": "booking_update", "related_id": "BOOKING_SAMPLE_006", "read": false}	2025-05-28 22:04:48.683727
\.


--
-- Data for Name: programs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.programs (id, name, department_id) FROM stdin;
1	Bachelor of Science in Information Technology	1
2	Bachelor of Science in Computer Science	1
3	Bachelor of Science in Accountancy	2
4	Bachelor of Science in Management Accounting	2
5	Bachelor of Science in Education	3
\.


--
-- Data for Name: semesters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.semesters (id, start_date, end_date, school_year, semester) FROM stdin;
1	2024-08-01	2024-12-15	2024-2025	1st
2	2025-01-15	2025-05-30	2024-2025	2nd
3	2025-08-01	2025-12-15	2025-2026	1st
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, user_id, program_id, sex, year_section, is_enrolled, enrolled_by) FROM stdin;
1	6	1	Female	BSIT-1A	t	F2024001
2	7	2	Male	BSCS-1A	t	F2024001
3	8	3	Male	BSA-2B	t	F2024001
4	9	5	Female	BSED-3A	t	F2024001
5	10	1	Male	BSIT-1B	t	F2024001
6	11	2	Female	BSCS-2A	t	F2024001
7	12	4	Male	BSMA-1A	t	F2024001
8	13	5	Female	BSED-4A	t	F2024001
9	14	1	Male	3A	f	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, id_number, first_name, last_name, full_name, email, password, department_id, role, archived, profile_picture, is_verified) FROM stdin;
1	admin001	Admin	User	Admin User	admin@wnu.sti.edu.ph	$2b$12$OXy/GEwI.q04avGVYNRD8OdaoO2H9q/a82JkogFMrDPzkbgZel0aK	1	admin	f	\N	t
2	F2024001	John	Doe	John Doe	john.doe@wnu.sti.edu.ph	$2b$12$drxHXvt30ArW2uarfnhmbu8aWsSpOvJef1NiqSReSeS5xlG4tp0Ym	1	faculty	f	\N	t
3	F2024002	Jane	Smith	Jane Smith	jane.smith@wnu.sti.edu.ph	$2b$12$DR77HrpK2wuJtOWo6hVp9ujfYhwHq89w3CpNtGRgIuUgjKtJZlpF6	2	faculty	f	\N	t
4	F2024003	Robert	Brown	Robert Brown	robert.brown@wnu.sti.edu.ph	$2b$12$/xaFSWnIaTJqRD4D5QxQce6Dr5RqiBfWVRhRNnF.fskv01eyMNx/S	3	faculty	f	\N	t
5	F2024004	Emily	White	Emily White	emily.white@wnu.sti.edu.ph	$2b$12$UFXyYa3H/3bun3gpLjuwOefPF/cfxBAWCHs4qhGPuP3509ig.2rHu	1	faculty	f	\N	t
6	S2024001	Alice	Johnson	Alice Johnson	alice.S2024001@wnu.sti.edu.ph	$2b$12$zdo9e.naxxLCmSkg3ekzD./D48SruHzuWKma8mPSNwfzI2qFG5jhG	1	student	f	\N	t
7	S2024002	Bob	Williams	Bob Williams	bob.S2024002@wnu.sti.edu.ph	$2b$12$CvwoihoBIoyeP3glX0MwN.j1I5JR4QqaHVdoFe34/ACDSLAe..J/y	1	student	f	\N	t
8	S2024003	Charlie	Davis	Charlie Davis	charlie.S2024003@wnu.sti.edu.ph	$2b$12$MHvqswJOKdnsAgBdnzeQEejm/zAYzmB3dSQGlWCsDveN6KuGTt7X6	2	student	f	\N	t
9	S2024004	Diana	Miller	Diana Miller	diana.S2024004@wnu.sti.edu.ph	$2b$12$qbaaVCPFxmkaDutcZ4yhdOLyleYYT4Q71SB9qJ7UkRLX25TXgv2j.	3	student	f	\N	t
10	S2024005	Edward	Wilson	Edward Wilson	edward.S2024005@wnu.sti.edu.ph	$2b$12$Ve4WYxSdZXnUjTw5UGPIfOWOe5USpgkBbkW4.0QqbTj8dGbwfydja	1	student	f	\N	t
11	S2024006	Fiona	Garcia	Fiona Garcia	fiona.S2024006@wnu.sti.edu.ph	$2b$12$NjLyAzBFgt1Agj/rDMUmsuoXFJt8SARsoUnRVvO7o5xUR/Nu9n8m2	1	student	f	\N	t
12	S2024007	George	Rodriguez	George Rodriguez	george.S2024007@wnu.sti.edu.ph	$2b$12$sqckg491Ih.0qGOvvQxAUeh4v/81l13wgv1Yoc5tOy2zQaYt2CN.2	2	student	f	\N	t
13	S2024008	Hannah	Martinez	Hannah Martinez	hannah.S2024008@wnu.sti.edu.ph	$2b$12$0uRGowpLr6ULi.NJiS2n9uWj.6wUu3ZP6kPbuawBLf7Oapw0UnOEm	3	student	f	\N	t
14	22-3191-534	David Paul	Desuyo	David Paul Desuyo	desuyo.191534@wnu.sti.edu.ph	$2b$12$pY8c/v99mzhfdBgO1EXg0Oe/pEhiZh17MsocnnQQcj3LBJ.OoiVGi	1	student	f	\N	t
15	22-3191-535	David Paul	Desuyo	David Paul Desuyo	desuyo.191535@wnu.sti.edu.ph	$2b$12$oNreF1f0SDa6R.ADEPnPjOhff1OYiEEjEoKWHMYvkcppuU/6YX6DC	2	faculty	f	a3cbca33-bd75-4f83-a3f7-ac469bbc65f3.png	t
\.


--
-- Name: consultation_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consultation_sessions_id_seq', 5, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 5, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 3, true);


--
-- Name: faculty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faculty_id_seq', 4, true);


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_id_seq', 30, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 15, true);


--
-- Name: semesters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.semesters_id_seq', 3, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_id_seq', 10, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: consultation_sessions consultation_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultation_sessions
    ADD CONSTRAINT consultation_sessions_pkey PRIMARY KEY (id);


--
-- Name: courses courses_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_code_key UNIQUE (code);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: faculty faculty_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- Name: semesters semesters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.semesters
    ADD CONSTRAINT semesters_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_id_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_number_key UNIQUE (id_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: consultation_sessions consultation_sessions_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consultation_sessions
    ADD CONSTRAINT consultation_sessions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: courses courses_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: faculty faculty_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT faculty_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: grades grades_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: grades grades_faculty_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_faculty_user_id_fkey FOREIGN KEY (faculty_user_id) REFERENCES public.users(id);


--
-- Name: grades grades_student_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_student_user_id_fkey FOREIGN KEY (student_user_id) REFERENCES public.users(id);


--
-- Name: programs programs_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: students students_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.programs(id);


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- PostgreSQL database dump complete
--

