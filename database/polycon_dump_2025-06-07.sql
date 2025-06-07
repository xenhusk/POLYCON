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
9c9c27ed-0bb8-49f5-851c-f7ea85582539	Consultation		2025-05-28 22:43:00	B303	cancelled	22-3191-535	[6, 13, 8]	2025-05-28 22:43:37.119034	22-3191-535
cd651ffd-257b-4755-b3d9-3b85f793c5ca	Consultation		2025-05-28 22:53:00	B303	completed	22-3191-535	[14]	2025-05-28 22:53:53.946708	22-3191-535
fadd69f7-6b8f-494d-8608-9e00289772eb	Consultation		2025-05-29 08:57:00	B303	cancelled	22-3191-535	[14]	2025-05-29 08:57:37.784646	22-3191-535
1ea468a4-1e69-4f99-92c9-376efc496dd3	Consultation		2025-06-03 19:21:00	303	cancelled	22-3191-535	[14]	2025-06-03 19:21:58.944279	22-3191-535
92396eb7-e636-46e8-8b5e-09fe990da1b0	Consultation		2025-06-03 20:45:00	303	cancelled	22-3191-535	[14]	2025-06-03 20:45:19.620881	22-3191-535
d1a28110-1bfc-467a-b337-fd1c658718d7	Consultation		2025-06-03 20:46:00	3093	cancelled	22-3191-535	[14]	2025-06-03 20:47:05.324502	22-3191-535
c7aea873-ab6a-44de-9d76-908f950ba2b2	Consultation		2025-06-03 21:01:00	202	cancelled	22-3191-535	[14]	2025-06-03 21:01:21.147299	22-3191-535
e5358e67-929b-4e03-aaef-ceeeab41b421	Consultation		2025-06-03 21:08:00	303	cancelled	22-3191-535	[14]	2025-06-03 21:08:43.758514	22-3191-535
24b1c1fc-951d-40ae-8f66-49ffc14bdcbd	Consultation		2025-06-03 21:20:00	303	cancelled	22-3191-535	[14]	2025-06-03 21:20:09.902106	22-3191-535
1188aba2-f454-433f-8265-79a57769e876	Consultation		2025-06-03 21:21:00	202	cancelled	22-3191-535	[14]	2025-06-03 21:21:30.978761	22-3191-535
2db88718-31fb-4dfe-8fae-1efefcac7e18	Consultation		2025-06-04 16:05:00	777	cancelled	22-3191-535	[14]	2025-06-04 16:05:26.636315	22-3191-535
9dc261a6-6b5a-4d2a-b909-22214ce7f16e	Consultation		2025-06-04 16:14:00	333	cancelled	22-3191-535	[14]	2025-06-04 16:14:55.788379	22-3191-535
de9892e5-6d96-4a52-bae8-313af4485f49	Consultation		2025-06-05 16:18:00	444	cancelled	22-3191-535	[14]	2025-06-04 16:18:23.327188	22-3191-535
5c375f35-5bac-453f-82a6-67593c451cff	Consultation		2025-06-05 16:32:00	444	cancelled	22-3191-535	[14]	2025-06-04 16:32:58.010817	22-3191-535
21f0aca8-15fe-4468-9287-714d9182baa9	Consultation		2025-06-04 16:35:00	505	cancelled	22-3191-535	[14]	2025-06-04 16:35:43.58626	22-3191-535
01818443-8ad2-4e90-82d7-ea218f754154	Consultation		2025-06-04 16:49:00	303	cancelled	22-3191-535	[14]	2025-06-04 16:49:43.663454	22-3191-535
94b171db-39ca-4801-9e68-2aac7a7a8817	Consultation		2025-06-04 16:54:00	333	cancelled	22-3191-535	[14]	2025-06-04 16:54:13.842938	22-3191-535
96dd5de6-34a9-4857-8fa2-ae1af7614da9	Consultation		2025-06-04 17:01:00	303	cancelled	22-3191-535	[14]	2025-06-04 17:01:32.103307	22-3191-535
7c0e6258-41e4-441c-9fa4-a6339fcecd69	Consultation		2025-06-04 17:06:00	303	cancelled	22-3191-535	[14]	2025-06-04 17:06:36.710028	22-3191-535
e19e6e4e-834d-4b44-b47b-25ca1d1ffe48	Consultation		2025-06-06 17:22:00	303	cancelled	22-3191-535	[14]	2025-06-04 17:22:24.337909	22-3191-534
7e3ff71c-d7b5-434f-a518-a3c7f61a9eec	Consultation		2025-06-05 17:50:00	303	cancelled	22-3191-535	[14]	2025-06-05 17:51:03.661466	22-3191-535
4d50da48-b1c9-4439-8334-dac2f03f5fcd	Consultation		2025-06-14 10:06:00	303	cancelled	22-3191-535	[14]	2025-06-05 17:51:51.312819	22-3191-534
\.


--
-- Data for Name: consultation_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consultation_sessions (id, session_date, duration, student_ids, summary, teacher_id, transcription, concern, action_taken, outcome, remarks, venue, audio_file_path, quality_score, quality_metrics, raw_sentiment_analysis, booking_id) FROM stdin;
1	2025-05-29 09:22:21.631	00:01:44	["22-3191-534"]	The student needed clarification on when to use Python 'for' and 'while' loops. The teacher explained that 'for' loops are for a set number of iterations and 'while' loops are for an indefinite number based on a condition. The teacher used examples and is going to demonstrate a 'while' loop with a coding example. The student now understands the differences.\n\nPOSITIVE	22-3191-535	Teacher: Good afternoon, Jamie. Thanks for scheduling this session. I see you wanted to discuss Python loops.\nStudent 1: Hi, Professor. Yes, exactly. I'm specifically getting stuck on when to use a for loop versus a while loop. I understand the basic syntax for both, but choosing the right one for a problem is tricky.\nTeacher: That's a great question. And a common one. The main difference lies in how the iteration is controlled. A for loop is typically used when you know how many times you want to iterate. Like going through each item in a list or for a set number of repetitions. For example, if we have a list of student names, we'd use a for loop to print each name.\nStudent 1: Okay, that makes sense for lists. So while loops are for while. When you don't know beforehand how many times you will loop precisely.\nTeacher: A while loop continues as long a certain condition remains true. Think of a game where you'll keep asking the user for input until they type quit. You don't know how many inputs they'll.\nStudent 1: Give before typing quit.\nTeacher: So a while loop here is perfect. The loop continues while the input is not quit.\nStudent 1: Ah, I see. So four is for definite numbers of iterations, and while is for an indefinite number based on a condition. That clears it up a lot. Could we maybe try a quick example of a while loop?\nTeacher: Certainly. Let's open up the editor and code a small guessing game.\nStudent 1: That's a classic while loop scenario.	Student (Jamie) expressed confusion regarding the appropriate use-cases for 'for' loops versus 'while' loops in Python, despite understanding their basic syntax.	Clarified the primary distinction: 'for' loops for known/definite iteration counts (e.g., iterating over a list) and 'while' loops for indefinite iteration based on a continuing condition. Provided analogies (list of names for 'for', guessing game/quit command for 'while'). Offered to demonstrate a 'while' loop with a practical coding example (guessing game).	Student verbalized a clearer understanding of the distinction. Showed enthusiasm for a practical example. The hands-on coding session is expected to solidify the concept.	Jamie is actively seeking to understand the core differences rather than just memorizing syntax. The distinction based on definite vs. indefinite iteration seemed to resonate. The guessing game example should be effective.	B303	/uploads/session_audio_4a06096c047c4d23ab777d0f26d4eed5.wav	0.3689415344	{"average_confidence": {"NEGATIVE": 0, "NEUTRAL": 0.7, "POSITIVE": 0.9}, "base_score": 0.42, "confidence_factor": 0.87, "duration_factor": "N/A", "duration_in_seconds": "N/A", "final_score": 0.37, "negativity_ratio": 0, "positivity_ratio": 0.18, "sentiment_distribution": {"NEGATIVE": 0, "NEUTRAL": 82.1, "POSITIVE": 17.9}}	[{"confidence": 0.7975879, "end": 3600, "sentiment": "POSITIVE", "start": 2080, "text": "Good afternoon, Jamie."}, {"confidence": 0.9544091, "end": 5520, "sentiment": "POSITIVE", "start": 3600, "text": "Thanks for scheduling this session."}, {"confidence": 0.78076005, "end": 8400, "sentiment": "NEUTRAL", "start": 5920, "text": "I see you wanted to discuss Python loops."}, {"confidence": 0.7252048, "end": 10320, "sentiment": "NEUTRAL", "start": 9200, "text": "Hi, Professor."}, {"confidence": 0.5172198, "end": 11920, "sentiment": "NEUTRAL", "start": 10720, "text": "Yes, exactly."}, {"confidence": 0.5702226, "end": 16800, "sentiment": "NEUTRAL", "start": 12160, "text": "I'm specifically getting stuck on when to use a for loop versus a while loop."}, {"confidence": 0.6072994, "end": 23200, "sentiment": "NEUTRAL", "start": 17040, "text": "I understand the basic syntax for both, but choosing the right one for a problem is tricky."}, {"confidence": 0.86355954, "end": 25280, "sentiment": "POSITIVE", "start": 23920, "text": "That's a great question."}, {"confidence": 0.68680376, "end": 26800, "sentiment": "NEUTRAL", "start": 25600, "text": "And a common one."}, {"confidence": 0.71969163, "end": 30820, "sentiment": "NEUTRAL", "start": 27620, "text": "The main difference lies in how the iteration is controlled."}, {"confidence": 0.88752776, "end": 35540, "sentiment": "NEUTRAL", "start": 30980, "text": "A for loop is typically used when you know how many times you want to iterate."}, {"confidence": 0.84803057, "end": 40980, "sentiment": "NEUTRAL", "start": 36500, "text": "Like going through each item in a list or for a set number of repetitions."}, {"confidence": 0.91612166, "end": 47140, "sentiment": "NEUTRAL", "start": 41540, "text": "For example, if we have a list of student names, we'd use a for loop to print each name."}, {"confidence": 0.54066265, "end": 50060, "sentiment": "NEUTRAL", "start": 48020, "text": "Okay, that makes sense for lists."}, {"confidence": 0.8135427, "end": 52600, "sentiment": "NEUTRAL", "start": 50060, "text": "So while loops are for while."}, {"confidence": 0.6512471, "end": 57870, "sentiment": "NEUTRAL", "start": 52670, "text": "When you don't know beforehand how many times you will loop precisely."}, {"confidence": 0.8524396, "end": 62590, "sentiment": "NEUTRAL", "start": 58190, "text": "A while loop continues as long a certain condition remains true."}, {"confidence": 0.6721562, "end": 67870, "sentiment": "NEUTRAL", "start": 62910, "text": "Think of a game where you'll keep asking the user for input until they type quit."}, {"confidence": 0.52923274, "end": 70990, "sentiment": "NEUTRAL", "start": 67950, "text": "You don't know how many inputs they'll give before typing quit."}, {"confidence": 0.9270525, "end": 73630, "sentiment": "POSITIVE", "start": 71230, "text": "So a while loop here is perfect."}, {"confidence": 0.6568866, "end": 77390, "sentiment": "NEUTRAL", "start": 73870, "text": "The loop continues while the input is not quit."}, {"confidence": 0.6368278, "end": 79550, "sentiment": "NEUTRAL", "start": 78430, "text": "Ah, I see."}, {"confidence": 0.8876297, "end": 87340, "sentiment": "NEUTRAL", "start": 79630, "text": "So four is for definite numbers of iterations, and while is for an indefinite number based on a condition."}, {"confidence": 0.7978796, "end": 89500, "sentiment": "POSITIVE", "start": 88140, "text": "That clears it up a lot."}, {"confidence": 0.8765485, "end": 93900, "sentiment": "NEUTRAL", "start": 89820, "text": "Could we maybe try a quick example of a while loop?"}, {"confidence": 0.5264287, "end": 94940, "sentiment": "NEUTRAL", "start": 94140, "text": "Certainly."}, {"confidence": 0.76555943, "end": 99420, "sentiment": "NEUTRAL", "start": 95340, "text": "Let's open up the editor and code a small guessing game."}, {"confidence": 0.58167315, "end": 101500, "sentiment": "NEUTRAL", "start": 99500, "text": "That's a classic while loop scenario."}]	fadd69f7-6b8f-494d-8608-9e00289772eb
2	2025-05-19 17:00:00	00:15:00	["22-3191-534"]	Individual consultation session discussing backend architecture patterns. Duration: 15 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss backend architecture patterns.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Backend architecture patterns	Explained backend architecture patterns with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	Lab 2	/uploads/session_audio_6597.wav	0.6655	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.48, "confidence_factor": 0.92, "final_score": 0.39, "negativity_ratio": 0.02, "positivity_ratio": 0.22, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.9341, "sentiment": "POSITIVE", "text": "Sample transcription segment"}]	\N
3	2025-04-04 12:45:00	1:30:00	["22-3191-534"]	Individual consultation session discussing understanding python data structures. Duration: 90 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss understanding python data structures.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Understanding Python data structures	Explained understanding python data structures with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	Library Room 1	/uploads/session_audio_4027.wav	0.7036	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.49, "confidence_factor": 0.89, "final_score": 0.37, "negativity_ratio": 0.05, "positivity_ratio": 0.12, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.7541, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
4	2025-05-28 13:45:00	00:15:00	["22-3191-534"]	Individual consultation session discussing version control with git. Duration: 15 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss version control with git.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Version control with Git	Explained version control with git with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	D204	/uploads/session_audio_2906.wav	0.5203	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.78, "confidence_factor": 0.94, "final_score": 0.66, "negativity_ratio": 0.01, "positivity_ratio": 0.26, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.9491, "sentiment": "POSITIVE", "text": "Sample transcription segment"}]	\N
5	2025-03-16 12:30:00	00:15:00	["22-3191-534"]	Individual consultation session discussing algorithm complexity analysis. Duration: 15 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss algorithm complexity analysis.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Algorithm complexity analysis	Explained algorithm complexity analysis with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	B303	/uploads/session_audio_8227.wav	0.7687	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.47, "confidence_factor": 0.93, "final_score": 0.36, "negativity_ratio": 0.01, "positivity_ratio": 0.1, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.8131, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
6	2025-03-05 14:45:00	1:30:00	["22-3191-534"]	Individual consultation session discussing database normalization concepts. Duration: 90 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss database normalization concepts.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Database normalization concepts	Explained database normalization concepts with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	Library Room 1	/uploads/session_audio_8628.wav	0.4278	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.62, "confidence_factor": 0.92, "final_score": 0.43, "negativity_ratio": 0.03, "positivity_ratio": 0.18, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.9312, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
7	2025-05-15 14:45:00	00:15:00	["22-3191-534"]	Individual consultation session discussing software testing methodologies. Duration: 15 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss software testing methodologies.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Software testing methodologies	Explained software testing methodologies with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	A201	/uploads/session_audio_8024.wav	0.3007	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.63, "confidence_factor": 0.85, "final_score": 0.33, "negativity_ratio": 0.06, "positivity_ratio": 0.19, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.7027, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
8	2025-03-31 09:15:00	00:15:00	["22-3191-534"]	Individual consultation session discussing software testing methodologies. Duration: 15 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss software testing methodologies.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Software testing methodologies	Explained software testing methodologies with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	B303	/uploads/session_audio_6692.wav	0.6545	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.8, "confidence_factor": 0.95, "final_score": 0.66, "negativity_ratio": 0.01, "positivity_ratio": 0.17, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.8355, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
9	2025-04-11 12:30:00	00:15:00	["22-3191-534"]	Individual consultation session discussing web development best practices. Duration: 15 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss web development best practices.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Web development best practices	Explained web development best practices with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	A201	/uploads/session_audio_7273.wav	0.7197	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.67, "confidence_factor": 0.82, "final_score": 0.45, "negativity_ratio": 0.08, "positivity_ratio": 0.11, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.8041, "sentiment": "POSITIVE", "text": "Sample transcription segment"}]	\N
10	2025-01-18 17:00:00	1:30:00	["22-3191-534"]	Individual consultation session discussing object-oriented programming principles. Duration: 90 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss object-oriented programming principles.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Object-oriented programming principles	Explained object-oriented programming principles with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	Lab 2	/uploads/session_audio_1495.wav	0.6237	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.55, "confidence_factor": 0.91, "final_score": 0.54, "negativity_ratio": 0.03, "positivity_ratio": 0.18, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.7177, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
11	2025-02-26 16:00:00	1:00:00	["22-3191-534"]	Individual consultation session discussing algorithm complexity analysis. Duration: 60 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss algorithm complexity analysis.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Algorithm complexity analysis	Explained algorithm complexity analysis with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	Library Room 1	/uploads/session_audio_2176.wav	0.4451	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.4, "confidence_factor": 0.81, "final_score": 0.35, "negativity_ratio": 0.08, "positivity_ratio": 0.28, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.731, "sentiment": "POSITIVE", "text": "Sample transcription segment"}]	\N
12	2025-02-01 11:45:00	00:15:00	["22-3191-534"]	Individual consultation session discussing database normalization concepts. Duration: 15 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss database normalization concepts.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Database normalization concepts	Explained database normalization concepts with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	Library Room 1	/uploads/session_audio_8117.wav	0.8759	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.76, "confidence_factor": 0.93, "final_score": 0.76, "negativity_ratio": 0.08, "positivity_ratio": 0.28, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.9348, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
13	2025-03-23 17:15:00	00:45:00	["22-3191-534"]	Individual consultation session discussing version control with git. Duration: 45 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss version control with git.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Version control with Git	Explained version control with git with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	Lab 2	/uploads/session_audio_9905.wav	0.4533	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.74, "confidence_factor": 0.82, "final_score": 0.59, "negativity_ratio": 0.03, "positivity_ratio": 0.19, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.8819, "sentiment": "POSITIVE", "text": "Sample transcription segment"}]	\N
14	2025-05-20 08:00:00	2:00:00	["22-3191-534"]	Individual consultation session discussing understanding python data structures. Duration: 120 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss understanding python data structures.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Understanding Python data structures	Explained understanding python data structures with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	B303	/uploads/session_audio_2780.wav	0.4215	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.74, "confidence_factor": 0.82, "final_score": 0.34, "negativity_ratio": 0.1, "positivity_ratio": 0.14, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.7642, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
15	2025-04-03 15:45:00	00:15:00	["22-3191-534"]	Individual consultation session discussing object-oriented programming principles. Duration: 15 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss object-oriented programming principles.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Object-oriented programming principles	Explained object-oriented programming principles with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	C105	/uploads/session_audio_1840.wav	0.6969	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.79, "confidence_factor": 0.92, "final_score": 0.49, "negativity_ratio": 0.04, "positivity_ratio": 0.21, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.8497, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
16	2025-02-01 12:15:00	00:45:00	["22-3191-534"]	Individual consultation session discussing software testing methodologies. Duration: 45 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss software testing methodologies.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Software testing methodologies	Explained software testing methodologies with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	Online	/uploads/session_audio_1694.wav	0.6408	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.41, "confidence_factor": 0.86, "final_score": 0.84, "negativity_ratio": 0.01, "positivity_ratio": 0.21, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.9052, "sentiment": "POSITIVE", "text": "Sample transcription segment"}]	\N
17	2025-03-21 14:00:00	1:00:00	["22-3191-534"]	Individual consultation session discussing api design and implementation. Duration: 60 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss api design and implementation.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	API design and implementation	Explained api design and implementation with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	A201	/uploads/session_audio_9759.wav	0.8456	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.59, "confidence_factor": 0.85, "final_score": 0.66, "negativity_ratio": 0.08, "positivity_ratio": 0.19, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.9439, "sentiment": "POSITIVE", "text": "Sample transcription segment"}]	\N
18	2025-05-04 17:00:00	1:30:00	["22-3191-534"]	Individual consultation session discussing object-oriented programming principles. Duration: 90 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss object-oriented programming principles.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Object-oriented programming principles	Explained object-oriented programming principles with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	A201	/uploads/session_audio_9999.wav	0.4469	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.69, "confidence_factor": 0.91, "final_score": 0.86, "negativity_ratio": 0.05, "positivity_ratio": 0.12, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.8153, "sentiment": "POSITIVE", "text": "Sample transcription segment"}]	\N
19	2025-05-19 17:15:00	00:45:00	["22-3191-534"]	Individual consultation session discussing algorithm complexity analysis. Duration: 45 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss algorithm complexity analysis.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Algorithm complexity analysis	Explained algorithm complexity analysis with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	B303	/uploads/session_audio_6047.wav	0.3846	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.43, "confidence_factor": 0.81, "final_score": 0.78, "negativity_ratio": 0.09, "positivity_ratio": 0.12, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.7668, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
20	2025-02-23 14:45:00	1:30:00	["22-3191-534"]	Individual consultation session discussing frontend framework usage. Duration: 90 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss frontend framework usage.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Frontend framework usage	Explained frontend framework usage with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	C105	/uploads/session_audio_2932.wav	0.5448	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.45, "confidence_factor": 0.87, "final_score": 0.47, "negativity_ratio": 0.07, "positivity_ratio": 0.3, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.7744, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
21	2025-03-17 14:45:00	2:00:00	["22-3191-534"]	Individual consultation session discussing backend architecture patterns. Duration: 120 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss backend architecture patterns.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Backend architecture patterns	Explained backend architecture patterns with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	Lab 2	/uploads/session_audio_8085.wav	0.4267	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.41, "confidence_factor": 0.8, "final_score": 0.84, "negativity_ratio": 0.09, "positivity_ratio": 0.27, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.7819, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
22	2025-05-06 16:00:00	00:15:00	["22-3191-534"]	Individual consultation session discussing frontend framework usage. Duration: 15 minutes. Good progress made on understanding the concepts.	22-3191-535	Teacher: Good morning/afternoon. Let's discuss frontend framework usage.\nStudent: Thank you for taking the time to explain this.\nTeacher: Let me walk you through the key concepts...\nStudent: That makes much more sense now.\nTeacher: Great! Do you have any other questions?\nStudent: I think I understand it better now. Thank you!	Frontend framework usage	Explained frontend framework usage with examples and practice exercises	Student demonstrated improved understanding of the topic	Session was productive. Student showed good engagement.	C105	/uploads/session_audio_3152.wav	0.8248	{"average_confidence": {"NEGATIVE": 0.1, "NEUTRAL": 0.7, "POSITIVE": 0.8}, "base_score": 0.44, "confidence_factor": 0.94, "final_score": 0.61, "negativity_ratio": 0.08, "positivity_ratio": 0.28, "sentiment_distribution": {"NEGATIVE": 5.0, "NEUTRAL": 75.0, "POSITIVE": 20.0}}	[{"confidence": 0.8918, "sentiment": "NEUTRAL", "text": "Sample transcription segment"}]	\N
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
9	14	3	Male	3A	t	22-3191-535
11	16	2	Male	3A	t	22-3191-535
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
15	22-3191-535	David Paul	Desuyo	David Paul Desuyo	desuyo.191535@wnu.sti.edu.ph	$2b$12$oNreF1f0SDa6R.ADEPnPjOhff1OYiEEjEoKWHMYvkcppuU/6YX6DC	2	faculty	f	a3cbca33-bd75-4f83-a3f7-ac469bbc65f3.png	t
14	22-3191-534	David Paul	Desuyo	David Paul Desuyo	desuyo.191534@wnu.sti.edu.ph	$2b$12$pY8c/v99mzhfdBgO1EXg0Oe/pEhiZh17MsocnnQQcj3LBJ.OoiVGi	2	student	f	\N	t
16	20-0307-133	Clark Jim	Gabiota	Clark Jim Gabiota	gabiota.307132@wnu.sti.edu.ph	$2b$12$jpEtSYkMq52z7UT/aEbDguryO1ilFl6uWUo91MNaYAssPgoLurpg6	1	student	f	\N	t
\.


--
-- Name: consultation_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consultation_sessions_id_seq', 22, true);


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

SELECT pg_catalog.setval('public.grades_id_seq', 44, true);


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

SELECT pg_catalog.setval('public.students_id_seq', 11, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 16, true);


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

