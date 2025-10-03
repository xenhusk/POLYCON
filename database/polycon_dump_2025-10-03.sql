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
-- Name: concern_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.concern_categories (
    id integer NOT NULL,
    normalized_concern character varying(500) NOT NULL,
    original_concern character varying(500) NOT NULL,
    sentencing_category character varying(300),
    general_category character varying(100),
    frequency_count integer,
    created_at timestamp without time zone DEFAULT (now() AT TIME ZONE 'UTC'::text),
    updated_at timestamp without time zone
);


ALTER TABLE public.concern_categories OWNER TO postgres;

--
-- Name: concern_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.concern_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.concern_categories_id_seq OWNER TO postgres;

--
-- Name: concern_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.concern_categories_id_seq OWNED BY public.concern_categories.id;


--
-- Name: consultation_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consultation_sessions (
    id integer,
    session_date timestamp without time zone,
    duration character varying(20),
    student_ids json,
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
    booking_id character varying(100),
    transcription_enabled boolean
);


ALTER TABLE public.consultation_sessions OWNER TO postgres;

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
-- Name: teacher_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_schedules (
    id integer NOT NULL,
    teacher_id character varying(50) NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    venue character varying(255),
    is_available boolean,
    semester_id integer,
    created_at timestamp without time zone DEFAULT (now() AT TIME ZONE 'UTC'::text),
    updated_at timestamp without time zone
);


ALTER TABLE public.teacher_schedules OWNER TO postgres;

--
-- Name: teacher_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teacher_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_schedules_id_seq OWNER TO postgres;

--
-- Name: teacher_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teacher_schedules_id_seq OWNED BY public.teacher_schedules.id;


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
-- Name: concern_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.concern_categories ALTER COLUMN id SET DEFAULT nextval('public.concern_categories_id_seq'::regclass);


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
-- Name: teacher_schedules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_schedules ALTER COLUMN id SET DEFAULT nextval('public.teacher_schedules_id_seq'::regclass);


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
2d1fdc6e-4f72-477c-ba26-9df937ff7870	Consultation		2025-06-08 14:28:00	B303	cancelled	22-3191-535	[14]	2025-06-08 14:12:37.455693	22-3191-535
01818443-8ad2-4e90-82d7-ea218f754154	Consultation		2025-06-04 16:49:00	303	cancelled	22-3191-535	[14]	2025-06-04 16:49:43.663454	22-3191-535
94b171db-39ca-4801-9e68-2aac7a7a8817	Consultation		2025-06-04 16:54:00	333	cancelled	22-3191-535	[14]	2025-06-04 16:54:13.842938	22-3191-535
96dd5de6-34a9-4857-8fa2-ae1af7614da9	Consultation		2025-06-04 17:01:00	303	cancelled	22-3191-535	[14]	2025-06-04 17:01:32.103307	22-3191-535
7c0e6258-41e4-441c-9fa4-a6339fcecd69	Consultation		2025-06-04 17:06:00	303	cancelled	22-3191-535	[14]	2025-06-04 17:06:36.710028	22-3191-535
e19e6e4e-834d-4b44-b47b-25ca1d1ffe48	Consultation		2025-06-06 17:22:00	303	cancelled	22-3191-535	[14]	2025-06-04 17:22:24.337909	22-3191-534
7e3ff71c-d7b5-434f-a518-a3c7f61a9eec	Consultation		2025-06-05 17:50:00	303	cancelled	22-3191-535	[14]	2025-06-05 17:51:03.661466	22-3191-535
213e3514-bfbb-4093-8338-71b3f5b963e8	Consultation		2025-06-26 12:58:00	B303	cancelled	22-3191-535	[14]	2025-06-08 12:53:31.522019	22-3191-534
4d50da48-b1c9-4439-8334-dac2f03f5fcd	Consultation		2025-06-14 10:06:00	303	cancelled	22-3191-535	[14]	2025-06-05 17:51:51.312819	22-3191-534
21f0aca8-15fe-4468-9287-714d9182baa9	Consultation		2025-06-04 16:35:00	505	cancelled	22-3191-535	[14]	2025-06-04 16:20:43.58626	22-3191-535
51931f21-6f7b-4a63-a755-57e5fbae1d70	Consultation		2025-06-08 13:13:00	B444	cancelled	22-3191-535	[14]	2025-06-08 13:13:26.763088	22-3191-534
39cd9305-7a0e-4dd8-870e-a4055ba1fc7e	Consultation		2025-06-08 12:45:00	B303	cancelled	22-3191-535	[14]	2025-06-08 12:35:25.931728	22-3191-535
TEST_F50FF0FA	\N	\N	2025-06-08 06:04:38.755807	Test Room	confirmed	F2024004	[9, 12]	2025-06-08 13:54:38.759536	SCHEDULER_TEST
d4ba5877-9e11-49de-85bd-717486b92507	Consultation		2025-06-08 12:45:00	B303	cancelled	22-3191-535	[14]	2025-06-08 12:25:31.749568	22-3191-534
13e71ca9-97c4-414a-a7b3-02c1e9d94385	Consultation		2025-06-08 12:56:00	B303	cancelled	22-3191-535	[14]	2025-06-08 12:32:37.023834	22-3191-534
a9c48889-1c3f-4881-ba87-5e658ca55323	Consultation		2025-06-08 14:17:00	B303	cancelled	22-3191-535	[14]	2025-06-08 13:59:19.484223	22-3191-534
0622f307-48d1-4aba-9fec-58b184e652c6	Consultation		2025-06-08 14:11:00	B303	cancelled	22-3191-535	[14]	2025-06-08 14:11:44.121869	22-3191-535
TEST_SCHEDULER_5MIN_1749337721	Mathematics	Test appointment for 5 minutes from now	2025-06-08 07:08:41.851304	Room 101	confirmed	F2024001	[6]	2025-06-08 15:03:41.848738	\N
TEST_SCHEDULER_10MIN_1749338021	Physics	Test appointment for 10 minutes from now	2025-06-08 07:13:41.851304	Room 102	confirmed	F2024001	[6]	2025-06-08 15:03:41.848738	\N
TEST_SCHEDULER_20MIN_1749338621	Chemistry	Test appointment for 20 minutes from now	2025-06-08 07:23:41.851304	Room 103	confirmed	F2024001	[6]	2025-06-08 15:03:41.848738	\N
9a16fa26-6632-49c5-9333-d36c639798bb	Consultation		2025-06-08 15:24:00	555	cancelled	22-3191-535	[14]	2025-06-08 15:08:48.750126	22-3191-535
47c01f6f-cb64-4fb7-9819-09311f7f8e79	Consultation		2025-06-08 15:41:00	565	cancelled	22-3191-535	[14]	2025-06-08 15:25:31.513521	22-3191-535
813495ac-6868-4e1c-a2a4-fa4a5aca7192	Consultation		2025-06-08 15:44:00	808	cancelled	22-3191-535	[14]	2025-06-08 15:28:55.078299	22-3191-535
49da52c7-02da-4c64-902e-5af3961c26bc	Consultation		2025-06-08 15:47:00	dassd	cancelled	22-3191-535	[14]	2025-06-08 15:31:44.609765	22-3191-535
6b6481d1-69a3-4486-8861-2bc47ea6055d	Consultation		2025-06-08 15:55:00	454	cancelled	22-3191-535	[14]	2025-06-08 15:39:20.936521	22-3191-535
2c7b99e2-f830-436d-b78a-2e9f59e62be9	Consultation		2025-06-08 16:24:00	404	cancelled	22-3191-535	[14]	2025-06-08 16:07:43.078486	22-3191-535
9aafd090-6b6d-4fc1-aa2f-7bd914699308	Consultation		2025-06-08 15:57:00	444	cancelled	22-3191-535	[14]	2025-06-08 15:41:57.296925	22-3191-535
e3e1ef51-4206-4aa6-af47-309fe3689ade	Consultation		2025-06-08 16:41:00	sads	cancelled	22-3191-535	[14]	2025-06-08 16:25:22.093522	22-3191-535
4e1fbb39-7154-4dcd-9c98-ae4508e54488	Consultation		2025-06-08 16:45:00	4555	cancelled	22-3191-535	[14]	2025-06-08 16:29:26.8009	22-3191-535
40dfe81f-ae80-42ef-92fd-3bbf3ba5f659	Consultation		2025-06-08 17:03:00	444	cancelled	22-3191-535	[14]	2025-06-08 16:47:58.322441	22-3191-535
9ffb437b-fbd3-49d2-b033-2bde9a1775a6	Consultation		2025-06-08 17:25:00	444	cancelled	22-3191-535	[14]	2025-06-08 17:09:23.158104	22-3191-535
6a4a2479-2c19-45a3-9c9c-332f57121770	Consultation		2025-06-08 17:30:00	444	cancelled	22-3191-535	[14]	2025-06-08 17:14:17.195631	22-3191-535
503ea3cb-47f8-44b4-8d3a-f4ebc6c1e9a5	Consultation		2025-06-08 17:43:00	444	cancelled	22-3191-535	[14]	2025-06-08 17:27:06.361192	22-3191-535
be7673cd-2483-4fcb-bbd3-e4e8618b6d2b	Consultation		2025-06-08 17:55:00	ii	cancelled	22-3191-535	[14]	2025-06-08 17:39:25.580691	22-3191-535
e7e37a37-141a-4986-996b-ff5b642c1a37	Consultation		2025-06-08 18:10:00	444	cancelled	22-3191-535	[14]	2025-06-08 17:54:47.951237	22-3191-535
056d57fa-5f2b-4c26-a6ef-374d50368c9b	Consultation		2025-06-08 18:18:00	333	cancelled	22-3191-535	[14]	2025-06-08 18:02:30.284842	22-3191-535
5a853ca6-2239-45f7-ab75-d6ad6239217c	Consultation		2025-06-08 18:24:00	444	cancelled	22-3191-535	[14]	2025-06-08 18:09:03.098894	22-3191-535
63e2e220-ad08-495a-b966-c2de387e49fe	Consultation		2025-06-08 19:11:00	33	cancelled	22-3191-535	[14]	2025-06-08 18:11:38.121929	22-3191-535
e27a16b2-a1b8-4617-9cc4-194218802aed	Consultation		2025-06-08 18:25:00	111	cancelled	22-3191-535	[14]	2025-06-08 18:09:21.327418	22-3191-535
84e66040-524d-44f9-8b2a-075643c78788	Consultation		2025-06-08 19:49:00	aa	cancelled	22-3191-535	[14]	2025-06-08 19:48:00.716283	22-3191-534
91142c03-7c80-447c-8752-24027ffcd75b	Consultation		2025-06-08 18:41:00	222	cancelled	22-3191-535	[14]	2025-06-08 18:24:33.95618	22-3191-535
aa17be72-f3c2-4b47-8fbe-103c7c752800	\N	\N	2025-06-08 18:48:04.497277	TEST ROOM 999	cancelled	22-3191-535	[21]	2025-06-08 18:31:04.497277	\N
e077980c-78ec-44ec-8e80-2c9e83dd3dbd	Consultation		2025-06-08 18:58:00	111	cancelled	22-3191-535	[14]	2025-06-08 18:40:21.849465	22-3191-535
7e92f452-78d4-4d31-af20-563822d06cb1	Consultation		2025-06-08 19:10:00	333	cancelled	22-3191-535	[14]	2025-06-08 18:37:51.47989	22-3191-535
5ba46ec6-d9e7-47f2-b92f-f81a8d00446b	Consultation		2025-06-08 19:14:00	333	cancelled	22-3191-535	[14]	2025-06-08 19:49:42.42333	22-3191-534
e01113ff-cfb0-424a-8e77-153e3d800ce5	Consultation		2025-06-08 19:17:00	222	cancelled	22-3191-535	[14]	2025-06-08 19:01:24.949516	22-3191-535
4305ed24-4a0b-4675-99d6-535c891ae027	Consultation		2025-06-08 19:35:00	100	cancelled	22-3191-535	[14]	2025-06-08 19:18:45.255976	22-3191-535
438e45e3-d9ea-4289-9c5e-d46945e156d9	Consultation		2025-06-08 19:44:00	111	cancelled	22-3191-535	[14]	2025-06-08 18:42:17.51247	22-3191-535
8dc6c6b1-bfbb-4dfa-b467-4b81d708ba89	Consultation		2025-06-08 19:46:00	111	cancelled	22-3191-535	[14]	2025-06-08 19:30:49.795353	22-3191-535
eab1a0ce-90ac-4866-886d-d4c2e32159a6	Consultation		2025-06-08 19:48:00	111	cancelled	22-3191-535	[14]	2025-06-08 19:31:56.052244	22-3191-535
a309b303-31bc-48ec-bf84-5d649423d2a1	Consultation		2025-06-08 19:59:00	111	cancelled	22-3191-535	[14]	2025-06-08 19:42:27.2435	22-3191-535
3543286f-5eee-40e9-b7c0-63331901e5db	Consultation		2025-06-09 14:07:00	B303	completed	22-3191-535	[8]	2025-06-09 14:07:50.492272	22-3191-535
9d9760fd-0a37-422c-a5c7-9ef7a3c85177	Consultation		2025-06-10 17:57:00	808	confirmed	22-3191-535	[14]	2025-06-09 17:57:28.628103	22-3191-535
f1794916-8d63-45fb-b381-75c3a87decf2	Consultation		2025-07-01 13:56:00	505	confirmed	22-3191-535	[14]	2025-07-01 13:57:06.310845	22-3191-535
a0f5564e-c75d-4c0b-a82e-9f13d191ea40	Consultation		2025-06-09 11:01:00	303	completed	22-3191-535	[14]	2025-06-09 10:44:10.507345	22-3191-534
219897d3-cbc8-48a1-b998-a13a8d5b46bc	Consultation		2025-09-05 04:16:00	B303	confirmed	22-3191-535	[14]	2025-09-05 12:15:42.758611	22-3191-535
\.


--
-- Data for Name: concern_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.concern_categories (id, normalized_concern, original_concern, sentencing_category, general_category, frequency_count, created_at, updated_at) FROM stdin;
58	battling currently interfering issue serious study time	I am currently battling a serious issue that is interfering with my study time.	Needing inspiration and a renewed sense of motivation within their academic pursuits.	Mental Health	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
59	before exam hard impacts night performance sleeping time which	I have a hard time sleeping the night before an exam, which impacts my performance.	Finding the chemistry course content and chemical reactions difficult to comprehend.	Academic Performance	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
60	affecting comparison confidence feel inadequate older sibling succeeding	My older sibling is succeeding and I feel inadequate in comparison, affecting my confidence.	Facing a significant personal issue interfering with and disrupting study time.	Other	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
61	already comparing failure feel keep like older parents sibling working	My parents keep comparing me to my older sibling who is already working, and I feel like a failure.	Experiencing sleep disturbances negatively impacting exam performance and focus.	Health	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
125	bad break can checking developed during habit lectures phone seem	I have developed a bad habit of checking my phone during lectures and can't seem to break it.	Feelings of inadequacy related to perceived slower comprehension of concepts.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
126	balancing classes demanding difficult internship really senior time year	I have a really difficult time balancing my demanding internship with my senior year classes.	Falling behind on assignments and course material in an English class.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
135	after anxiety feel find good graduation job much paralyzed pressure	I feel so much pressure to find a good job after graduation that I'm paralyzed with anxiety.	Loss of interest in current major coupled with uncertainty about alternatives.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
136	considering cost course dropping lab overwhelmed science textbooks	I am so overwhelmed by the cost of textbooks, I'm considering dropping my science lab course.	Anxiety regarding the ability to secure internships in a desired field.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
220	academic affecting everyday psychological state tasks	My psychological state is affecting my everyday academic tasks.	\N	Health	13	2025-08-27 03:50:28.669727	2025-09-07 10:22:20.896288
221	academic grades probation semester tanked	I'm on academic probation; my grades just tanked this semester.	\N	Personal	13	2025-08-27 03:50:28.669727	2025-09-07 10:22:20.896288
57	balance constantly coursework demanding feel guilty life med pre social struggling	I'm struggling to balance my social life with my demanding pre-med coursework and feel constantly guilty.	Lacking motivation and interest in current academic program curriculum.	Mental Health	115	2025-08-21 03:57:32.744273	2025-08-24 11:50:16.104487
229	academic causing expectations reality stress versus	Academic expectations versus reality is causing me stress	\N	Personal	7	2025-09-10 02:39:21.179806	2025-09-23 04:29:51.17696
230	expected level myself not performing	I'm not performing at the level I expected myself to.	\N	Personal	7	2025-09-10 02:39:21.179806	2025-09-23 04:29:51.17696
231	affect grades transcript worry	My grades are a worry; how will this affect my transcript?	\N	Personal	7	2025-09-10 02:39:21.179806	2025-09-23 04:29:51.17696
232	aren effort grades putting reflecting	My grades aren't reflecting the effort I'm putting in.	\N	Academic	7	2025-09-10 02:39:21.179806	2025-09-23 04:29:51.17696
233	during exam fear overwhelming presentations situations	Overwhelming fear during presentations and exam situations.	\N	Academic	7	2025-09-10 02:39:21.179806	2025-09-23 04:29:51.17696
234	classes expected falling short	Am I falling short of what's expected in my classes?	\N	Personal	7	2025-09-10 02:39:21.179806	2025-09-23 04:29:51.17696
235	always before deadlines means nighters off putting things which	I'm always putting things off, which means all-nighters before deadlines.	\N	Personal	7	2025-09-10 02:39:21.179806	2025-09-23 04:29:51.17696
236	ability concentrate disrupting emotional issues	Emotional issues are disrupting my ability to concentrate.	\N	Academic	7	2025-09-10 02:39:21.179806	2025-09-23 04:29:51.17696
226	burnt completely coursework drained emotionally got out	Coursework's got me completely drained; I'm burnt out emotionally.	\N	Other	7	2025-09-10 02:39:21.179806	2025-09-23 04:29:51.17696
227	balancing classes clubs feels impossible time wise	Balancing clubs and classes feels impossible, time-wise!	\N	Personal	7	2025-09-10 02:39:21.179806	2025-09-23 04:29:51.17696
228	center could counseling help know really use	I could really use some help from the counseling center, you know?	\N	Personal	7	2025-09-10 02:39:21.179806	2025-09-23 04:29:51.17696
1	test	Test	General academic and personal concerns requiring attention	Academic Performance	154	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
115	about conflict focus hard having levels making night noise roommate studying	My roommate and I are having a conflict about noise levels, making it hard to focus on studying at night.	Overwhelm and academic anxiety related to a significant research paper.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
116	about exam failing final grade huge portion statistics which worried worth	I'm worried about failing my final exam in statistics, which is worth a huge portion of my grade.	Difficulty with essay structure and organization in literature assignments.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
117	amount calculus class feeling information overwhelmed pre sheer	I’m feeling overwhelmed by the sheer amount of information in my pre-calculus class.	Roommate conflict impacting focus and concentration on studying.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
118	academic affects concerned enough getting not performance sleep which	I am concerned that I'm not getting enough sleep, which affects my academic performance.	High-stakes exam anxiety related to a significant percentage of the grade.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
119	classes comparing computer doubt experiencing lot myself peers science self unfavorably	I'm experiencing a lot of self-doubt and comparing myself unfavorably to my peers in my computer science classes.	Overwhelm with the volume of information presented in pre-calculus class.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
120	academic affecting battling currently insomnia lack negatively performance sleep	I am currently battling insomnia and the lack of sleep is negatively affecting my academic performance.	Academic performance impacted by insufficient sleep and sleep disruption.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
67	about accidentally cite plagiarizing properly sources trouble understanding worried	I have trouble understanding how to properly cite sources, and I'm worried about accidentally plagiarizing.	Difficulty connecting with instructors and asking questions for clarification.	Social Issues	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
68	between causing don effectively feel grades know like manage socializing studying suffer time	I feel like I don't know how to effectively manage my time between studying and socializing, causing my grades to suffer.	Experiencing depression and unmotivation impacting class attendance and engagement.	Mental Health	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
121	end even focused hard interesting lectures out staying time topic zoning	I have a hard time staying focused in lectures and end up zoning out, even when the topic is interesting.	Self-doubt and unfavorable social comparison in computer science coursework.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
34	challenging complex equations experiments laboratory physics	Complex physics equations and laboratory experiments challenging	Feeling overwhelmed by the demands of statistics and data analysis coursework.	Academic Performance	101	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
122	afraid can disappoint don even expectations family manage parents think though	I am afraid that I will disappoint my parents and family, even though I don't think I can manage the expectations.	Academic performance suffering due to insomnia and sleep deprivation.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
123	because concepts else everyone feel inadequate quickly really seems understand	I feel really inadequate because everyone else seems to understand the concepts more quickly.	Difficulty maintaining focus and attention during lectures and presentations.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
222	focus hard making mental state studies	My mental state is making it hard to focus on studies.	\N	Financial	21	2025-08-27 03:50:29.692162	2025-09-23 04:29:51.17696
237	activities difficulties emotional interfering regular	Emotional difficulties are interfering with my regular activities.	\N	Academic	7	2025-09-10 02:39:22.407785	2025-09-23 04:29:52.468036
238	brutal complex everyone experiments physics problems those	Are those complex physics problems and experiments just brutal for everyone?	\N	Personal	7	2025-09-10 02:39:22.407785	2025-09-23 04:29:52.468036
239	academics can pressure relax seem wound	Academics have me wound up; I can't seem to relax with all this pressure.	\N	Academic	7	2025-09-10 02:39:22.407785	2025-09-23 04:29:52.468036
240	anyone assignments depleted drowning else feeling utterly	Is anyone else drowning in assignments and feeling utterly depleted?	\N	Academic	7	2025-09-10 02:39:22.407785	2025-09-23 04:29:52.468036
241	academic anxiety evaluations face spikes whenever	My anxiety spikes whenever I face academic evaluations.	\N	Personal	7	2025-09-10 02:39:22.407785	2025-09-23 04:29:52.468036
242	anyone because cramming cycle delaying does else struggle tasks	Does anyone else struggle with the cramming cycle because of delaying tasks?	\N	Academic	7	2025-09-10 02:39:22.407785	2025-09-23 04:29:52.468036
243	academic demands keep struggling unfortunately	I'm struggling to keep up with the academic demands, unfortunately.	\N	Personal	7	2025-09-10 02:39:22.407785	2025-09-23 04:29:52.468036
244	academic interest losing program	Losing interest in my academic program	\N	Personal	7	2025-09-10 02:39:22.407785	2025-09-23 04:29:52.468036
245	equations lab physics struggling work	I'm struggling with both the physics equations *and* the lab work.	\N	Personal	7	2025-09-10 02:39:22.407785	2025-09-23 04:29:52.468036
246	academic focus health interfering mental struggles	Mental health struggles are interfering with my academic focus.	\N	Academic	7	2025-09-10 02:39:22.407785	2025-09-23 04:29:52.468036
21	coursework feeling overwhelmed personal responsibilities	Feeling overwhelmed with coursework and personal responsibilities	Self-doubt and confidence issues affecting classroom participation and engagement.	Mental Health	152	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
22	assignments deadlines difficulty multiple prioritizing project	Difficulty prioritizing multiple assignments and project deadlines	Difficulties navigating academic workload and the perceived course difficulty.	Time Management	210	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
23	gpa maintaining required scholarship struggling student	Student struggling with maintaining required GPA for scholarship	Overwhelmed by coursework, personal responsibilities, and time management demands.	Financial	152	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
24	activities allocation between poor sessions study time	Poor time allocation between study sessions and other activities	Difficulty with prioritizing and managing assignment deadlines and project completion.	Time Management	248	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
11	materials organization problems schedules study	Organization problems with study materials and schedules	Inefficient study habits and productivity issues hindering academic achievement.	Time Management	210	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
69	afraid ask because class difficult find front peers questions sounding stupid	I find it difficult to ask questions in class because I'm afraid of sounding stupid in front of my peers.	Difficulty understanding proper source citation and potential plagiarism concerns.	Academic Performance	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
70	bills feel job like money need part pay time time wasting	I feel like I'm wasting my time with my part-time job, but I need the money to pay my bills.	Struggles with time management between study and social life impacting grades.	Time Management	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
72	close college feeling friends haven isolated lonely made since starting	I'm feeling lonely and isolated; I haven't made any close friends since starting college.	Fear of judgment in class impacting participation and information-seeking behavior.	Mental Health	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:19.173302
124	about assignments behind behind class consistently english falling further worry	I'm consistently behind on my assignments in my English class and worry about falling further behind.	Fear of parental disappointment creating pressure and performance anxiety.	Family	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
223	anxiety public severe situations speaking testing trigger	Public speaking and testing situations trigger severe anxiety.	\N	Other	11	2025-08-27 03:50:30.431542	2025-09-07 10:22:22.647658
224	daily disrupting health mental routine struggles study	Mental health struggles are disrupting my daily study routine.	\N	Other	11	2025-08-27 03:50:30.431542	2025-09-07 10:22:22.647658
225	academic bad grades probation trouble ugh	Ugh, I'm in trouble – academic probation for bad grades.	\N	Health	11	2025-08-27 03:50:30.431542	2025-09-07 10:22:22.647658
19	affecting classroom confidence issues participation self	Self-confidence issues affecting classroom participation	Difficulties balancing work responsibilities with academic commitments and studies.	Mental Health	152	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
20	academic challenges course difficulty workload	Challenges with academic workload and course difficulty	Experiencing anxiety attacks during assessment and presentation situations.	Academic Performance	248	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
247	affecting dealing gpa grades multiple overall poor subjects	I'm dealing with poor grades in multiple subjects affecting overall gpa	\N	Other	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
248	equations labs overwhelming physics right seriously those wow	Wow, physics labs and those equations are seriously overwhelming, right?	\N	Other	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
249	attacks confronted exams get panic speaking	I get panic attacks when confronted with exams or speaking.	\N	Academic	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
250	belief grades myself really struggling tanking	I'm struggling; my belief in myself is really tanking my grades.	\N	Academic	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
251	can keeps mind stay study track wandering while	My mind keeps wandering; how can I stay on track while I study?	\N	Health	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
252	absolutely analysis data drowning right stats	Stats and data analysis is absolutely drowning me right now!	\N	Personal	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
253	coding complex concepts confuse data methods organization	Complex coding concepts and data organization methods confuse me.	\N	Academic	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
254	commitment current questioning studies	Questioning my commitment to current studies	\N	Academic	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
255	difficult equations experiments finding honestly incredibly physics	Finding the physics equations and experiments incredibly difficult, honestly.	\N	Health	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
256	four here variations	Here are four variations:	\N	Academic	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
257	anymore distant even feel goals want	My goals feel distant; is this even what I want anymore?	\N	Personal	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
258	crushing emotionally honestly mentally semester	Honestly, this semester is crushing me emotionally and mentally.	\N	Other	7	2025-09-10 02:39:23.85717	2025-09-23 04:29:53.623295
73	after cover enough expenses graduation jobs living pay qualified won worried	I'm worried that the jobs I'm qualified for after graduation won't pay enough to cover my living expenses.	Utilizing student loans for basic living expenses creating financial hardship.	Financial	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:19.173302
74	assignments behind class english falling further having keeping readings trouble	I am having trouble keeping up with the readings in my English class, and I'm falling further behind on my assignments.	Feeling lonely and isolated due to lack of friendships in the college environment.	Social Issues	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:19.173302
75	causing difficult emotional lot parent relationship stress	I have a difficult relationship with a parent, and it's causing a lot of emotional stress.	Worrying about job prospects after graduation and sufficient future income.	Career	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:19.173302
76	anxiety career causing experiencing family lot lot not path pressure pursue specific want which	I'm experiencing a lot of pressure from my family to pursue a specific career path, but it's not what I want to do, which is causing me a lot of anxiety.	Falling behind on assigned readings and assignments in English coursework.	Academic Performance	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:19.173302
77	assignments because class coding crashing during hard having keeps laptop learning material old programming time	I'm having a hard time learning the material in my programming class because my laptop is old and keeps crashing during coding assignments.	Difficult relationship with a parent causing significant emotional distress.	Family	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
105	cope exam not pressure season stress sure upcoming	I'm not sure how to cope with the stress and pressure of the upcoming exam season.	Feeling suffocated by parental involvement, hindering their focus.	Family	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
149	accounting behind class falling feeling immense parents pressure succeed	I am feeling immense pressure to succeed from my parents, but I am falling behind in my accounting class.	Struggling with the online learning format impacting learning comprehension.	Technology	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
150	amount biology class don failing introductory know material sheer study	I am failing my introductory biology class and don't know how to study the sheer amount of material.	Difficulty focusing in online courses due to distractions, leading to missed deadlines.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
151	anxiety calculus exam find making motivation struggling study worse	I am struggling to find motivation to study for my Calculus exam, and my anxiety is making it worse.	Academic performance pressure from parents coupled with falling grades.	Family	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
152	anxious classroom discourse making navigate not political sure	I'm not sure how to navigate the political discourse in my classroom, and it's making me anxious.	Failing introductory biology and struggling with the amount of material to study.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
153	experiencing financial lot manage not spending stress sure	I'm experiencing a lot of financial stress, and I am not sure how to manage my spending.	Lack of motivation for calculus exam preparation compounded by anxiety.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
154	being emotional family huge ill member seriously taking toll well	I have a family member who is seriously ill, and it's taking a huge toll on my emotional well-being.	Anxieties related to classroom political discussions affecting participation.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
259	about academic anxiety consuming performance	Anxiety about academic performance is consuming	\N	Other	7	2025-09-10 02:39:24.650933	2025-09-23 04:29:54.508584
260	about academic future implications standing stressed	I'm stressed about my academic standing and its future implications.	\N	Academic	7	2025-09-10 02:39:24.650933	2025-09-23 04:29:54.508584
261	concentrating difficulties due emotional having trouble	I'm having trouble concentrating due to emotional difficulties.	\N	Academic	7	2025-09-10 02:39:24.650933	2025-09-23 04:29:54.508584
262	dealing final grades impacting low performance quiz scores test	I'm dealing with low test scores and quiz performance impacting final grades	\N	Academic	7	2025-09-10 02:39:24.650933	2025-09-23 04:29:54.508584
112	ability build confident connections network not professionals	I am not confident in my ability to network and build connections with professionals.	Experiencing burnout and a decline in motivation for academic pursuits.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
114	assignments classes essay idea literature structure	I have no idea how to structure my essay assignments in my literature classes.	Lack of confidence in networking skills for professional relationship building.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
127	about anxious applications extremely feeling future graduate gres school upcoming	I have been feeling extremely anxious about the upcoming GREs and my future graduate school applications.	Unhelpful habits of phone usage and its detrimental effect on attention.	Technology	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
128	commitments completely packed saying schedule trouble	I have trouble saying "no" to commitments, and now my schedule is completely packed.	Balancing internships with demanding senior year coursework is a struggle.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
129	chemistry class fast finding keep material pace	I'm finding the pace of my chemistry class too fast to keep up with the material.	Significant anxiety regarding upcoming standardized tests and future applications.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
131	able afraid after degree find graduation job related won	I'm afraid I won't be able to find a job after graduation related to my degree.	The fast pace of chemistry class is challenging for content comprehension.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
132	family friends homesickness missing struggling	I'm struggling with homesickness and missing my family and friends.	Challenges in note-taking and assignment organization affecting studying.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
133	else feel interest like losing major not sure would	I feel like I am losing interest in my major, but I'm not sure what else I would do.	Career uncertainty and fear of unemployment after graduation in the field.	Other	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
31	academic affecting daily high levels performance stress	High levels of academic stress affecting daily performance	Seeking to develop skills needed for the competitive job market and career.	Mental Health	126	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
134	able field find interest internship scared won	I'm scared that I won't be able to find an internship in my field of interest.	Homesickness affecting emotional well-being and academic performance.	Other	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
78	because classes consistently late manage schedule sleep struggling time wake	I'm consistently late to my classes, because I'm struggling to wake up on time and manage my sleep schedule.	Family pressure to pursue a specific career conflicting with student's aspirations.	Family	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
80	balance between difficult find finding hobbies life personal social studies	I'm finding it difficult to find a balance between my studies, social life, and personal hobbies.	Technical issues with computer hindering programming class assignments and learning.	Technology	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
81	accommodations disability get learning need struggling university	I have a learning disability and I'm struggling to get the accommodations I need from the university.	Consistent tardiness due to difficulty with waking up and getting to class.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
89	adhd diagnosed effectively focusing having lectures managing time trouble	I have been diagnosed with ADHD, and I'm having trouble focusing in my lectures and managing my time effectively.	Fear of disappointing their parents in their pursuit of a graduate education.	Financial	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
90	about anxious class failing feeling possibility really statistics	I am feeling really anxious about the possibility of failing my statistics class.	Concerns about applying their degree to secure a job after graduation.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
163	activities balancing burnt coursework exhausted extracurricular feel having job out part starting time trouble	I am having trouble balancing my part-time job, my coursework, and my extracurricular activities, and I’m starting to feel exhausted and burnt out.	Difficulties in focus due to conflicting internship offers and academic demands.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
164	aren because behind calculus can class clicking concepts falling grasp integration lectures professor seriously	I am seriously falling behind in my Calculus II class because I just can't grasp the concepts of integration, and the professor's lectures aren't clicking for me.	Time management challenges and its negative influence on academic performance.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
165	anxiety classes experiencing impacting math performance significant test	I'm experiencing significant test anxiety that's impacting my performance in my math classes.	Balancing multiple responsibilities, leading to exhaustion and burnout symptoms.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
166	can courses feel get history load overwhelmed reading seem through	I feel overwhelmed by the reading load in my history courses and can't seem to get through it all.	Struggles with advanced calculus concepts leading to potential failure.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
167	class having keeping literature reading trouble	I am having trouble keeping up with the reading for my literature class.	Test anxiety significantly hindering performance in mathematics assessments.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
5	academic achievement expectations meeting not personal	Academic achievement not meeting personal expectations	Elevated stress and anxiety levels negatively impact academic performance and well-being.	Academic Performance	101	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
13	academic advising general planning program	General academic advising and program planning	Organizational deficits impacting study material management and schedule adherence.	Career	75	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
38	cramming last leading minute problems procrastination	Procrastination problems leading to last-minute cramming	Seeking access to psychological support and counseling services.	Time Management	75	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
45	final grades impacting low performance quiz scores test	Low test scores and quiz performance impacting final grades	Poor performance in multiple courses negatively affecting the overall GPA.	Academic Performance	82	2025-08-20 11:25:39.930663	2025-09-23 04:29:52.468036
10	about academic concerns impact record transcript	Concerns about academic record and transcript impact	Emotional wellbeing challenges disrupting concentration and academic functioning.	Academic Performance	114	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
39	academic failing meet requirements standards	Failing to meet academic requirements and standards	Seeking clarification on graduation requirements and university academic policies.	Academic Performance	88	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
41	difficulty gpa maintaining required scholarship	Difficulty maintaining required GPA for scholarship	Failing to satisfy academic standards and meet program requirements.	Financial	127	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
91	ability attend classes health impacting issue regularly struggling which	I'm struggling with a health issue, which is impacting my ability to attend classes regularly.	ADHD diagnosis impacting focus and time management in lectures and study.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
92	causing difficulties distress facing family financial which	I am facing some family financial difficulties, which is causing me distress.	High anxiety related to the possibility of failing the statistics course.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
93	about after anxiety career choosing experiencing graduation lot path	I am experiencing a lot of anxiety about choosing a career path after graduation.	Experiencing a health issue which is preventing regular class attendance.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
94	because behind classes falling feel internet online service slow	I feel that I am falling behind in my online classes because I have slow internet service.	Family financial difficulties causing distress and impacting their focus.	Financial	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
95	about because developing disorder eating family pressure shape stay worried	I am worried about developing an eating disorder because of the pressure of my family to stay in shape.	Experiencing significant anxiety when considering potential career paths.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
96	constant family feel habits health impacting mental negatively pressure study succeed which	I feel constant pressure to succeed from my family, which is negatively impacting my mental health and study habits.	Experiencing academic challenges due to poor internet service in online courses.	Technology	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
16	coursework emotionally exhausted feeling overwhelmed	Feeling overwhelmed and emotionally exhausted from coursework	Mental health issues impacting daily functioning and academic performance.	Mental Health	113	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
17	balance issues job life part studies time work	Work-life balance issues with part-time job and studies	Issues with enrollment, documentation, or administrative procedures.	Time Management	75	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
33	activities allocation challenges extracurricular time	Time allocation challenges with extracurricular activities	Experiencing high levels of stress impacting overall academic performance.	Time Management	75	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
36	counseling need psychological services support	Need for psychological support and counseling services	Finding physics coursework and lab experiments challenging to comprehend.	Mental Health	75	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
27	algorithms data difficulty programming structures understanding	Difficulty understanding programming algorithms and data structures	Challenges in effectively allocating time between studies and other activities.	Academic Performance	140	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
169	ability difficult focus handle impacting not roommate situation sure work	I'm not sure how to handle my difficult roommate situation, and it's impacting my ability to focus on my work.	Difficulty keeping up with the required reading for a literature course.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
18	anxiety attacks during exams presentations	Anxiety attacks during exams and presentations	Feeling overwhelmed and emotionally drained from the demands of coursework.	Mental Health	153	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
9	habits inefficient issues productivity study	Productivity issues and inefficient study habits	Academic probation status due to unsatisfactory academic performance and progress.	Time Management	75	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
171	affecting confidence family feel getting like need not support	I feel like I'm not getting the support I need from my family, and it's affecting my confidence.	Challenges managing a difficult roommate situation and its impact on focus.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
7	academic academic due poor probation standing	Academic probation due to poor academic standing	Academic performance falling short of personal and educational aspirations.	Academic Performance	101	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
8	affecting concentration concerns emotional wellbeing	Emotional wellbeing concerns affecting concentration	Information seeking regarding university facilities and student services.	Mental Health	114	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
14	daily functioning health impacting issues mental	Mental health issues impacting daily functioning	Lack of motivation and disinterest in the current academic program of study.	Mental Health	140	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
37	about academic graduation policies questions requirements	Questions about graduation requirements and academic policies	Low self-esteem and lack of self-confidence affecting overall performance.	Other	88	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
172	about because can concentrate health mother studies worrying	I can't concentrate on my studies because I'm worrying about my mother's health.	Concerns regarding the development of appropriate skills for the job market.	Family	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
173	anxiety anything blank can completely course crippling diagnosed during exams history out remember studied test	I have been diagnosed with test anxiety, and it's completely crippling me during exams in my history course; I blank out and can't remember anything I studied.	Lack of family support impacting confidence and self-esteem in academics.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
174	class concentrate finding hard insomnia struggling	I am struggling with insomnia and finding it hard to concentrate in class.	Worries about a parent's health and its negative impact on studying.	Family	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
175	about constantly focus hard history month next paying readings rent worried	I am constantly worried about paying next month's rent, and it's hard to focus on my History readings.	Severe test anxiety leading to memory blocks during history exams.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
188	classes don effectively know lecture notes take	I don't know how to effectively take notes in my lecture classes.	Hesitancy in seeking academic help hinders learning and academic progress.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
189	aren class communications group members project pulling weight	I have a group project in my communications class and the other members aren't pulling their weight.	Overwhelmed by excessive academic workload, including assignments and coursework demands.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
191	academics balance life not prioritize social struggling studies sure	I'm not sure how to balance social life and academics, and I'm struggling to prioritize my studies.	Challenges with group project dynamics, specifically inequitable contribution from peers.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
192	because financial focused pressures stay struggling studies	I am struggling to stay focused on my studies because of my financial pressures.	Difficulty in interacting with professors, inhibiting help-seeking and academic support.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
2	affecting planning poor productivity scheduling skills	Poor scheduling and planning skills affecting productivity	General academic and personal concerns requiring attention	Time Management	83	2025-08-20 11:25:39.930663	2025-09-23 04:29:51.17696
97	becoming demands doctor expectations not overwhelmed suited sure	I am overwhelmed with the expectations of becoming a doctor and am not sure if I'm suited for the demands.	Concerns about developing an eating disorder due to family pressure to be in shape.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
98	about after causing declare don graduation know lot major not passionate pressure something stress want worried	I'm worried that I don't know what I want to do after graduation, and the pressure to declare a major in something I’m not passionate about is causing me a lot of stress.	Family pressure for achievement creating mental health and study habit struggles.	Family	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
99	amount behind feel overwhelmed project required research starting work	I'm behind on a research project, and I'm starting to feel overwhelmed by the amount of work required.	Feeling overwhelmed by the expectations of becoming a doctor.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
100	constantly distracted dorm find myself phone room study trying	I find myself constantly distracted by my phone when I'm trying to study in my dorm room.	Unsure of a major, pressure, and a lack of passion causing significant stress.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
101	after attending class computer concepts even having hours office programming science trouble understanding	I'm having trouble understanding the programming concepts in my computer science class, even after attending office hours.	Falling behind on a research project and feeling overwhelmed by the workload.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
102	about drop financially having help jobs lost out parents support worried	My parents lost their jobs, and now I'm worried about having to drop out to help support them financially.	Constantly distracted by their phone while trying to study in their dorm.	Technology	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
103	calling checking feel grades keeps making mom study suffocated unable	My mom keeps calling me, checking on my grades, and it's making me feel suffocated and unable to study.	Trouble understanding programming concepts despite seeking academic assistance.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
104	comparing constantly feel feeling inadequate like myself students	I feel like I'm constantly comparing myself to other students and feeling inadequate.	Concerns about financial pressures potentially impacting their studies.	Financial	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
193	classes enjoy even feeling ones uninterested unmotivated used	I am feeling unmotivated and uninterested in my classes, even ones I used to enjoy.	Struggling to balance social life, prioritize studies, and manage academic commitments.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
49	advanced concepts mathematics problem solving struggling	Struggling with advanced mathematics concepts and problem-solving	Observing a decline in academic performance compared to previous semesters.	Academic Performance	95	2025-08-20 11:25:39.930663	2025-09-23 04:29:52.468036
194	affecting burnt constantly fatigued feeling out performance projects	I'm constantly feeling fatigued and burnt out, and it's affecting my performance on my projects.	Financial pressures are negatively impacting focus and academic performance.	Financial	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
195	amount classes group required struggling work	I'm struggling with the amount of required group work in my classes.	Lacking motivation and interest in coursework, affecting engagement and academic success.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
52	biology challenging experiments laboratory practicals	Biology laboratory practicals and experiments challenging	Physical symptoms stemming from stress negatively impacting academic progress.	Academic Performance	80	2025-08-20 11:25:39.930663	2025-09-23 04:29:53.623295
82	bed depressed feeling get hard health lately less making mental much out study suffering	My mental health has been suffering, and I've been feeling depressed lately, making it hard to get out of bed, much less study.	Trouble finding a healthy balance between studies, social life, and personal hobbies.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
83	because behind class coding don fast feel java like pace strong understanding	I feel like I'm behind in my coding class because I don't have a strong understanding of Java and the pace is too fast.	Struggling to obtain required accommodations for a diagnosed learning disability.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
84	about anxiety classes future impacting performance	My anxiety about the future is impacting my performance in my classes.	Mental health struggles and depressive symptoms impacting studies and well-being.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
85	behind constantly discussions falling philosophy procrastinating reading	I am constantly procrastinating on my philosophy reading, and I'm falling behind in the discussions.	Feeling behind and overwhelmed in coding class due to knowledge gaps.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
86	about afraid career choice feeling life lost making want wrong	I'm feeling lost about what I want to do with my life, and I'm afraid of making the wrong career choice.	Anxiety about the future negatively impacting their performance in the classroom.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
87	afraid disappointing getting graduate into not parents prestigious school	I'm afraid of disappointing my parents by not getting into a prestigious graduate school.	Procrastination on philosophy reading leading to falling behind in discussions.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
71	basic help job loan money needs part pay student time using	I am using my student loan money on a part-time job to help pay for my basic needs.	Struggles with time management between study and social life impacting grades.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
88	about after apply concerned degree graduation job	I'm concerned about how to apply my degree to a job after graduation.	Unsure about their future career direction and feeling lost about life choices.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
113	course overwhelmed paper political research science write	I'm overwhelmed by the research paper I have to write for my political science course.	Distraction from studies due to problematic social media usage habits.	Technology	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
50	affecting physical related stress studies symptoms	Stress-related physical symptoms affecting studies	Finding chemistry content and chemical reactions challenging to grasp.	Health	121	2025-08-20 11:25:39.930663	2025-09-23 04:29:53.623295
51	career development guidance opportunities professional	Career guidance and professional development opportunities	Difficulty understanding and applying advanced mathematical concepts.	Career	93	2025-08-20 11:25:39.930663	2025-09-23 04:29:53.623295
43	affecting gpa grades multiple overall poor subjects	Poor grades in multiple subjects affecting overall GPA	Struggles with maintaining the necessary GPA to retain scholarship funding.	Academic Performance	107	2025-08-20 11:25:39.930663	2025-09-23 04:29:51.17696
3	about anxiety experiencing high levels stress studies	Experiencing high levels of stress and anxiety about studies	Concerns about assessment performance and achieving satisfactory grades.	Mental Health	127	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
47	academic compared declining performance previous semester	Academic performance declining compared to previous semester	Lower test and quiz scores impacting the final grade and course outcomes.	Academic Performance	95	2025-08-20 11:25:39.930663	2025-09-23 04:29:52.468036
25	concentration difficulty during focus maintaining studies	Difficulty maintaining focus and concentration during studies	Student is struggling to achieve and maintain the required GPA for scholarships.	Mental Health	173	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
26	advanced algorithms concepts difficulty programming understanding	Difficulty understanding advanced programming concepts and algorithms	Challenges in effectively allocating time between studies and other activities.	Academic Performance	152	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
197	ability affecting currently dealing health issue personal study	I am currently dealing with a personal health issue, and it's affecting my ability to study.	Difficulty managing and navigating the requirements for group work.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
28	academic concerns improvement planning probation	Academic probation concerns and improvement planning	Difficulty with sustained focus and concentration during study sessions.	Academic Performance	128	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
198	afraid disappointing grades parents semester	I am afraid of disappointing my parents with my grades this semester.	Struggles with addiction, impacting academic focus and overall student well-being.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
29	competitive development job market planning skill	Skill development planning for competitive job market	Comprehension challenges involving programming algorithms and data structures.	Career	126	2025-08-20 11:25:39.930663	2025-09-07 10:22:20.896288
199	class difficult finding history learning miss motivated online person stay structure	I'm finding it difficult to stay motivated in my online history class; I miss the structure of in-person learning.	Personal health issues are interfering with the ability to study and maintain academic performance.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
201	calculus class concepts difficult having key time understanding	I'm having a difficult time understanding some of the key concepts in my calculus class.	Challenges with online learning, specifically a lack of motivation and structure.	Technology	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
202	about anxious can extremely feeling internship interviews sleep upcoming	I have been feeling extremely anxious about my upcoming internship interviews, and I can't sleep.	Long-distance relationship strain impacting focus and concentration in academic pursuits.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
203	amount biology don effectively feel know lectures material overwhelmed sheer study	I feel overwhelmed by the sheer amount of material in my biology lectures, and I don't know how to study effectively.	Difficulty in understanding key calculus concepts hinders academic progress.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
35	affecting confidence esteem low performance self self	Low self-confidence and self-esteem affecting performance	Time management difficulties in relation to extracurricular activities.	Mental Health	169	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
55	coursework engagement enthusiasm lack	Lack of engagement and enthusiasm for coursework	Experiencing confusion regarding research methodology and thesis writing.	Mental Health	76	2025-08-20 11:25:39.930663	2025-08-24 11:19:11.189338
210	constantly doing enough feeling like not perfectionism struggle	I struggle with perfectionism and am constantly feeling like I'm not doing enough.	Difficulty managing multiple assignments and deadlines, causing stress and anxiety.	Time Management	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
211	class complexities difficult economics finding lectures pass struggling understand	I am finding it difficult to understand the complexities of my economics lectures, and I am struggling to pass the class.	Struggles with creating a consistent study schedule and procrastination on research papers.	Time Management	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
12	academic current interest lack motivation program	Lack of motivation and interest in current academic program	Concerns regarding the impact of academic performance on their transcript.	Academic Performance	270	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
15	administrative documentation enrollment issues	Administrative issues with enrollment and documentation	Seeking guidance on academic advising and program planning strategies.	Other	173	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
40	academic aspirations disconnected feeling goals	Feeling disconnected from academic goals and aspirations	Procrastination issues leading to last-minute study and exam preparation.	Academic Performance	169	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
137	about chemistry exam next performance really worried	I am really worried about my performance on the next chemistry exam.	Pressure for post-graduation job prospects causing paralyzing anxiety.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
138	best career fair highlight navigate not skills sure unsure	I am unsure how to navigate the career fair, and I'm not sure how to best highlight my skills.	Financial strain caused by textbook costs is impacting course enrollment decisions.	Financial	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
139	depression focus impossible making studies worried	I'm worried that my depression is making it impossible for me to focus on my studies.	Anxiety and worry about upcoming assessment results in a chemistry course.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
140	after aligns degree family feeling find graduation job lot pressure psychology struggling	I'm struggling to find a job after graduation that aligns with my degree in Psychology and I'm feeling a lot of pressure from my family.	Lack of career fair navigation skills and difficulties highlighting abilities.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
141	because don feeling get know lot paper research started stress	I am feeling a lot of stress because I don't know how to get started on my research paper.	Depression impeding concentration and the ability to focus on academics.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
147	classes format learning online really struggling	I am really struggling with the online learning format of my classes.	Unsure of resources and strategies to utilize the writing center effectively.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
148	because classes deadlines distracted focusing get having media missing online result social trouble websites	I'm having trouble focusing in my online classes because I get distracted by social media and other websites, and I'm missing deadlines as a result.	Intensive internship combined with coursework leading to exhaustion and stress.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
168	anxiety class discussions hard makes participate really social	My social anxiety makes it really hard to participate in class discussions.	Excessive reading load in history courses is overwhelming, limiting comprehension.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
170	building job market not right skills worried	I'm worried I'm not building the right skills for the job market.	Social anxiety inhibiting active participation in class discussions.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
79	because class consistently late mornings struggle wake	I am consistently late to class because I struggle to wake up in the mornings.	Family pressure to pursue a specific career conflicting with student's aspirations.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
44	direction lost purpose sense studies	Lost sense of purpose and direction in studies	Stress related to deadline pressures and time constraints of assignments.	Mental Health	174	2025-08-20 11:25:39.930663	2025-09-23 04:29:51.17696
53	methodology requirements research thesis unclear writing	Research methodology and thesis writing requirements unclear	Seeking career guidance and professional development opportunities.	Academic Performance	63	2025-08-20 11:25:39.930663	2025-09-23 04:29:54.508584
196	ability addiction classes focus interfering serious struggling which	I'm struggling with a serious addiction, which is interfering with my classes and my ability to focus.	Experiencing burnout and fatigue, impairing project completion and overall academic performance.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
213	about about afford concerned cost expensive next really semester since textbooks worried	I am worried about the cost of textbooks for next semester, since they’re really expensive, and I'm concerned about how to afford them.	Difficulty in understanding economics lectures, leading to failing grades in the course.	Academic Performance	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
214	feeling internship secured unprepared upcoming	I am feeling unprepared for the upcoming internship that I have secured.	Seeking strategies to effectively prepare for online examination formats and assessment.	Academic Performance	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
215	because dropping gpa hard papers procrastinating start writing writing	My GPA has been dropping because I'm procrastinating on writing papers, and it's hard for me to start writing them.	Concerns about textbook costs and affordability impacting academic resource accessibility.	Financial	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
216	anymore biology burned effectively feel final manage not out starting studying sure time	I'm starting to feel burned out from studying for my Biology final and I'm not sure how to manage my time effectively anymore.	Feeling unprepared for an upcoming internship placement and its related expectations.	Career	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
217	because demands diet exercise healthy maintain routine school struggle	I struggle to maintain a healthy diet and exercise routine because of the demands of school.	Procrastination on writing assignments is negatively affecting GPA and academic standing.	Academic Performance	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
218	can classes done everything find get keep readings seem struggling time	I am struggling to keep up with all the readings for my classes, and I can't seem to find the time to get everything done.	Experiencing burnout from studying and ineffective time management for finals preparation.	Health	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
219	anxiety class communications constant public really speaking struggling	I'm really struggling with public speaking in my communications class and have constant anxiety.	Struggles maintaining healthy habits amidst the demands of academics.	Health	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
6	facility information requests service university	University facility and service information requests	Challenges with complex computer science programming assignments and concepts.	Other	171	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
32	analysis coursework data overwhelming statistics	Statistics and data analysis coursework overwhelming	The need for improved organizational skills and effective scheduling techniques.	Academic Performance	168	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
142	anything concentrate constant exhaustion experiencing feeling getting harder	I am experiencing a constant feeling of exhaustion and it's getting harder to concentrate on anything.	Career-related anxiety combined with family pressure regarding job prospects.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
143	afraid chosen decision later major question regret starting	I am starting to question my chosen major, and I'm afraid I'll regret my decision later.	Difficulty initiating the research paper-writing process due to stress.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
144	art chose doesn family history major practical pressuring something switch understand	My family doesn't understand why I chose to major in Art History, and they're pressuring me to switch to something "practical".	Constant exhaustion impacting concentration and cognitive function in class.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
145	available center effectively essays improve not resources sure use writing	I'm not sure how to effectively use the resources available at the writing center to improve my essays.	Questioning major choice and potential regrets about career path decisions.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
146	balance coursework demanding exhausted feel internship perpetually struggling	I'm struggling to balance my demanding internship with my coursework and feel perpetually exhausted.	Family pressure to change major based on perceived career practicality.	Family	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
30	better need organizational scheduling skills techniques	Need for better organizational skills and scheduling techniques	Academic probation status requiring planning for improvement and academic success.	Time Management	124	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
62	assignments much perfectionism spend struggling time way	I am struggling with perfectionism and spend way too much time on assignments.	Comparing themselves to a sibling and feeling inadequate impacting confidence.	Mental Health	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
63	class complex difficult discussed having philosophy theories time understanding	I'm having a difficult time understanding some of the complex theories discussed in my philosophy class.	Parental comparisons leading to feelings of failure and impacting student confidence.	Family	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
64	about art business history major much parents passionate pressuring	My parents are pressuring me to major in business, but I'm much more passionate about art history.	Struggles with perfectionism and its impact on assignment completion time.	Time Management	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
65	asking connect finding hard professor questions	I'm finding it hard to connect with the professor and asking questions.	Finding it hard to understand and retain complex philosophical theories.	Academic Performance	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
66	bed class down even feeling get hard increasingly know lately need out though unmotivated	I've been feeling increasingly down and unmotivated lately, and it's hard for me to get out of bed and go to class, even though I know I need to.	Feeling pressure from parents to major in business rather than their true passion.	Family	89	2025-08-21 03:57:32.744273	2025-08-24 11:50:18.319674
106	adjust away finding hard home living	I am finding it hard to adjust to living away from home.	Constant comparison to peers, creating feelings of academic inadequacy.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
107	demotivating despite feel improving like lot not putting study time which	I feel like I'm not improving despite putting in a lot of study time, which is demotivating.	Not knowing how to effectively manage stress and pressure during exam season.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
108	academic effectively not resources sure using	I'm not sure if I'm using my academic resources effectively.	Struggling to adjust to the experience of living away from home.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
109	class foreign harder language learn making participate really struggling vocabulary	I'm really struggling to learn the foreign language vocabulary, making it harder to participate in class.	General academic and personal concerns requiring attention	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
110	activities burnt enjoy feeling interest losing out used	I'm feeling burnt out and losing interest in the activities I used to enjoy.	General academic and personal concerns requiring attention	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
111	difficulty distracting managing media social studies use which	I have difficulty managing my social media use, which is distracting me from my studies.	Language acquisition challenges hindering classroom participation and comprehension.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
130	assignments challenging finding keep notes organize track	I'm finding it challenging to organize my notes and keep track of assignments.	Over-commitment and poor time management leading to a packed schedule.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
46	academic inspiration motivation need renewed	Need for inspiration and renewed academic motivation	Loss of direction and purpose within the academic journey.	Mental Health	163	2025-08-20 11:25:39.930663	2025-09-23 04:29:52.468036
48	chemical chemistry confusing content course reactions	Chemistry course content and chemical reactions confusing	Seeking renewed motivation and inspiration for continued academic engagement.	Academic Performance	163	2025-08-20 11:25:39.930663	2025-09-23 04:29:52.468036
4	assignments computer difficult programming science	Computer science programming assignments too difficult	Ineffective time management and organization hinder academic productivity and success.	Academic Performance	268	2025-08-20 11:25:39.930663	2025-09-07 10:22:19.67381
42	causing constraints deadline pressure stress time	Deadline pressure and time constraints causing stress	Feeling disconnected from academic goals and long-term aspirations.	Mental Health	149	2025-08-20 11:25:39.930663	2025-09-07 10:22:21.957099
155	amount assigned class dense don effectively feel know material notes overwhelmed political reading science sheer take	I feel overwhelmed by the sheer amount of reading assigned in my political science class, and I don't know how to effectively take notes on dense material.	Financial stress and uncertainty regarding personal spending management.	Financial	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
156	about afford don finances know low money next really running semester textbooks worried	I'm really worried about my finances; I'm running low on money and don't know how I'll afford textbooks next semester.	Significant emotional strain related to a family member's severe illness.	Family	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
157	about after debt graduation lot off pay worried	I have a lot of debt, and I'm worried about how I will pay it off after graduation.	Overwhelm and difficulty with reading volume and note-taking strategies.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
158	cramming end exams isn procrastination really struggling which working	I'm really struggling with procrastination and end up cramming for exams, which isn't working.	Financial strain impacting affordability and the need for textbooks.	Financial	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
159	experiencing find hard issues motivated relationship schoolwork stay	I find it hard to stay motivated with my schoolwork when I'm experiencing relationship issues.	Financial concerns related to debt management and post-graduation repayment.	Financial	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
160	career even feeling not path pressured pursue specific sure though want	I am feeling pressured to pursue a specific career path, even though I'm not sure it's what I want.	Counterproductive procrastination leading to cramming for exams.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
161	between decide different focus hard internship makes offers studies trying two which	I am trying to decide between two different internship offers, which makes it hard to focus on my studies.	External relationship problems are negatively impacting study habits and motivation.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
162	between difficult grades life managing social studies suffering time time	I have a difficult time managing my time between my social life and my studies, and my grades are suffering.	Pressure to pursue a particular career path, despite the lack of interest.	Career	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
200	affecting another dealing fact focus hard having significant state time which	I'm having a hard time dealing with the fact that my significant other is in another state, which is affecting my focus.	Fear of disappointing parents influences academic anxiety and performance pressures.	Family	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
176	because campus feel hard lonely studying time	I have a hard time studying because I feel very lonely on campus.	Struggles with insomnia impacting concentration and academic performance.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
177	class difficult lectures professor spanish time understanding	I have a difficult time understanding the professor's lectures in my Spanish class.	Financial insecurity and the impact on focus due to rent payment concerns.	Financial	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
178	ability affect experiencing fatigue focus headaches recurring which	I am experiencing recurring headaches and fatigue, which affect my ability to focus.	Feeling lonely on campus and struggling to maintain focus during studies.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
179	anxiety attend groups hard hours join making office social struggling study	I'm struggling with social anxiety and it is making it hard for me to join study groups or attend office hours.	Difficulty understanding the professor's lectures in a language class.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
180	challenging courses effective not semester strategies study sure using	I'm not sure if the study strategies I'm using are effective for this semester's challenging courses.	Recurring physical symptoms that diminish focus and reduce productivity.	Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
181	ability about affecting concentrate feeling incredibly relationship stressed studies	I am feeling incredibly stressed about my relationship, and it's affecting my ability to concentrate on my studies.	Social anxiety creating difficulties attending study groups and office hours.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
182	about friend health mental seems struggling worried	I’m worried about a friend who seems to be struggling with their mental health.	Uncertain efficacy of current study strategies in challenging courses.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
183	classes difficulty grades having impacting online required technology	I'm having difficulty with the technology required for online classes, and it's impacting my grades.	Relationship problems negatively affecting focus and academic performance.	Social Issues	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
184	chemistry consistently doing during experiments getting grades lab low not sure wrong	I am getting consistently low grades in my chemistry lab, and I'm not sure what I'm doing wrong during the experiments.	General academic and personal concerns requiring attention	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
185	approaching depression especially feel finals history like returning	I have a history of depression, and I feel like it's returning, especially with finals approaching.	General academic and personal concerns requiring attention	Technology	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
186	asking harder help makes struggling things trouble which	I have trouble asking for help when I'm struggling, which makes things harder.	Experiencing difficulties in chemistry lab performance and understanding of experimental procedures.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
187	amount assignments classwork homework overwhelmed	I am overwhelmed with the amount of homework, classwork, and assignments that I have.	Struggling with the recurrence of depression and mental health challenges during finals.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
190	afraid asking help interacting lot professors trouble	I have a lot of trouble interacting with my professors, and I'm afraid of asking for help.	Ineffective note-taking strategies impede comprehension in lecture-based courses.	Academic Performance	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
54	about applications information opportunities scholarship	Information about scholarship opportunities and applications	Difficulties in biology laboratory practicals and experimental procedures.	Financial	34	2025-08-20 11:25:39.930663	2025-08-24 11:19:11.189338
56	assignments between deadlines difficulty managing multiple time	Difficulty managing time between multiple assignments and deadlines	Information sought on scholarship eligibility and application processes.	Time Management	34	2025-08-20 11:25:39.930663	2025-08-24 11:19:11.189338
204	becoming boyfriend concentrate girlfriend hard relationship stressful	My relationship with my boyfriend/girlfriend is becoming stressful, and it's hard to concentrate.	Limited engagement and enthusiasm impacting coursework and overall academic performance.	Mental Health	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
205	attend causes chronic classes flare hard illness making regularly ups	I have a chronic illness that causes flare-ups, making it hard to attend classes regularly.	Challenges managing time effectively with multiple assignments and rapidly approaching deadlines.	Time Management	13	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
206	classes dealing difficult family health issue present serious	My family is dealing with a serious health issue, and it's very difficult for me to be present in my classes.	Relationship stress affecting concentration and hindering academic performance.	Social Issues	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
207	about concerned cost debt loan rising student tuition	I'm concerned about the rising cost of tuition and my student loan debt.	Chronic illness impacting class attendance and academic consistency due to flare-ups.	Health	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
208	assignments deadlines due managing multiple soon struggling time	I'm struggling with managing my time and deadlines with multiple assignments due soon.	Family health issues are affecting presence and engagement in academic pursuits.	Family	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
209	class consistent english find keep overdue paper procrastinating research schedule struggling study which writing	I'm struggling to find a consistent study schedule, and I keep procrastinating on writing my research paper for my English class, which is now overdue.	Financial concerns related to tuition costs and student loan debt are causing stress.	Financial	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
212	best exam not online prepare sure	I'm not sure how to best prepare for an online exam.	Perfectionism contributing to academic stress and a sense of inadequacy.	Mental Health	11	2025-08-21 03:57:32.744273	2025-08-24 11:19:11.189338
\.


--
-- Data for Name: consultation_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consultation_sessions (id, session_date, duration, student_ids, summary, teacher_id, transcription, concern, action_taken, outcome, remarks, venue, audio_file_path, quality_score, quality_metrics, raw_sentiment_analysis, booking_id, transcription_enabled) FROM stdin;
715	2025-08-17 18:29:11.442	00:01:39	["22-3191-534"]	Test	22-3191-535		Test	Test	Test	Test	303		0	{}	[]	a0f5564e-c75d-4c0b-a82e-9f13d191ea40	t
512	2025-05-15 14:33:12.829724	00:45:00	["22-3191-534"]	1st Year consultation for Social Integration	TEACHER001	\N	Poor scheduling and planning skills affecting productivity	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.8	\N	\N	\N	f
662	2025-06-08 14:33:12.834733	00:45:00	["S2024001"]	4th Year consultation for Career Guidance	TEACHER001	\N	Experiencing high levels of stress and anxiety about studies	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
663	2025-06-29 14:33:12.834733	00:30:00	["S2024004"]	4th Year consultation for Career Guidance	TEACHER001	\N	Computer science programming assignments too difficult	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
664	2025-05-09 14:33:12.834733	01:00:00	["S2024004"]	4th Year consultation for Career Guidance	TEACHER003	\N	Academic achievement not meeting personal expectations	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.7	\N	\N	\N	f
665	2025-03-24 14:33:12.83573	01:00:00	["S2024002"]	4th Year consultation for Career Guidance	TEACHER001	\N	University facility and service information requests	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.5	\N	\N	\N	f
666	2025-04-02 14:33:12.83573	00:30:00	["S2024007"]	4th Year consultation for Career Guidance	TEACHER002	\N	Academic probation due to poor academic standing	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
667	2025-06-14 14:33:12.83573	01:00:00	["S2024008"]	4th Year consultation for Career Guidance	TEACHER001	\N	Emotional wellbeing concerns affecting concentration	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4	\N	\N	\N	f
512	2025-05-15 14:33:12.829724	00:45:00	["22-3191-534"]	Individual consultation session focused on the student's reported poor scheduling and planning skills, which were impacting productivity. Counseling and support were provided to address social integration issues, which were affecting the student's ability to implement scheduling and planning strategies. The student expressed improved understanding and demonstrated increased confidence in addressing these concerns. Duration: 00:45:00.	TEACHER001	\N	Poor scheduling and planning skills affecting productivity	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.8	\N	\N	\N	f
668	2025-04-23 14:33:12.83573	00:30:00	["S2024004"]	4th Year consultation for Career Guidance	TEACHER002	\N	Productivity issues and inefficient study habits	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
670	2025-04-27 14:33:12.83573	00:45:00	["S2024006"]	4th Year consultation for Career Guidance	TEACHER001	\N	Concerns about academic record and transcript impact	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
672	2025-06-25 14:33:12.83573	01:00:00	["S2024005"]	4th Year consultation for Career Guidance	TEACHER002	\N	Organization problems with study materials and schedules	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.1	\N	\N	\N	f
673	2025-03-06 14:33:12.83573	00:30:00	["S2024002"]	4th Year consultation for Career Guidance	TEACHER003	\N	Lack of motivation and interest in current academic program	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4	\N	\N	\N	f
674	2025-04-21 14:33:12.83573	00:30:00	["22-3191-534"]	4th Year consultation for Career Guidance	TEACHER003	\N	General academic advising and program planning	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.4	\N	\N	\N	f
675	2025-03-29 14:33:12.83573	00:30:00	["22-3191-534"]	4th Year consultation for Career Guidance	TEACHER002	\N	Mental health issues impacting daily functioning	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
676	2025-03-11 14:33:12.83573	01:00:00	["S2024003"]	4th Year consultation for Career Guidance	TEACHER002	\N	Administrative issues with enrollment and documentation	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.3	\N	\N	\N	f
678	2025-04-25 14:33:12.83573	00:30:00	["S2024005"]	4th Year consultation for Career Guidance	TEACHER003	\N	Feeling overwhelmed and emotionally exhausted from coursework	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.7	\N	\N	\N	f
679	2025-05-02 14:33:12.83573	01:00:00	["S2024007"]	4th Year consultation for Career Guidance	TEACHER001	\N	Work-life balance issues with part-time job and studies	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.1	\N	\N	\N	f
682	2025-04-18 14:33:12.83573	00:45:00	["S2024004"]	4th Year consultation for Career Guidance	TEACHER003	\N	Anxiety attacks during exams and presentations	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.7	\N	\N	\N	f
716	2025-06-26 08:00:00	02:00:00	["14", "11"]	Group consultation session addressing motivation concerns. Duration: 02:00:00. Students showed excellent engagement and progress.	22-3191-535	Consultation session transcript - Motivation discussion with detailed explanations and student questions addressed comprehensively.	Self-confidence issues affecting classroom participation	Identified intrinsic motivators and personal learning styles	Student mastered key concepts and ready for advanced topics	\N	Academic Support Center	\N	4.6	\N	\N	\N	f
677	2025-05-19 14:33:12.83573	00:45:00	["S2024001"]	4th Year consultation for Career Guidance	TEACHER001	\N	My psychological state is affecting my everyday academic tasks.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.2	\N	\N	\N	f
680	2025-08-15 14:33:12.83573	00:30:00	["S2024007"]	4th Year consultation for Career Guidance	TEACHER002	\N	I'm on academic probation; my grades just tanked this semester.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4	\N	\N	\N	f
717	2025-08-10 16:30:00	02:00:00	["11", "14"]	Group consultation session addressing academic performance concerns. Duration: 02:00:00. Students showed excellent engagement and progress.	22-3191-535	Consultation session transcript - Academic Performance discussion with detailed explanations and student questions addressed comprehensively.	Challenges with academic workload and course difficulty	Provided academic resources and study materials for improvement	Student developed effective strategies for ongoing improvement	\N	Faculty Office Room 201	\N	4.8	\N	\N	\N	f
718	2025-06-29 17:00:00	01:15:00	["7", "13"]	Group consultation session addressing mental health concerns. Duration: 01:15:00. Students showed good engagement and progress.	22-3191-535	Consultation session transcript - Mental Health discussion with detailed explanations and student questions addressed comprehensively.	Feeling overwhelmed with coursework and personal responsibilities	Discussed stress management techniques and coping strategies	Student showed excellent progress and engagement with material	\N	Library Private Study Room	\N	4.6	\N	\N	\N	f
719	2025-06-25 11:15:00	02:00:00	["11"]	Individual consultation session addressing time management concerns. Duration: 02:00:00. Students showed good engagement and progress.	22-3191-535	Consultation session transcript - Time Management discussion with detailed explanations and student questions addressed comprehensively.	Difficulty prioritizing multiple assignments and project deadlines	Taught time-blocking techniques and productivity methods	Student needs additional follow-up sessions for continued support	\N	Faculty Office Room 201	\N	4.2	\N	\N	\N	f
720	2025-06-02 11:45:00	00:45:00	["12", "13"]	Group consultation session addressing academic performance concerns. Duration: 00:45:00. Students showed good engagement and progress.	22-3191-535	Consultation session transcript - Academic Performance discussion with detailed explanations and student questions addressed comprehensively.	Student struggling with maintaining required GPA for scholarship	Created action plan for GPA improvement with milestone tracking	Student mastered key concepts and ready for advanced topics	\N	Academic Support Center	\N	3.7	\N	\N	\N	f
721	2025-07-14 11:15:00	02:00:00	["11"]	Individual consultation session addressing time management concerns. Duration: 02:00:00. Students showed excellent engagement and progress.	22-3191-535	Consultation session transcript - Time Management discussion with detailed explanations and student questions addressed comprehensively.	Poor time allocation between study sessions and other activities	Taught time-blocking techniques and productivity methods	Student mastered key concepts and ready for advanced topics	\N	Department Conference Room	\N	4.2	\N	\N	\N	f
513	2025-07-27 14:33:12.829724	00:30:00	["S2024002"]	Individual consultation session addressing coursework's got me completely drained; i'm burnt out emotionally.. Duration: 00:30:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER002	\N	Coursework's got me completely drained; I'm burnt out emotionally.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.3	\N	\N	\N	f
517	2025-05-16 14:33:12.830732	00:45:00	["S2024004"]	Individual consultation session addressing balancing clubs and classes feels impossible, time-wise!. Duration: 00:45:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER003	\N	Balancing clubs and classes feels impossible, time-wise!	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.9	\N	\N	\N	f
724	2025-08-12 11:30:00	01:30:00	["6", "11", "8"]	Group consultation session addressing motivation concerns. Duration: 01:30:00. Students showed good engagement and progress.	22-3191-535	Consultation session transcript - Motivation discussion with detailed explanations and student questions addressed comprehensively.	Difficulty maintaining focus and concentration during studies	Set short-term achievable goals to rebuild academic confidence	Student needs additional follow-up sessions for continued support	\N	Faculty Office Room 201	\N	4.8	\N	\N	\N	f
519	2025-02-26 14:33:12.830732	00:45:00	["S2024007"]	Individual consultation session addressing i could really use some help from the counseling center, you know?. Duration: 00:45:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER003	\N	I could really use some help from the counseling center, you know?	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
726	2025-07-14 12:15:00	00:30:00	["8", "7"]	Group consultation session addressing subject-specific concerns. Duration: 00:30:00. Students showed good engagement and progress.	22-3191-535	Consultation session transcript - Subject-Specific discussion with detailed explanations and student questions addressed comprehensively.	Difficulty understanding advanced programming concepts and algorithms	Provided additional practice materials and supplementary resources	Student mastered key concepts and ready for advanced topics	\N	Academic Support Center	\N	4.7	\N	\N	\N	f
727	2025-05-24 10:15:00	01:15:00	["8", "10", "7"]	Group consultation session addressing academic performance concerns. Duration: 01:15:00. Students showed excellent engagement and progress.	22-3191-535	Consultation session transcript - Academic Performance discussion with detailed explanations and student questions addressed comprehensively.	Academic probation concerns and improvement planning	Created action plan for GPA improvement with milestone tracking	Student showed excellent progress and engagement with material	\N	Academic Support Center	\N	4	\N	\N	\N	f
728	2025-06-24 09:45:00	02:00:00	["13", "10", "6"]	Group consultation session addressing career guidance concerns. Duration: 02:00:00. Students showed good engagement and progress.	22-3191-535	Consultation session transcript - Career Guidance discussion with detailed explanations and student questions addressed comprehensively.	Skill development planning for competitive job market	Reviewed career options and industry requirements analysis	Student mastered key concepts and ready for advanced topics	\N	Department Conference Room	\N	3.8	\N	\N	\N	f
729	2025-06-01 16:45:00	01:15:00	["6", "10"]	Group consultation session addressing time management concerns. Duration: 01:15:00. Students showed excellent engagement and progress.	22-3191-535	Consultation session transcript - Time Management discussion with detailed explanations and student questions addressed comprehensively.	Need for better organizational skills and scheduling techniques	Created detailed schedule template with priority-based task organization	Student demonstrated improved understanding and confidence	\N	Online Video Conference	\N	4.3	\N	\N	\N	f
730	2025-07-12 11:00:00	02:00:00	["6"]	Individual consultation session addressing mental health concerns. Duration: 02:00:00. Students showed excellent engagement and progress.	22-3191-535	Consultation session transcript - Mental Health discussion with detailed explanations and student questions addressed comprehensively.	High levels of academic stress affecting daily performance	Developed wellness plan incorporating self-care practices	Student developed effective strategies for ongoing improvement	\N	Library Private Study Room	\N	4	\N	\N	\N	f
684	2025-03-26 14:33:12.83573	01:00:00	["S2024007"]	4th Year consultation for Career Guidance	TEACHER001	\N	Statistics and data analysis coursework overwhelming	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
685	2025-07-10 14:33:12.83573	00:30:00	["S2024007"]	4th Year consultation for Academic Stress	TEACHER001	\N	Time allocation challenges with extracurricular activities	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.4	\N	\N	\N	f
514	2025-04-01 14:33:12.829724	00:45:00	["22-3191-534"]	Individual consultation session addressing my mental state is making it hard to focus on studies.. Duration: 00:45:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER003	\N	My mental state is making it hard to focus on studies.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.9	\N	\N	\N	f
687	2025-07-14 14:33:12.83573	01:00:00	["S2024006"]	4th Year consultation for Academic Stress	TEACHER002	\N	Complex physics equations and laboratory experiments challenging	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.8	\N	\N	\N	f
688	2025-04-11 14:33:12.83573	01:00:00	["S2024006"]	4th Year consultation for Academic Stress	TEACHER002	\N	Low self-confidence and self-esteem affecting performance	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4	\N	\N	\N	f
689	2025-06-17 14:33:12.83573	00:45:00	["22-3191-534"]	4th Year consultation for Academic Stress	TEACHER003	\N	Need for psychological support and counseling services	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4	\N	\N	\N	f
690	2025-08-15 14:33:12.83686	00:45:00	["S2024008"]	4th Year consultation for Academic Stress	TEACHER003	\N	Questions about graduation requirements and academic policies	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.9	\N	\N	\N	f
692	2025-05-25 14:33:12.83686	01:00:00	["S2024007"]	4th Year consultation for Academic Stress	TEACHER002	\N	Difficulty understanding programming algorithms and data structures	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.7	\N	\N	\N	f
693	2025-03-21 14:33:12.83686	00:30:00	["S2024003"]	4th Year consultation for Academic Stress	TEACHER002	\N	Procrastination problems leading to last-minute cramming	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
696	2025-04-12 14:33:12.83686	00:45:00	["S2024007"]	4th Year consultation for Academic Stress	TEACHER002	\N	Failing to meet academic requirements and standards	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.6	\N	\N	\N	f
521	2025-04-13 14:33:12.830732	00:45:00	["22-3191-534"]	Individual consultation session addressing academic expectations versus reality is causing me stress. Duration: 00:45:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER001	\N	Academic expectations versus reality is causing me stress	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4	\N	\N	\N	f
697	2025-08-02 14:33:12.83686	00:45:00	["S2024007"]	4th Year consultation for Academic Stress	TEACHER003	\N	Feeling disconnected from academic goals and aspirations	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.9	\N	\N	\N	f
701	2025-06-13 14:33:12.83686	00:30:00	["S2024001"]	4th Year consultation for Personal Issues	TEACHER002	\N	Difficulty maintaining required GPA for scholarship	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.4	\N	\N	\N	f
523	2025-04-17 14:33:12.830732	00:30:00	["S2024004"]	Individual consultation session focused on student-identified underperformance. Counseling and support were provided to address social integration challenges. The student expressed improved understanding and confidence in the identified areas. Duration: 00:30:00.	TEACHER001	\N	I'm not performing at the level I expected myself to.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
703	2025-04-02 14:33:12.83686	00:45:00	["S2024008"]	4th Year consultation for Personal Issues	TEACHER003	\N	Deadline pressure and time constraints causing stress	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
514	2025-04-01 14:33:12.829724	00:45:00	["22-3191-534"]	1st Year consultation for Social Integration	TEACHER003	\N	My mental state is making it hard to focus on studies.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.9	\N	\N	\N	f
704	2025-07-17 14:33:12.83686	01:00:00	["S2024007"]	4th Year consultation for Personal Issues	TEACHER003	\N	Public speaking and testing situations trigger severe anxiety.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4	\N	\N	\N	f
694	2025-05-20 14:33:12.83686	01:00:00	["S2024003"]	4th Year consultation for Academic Stress	TEACHER002	\N	Mental health struggles are disrupting my daily study routine.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.7	\N	\N	\N	f
700	2025-06-27 14:33:12.83686	00:45:00	["S2024003"]	4th Year consultation for Personal Issues	TEACHER002	\N	Ugh, I'm in trouble – academic probation for bad grades.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.6	\N	\N	\N	f
515	2025-05-19 14:33:12.829724	00:45:00	["22-3191-534"]	1st Year consultation for Social Integration	TEACHER003	\N	Poor grades in multiple subjects affecting overall GPA	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.2	\N	\N	\N	f
515	2025-05-19 14:33:12.829724	00:45:00	["22-3191-534"]	Individual consultation session addressing poor grades in multiple subjects affecting overall gpa. Duration: 00:45:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER003	\N	Poor grades in multiple subjects affecting overall GPA	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.2	\N	\N	\N	f
516	2025-07-30 14:33:12.829724	00:30:00	["S2024005"]	Individual consultation session addressing my grades are a worry; how will this affect my transcript?. Duration: 00:30:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER002	\N	My grades are a worry; how will this affect my transcript?	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.2	\N	\N	\N	f
518	2025-05-13 14:33:12.830732	00:30:00	["S2024006"]	Individual consultation session addressing my grades aren't reflecting the effort i'm putting in.. Duration: 00:30:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER001	\N	My grades aren't reflecting the effort I'm putting in.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.9	\N	\N	\N	f
520	2025-08-07 14:33:12.830732	00:30:00	["S2024002"]	Individual consultation session addressing lost sense of purpose and direction in studies. Duration: 00:30:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER003	\N	Lost sense of purpose and direction in studies	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
522	2025-06-28 14:33:12.830732	00:30:00	["S2024007"]	Individual consultation session addressing overwhelming fear during presentations and exam situations.. Duration: 00:30:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER002	\N	Overwhelming fear during presentations and exam situations.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
524	2025-07-15 14:33:12.830732	00:45:00	["S2024008"]	Individual consultation session addressing am i falling short of what's expected in my classes?. Duration: 00:45:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER003	\N	Am I falling short of what's expected in my classes?	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.3	\N	\N	\N	f
520	2025-08-07 14:33:12.830732	00:30:00	["S2024002"]	1st Year consultation for Social Integration	TEACHER003	\N	Lost sense of purpose and direction in studies	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
527	2025-05-26 14:33:12.830732	00:30:00	["S2024007"]	1st Year consultation for General Inquiries	TEACHER003	\N	Low test scores and quiz performance impacting final grades	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.7	\N	\N	\N	f
528	2025-08-05 14:33:12.830732	00:45:00	["S2024008"]	1st Year consultation for General Inquiries	TEACHER002	\N	Need for inspiration and renewed academic motivation	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.6	\N	\N	\N	f
530	2025-03-24 14:33:12.830732	01:00:00	["S2024003"]	1st Year consultation for General Inquiries	TEACHER001	\N	Academic performance declining compared to previous semester	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.2	\N	\N	\N	f
532	2025-04-14 14:33:12.830732	01:00:00	["S2024006"]	1st Year consultation for General Inquiries	TEACHER003	\N	Chemistry course content and chemical reactions confusing	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
518	2025-05-13 14:33:12.830732	00:30:00	["S2024006"]	1st Year consultation for Social Integration	TEACHER001	\N	My grades aren't reflecting the effort I'm putting in.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.9	\N	\N	\N	f
526	2025-04-15 14:33:12.830732	01:00:00	["S2024006"]	1st Year consultation for Social Integration	TEACHER003	\N	Emotional issues are disrupting my ability to concentrate.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.8	\N	\N	\N	f
522	2025-06-28 14:33:12.830732	00:30:00	["S2024007"]	1st Year consultation for Social Integration	TEACHER002	\N	Overwhelming fear during presentations and exam situations.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
535	2025-03-28 14:33:12.830732	00:30:00	["S2024004"]	1st Year consultation for General Inquiries	TEACHER001	\N	My anxiety spikes whenever I face academic evaluations.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.6	\N	\N	\N	f
529	2025-05-13 14:33:12.830732	01:00:00	["S2024006"]	1st Year consultation for General Inquiries	TEACHER002	\N	Emotional difficulties are interfering with my regular activities.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
516	2025-07-30 14:33:12.829724	00:30:00	["S2024005"]	1st Year consultation for Social Integration	TEACHER002	\N	My grades are a worry; how will this affect my transcript?	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.2	\N	\N	\N	f
534	2025-05-17 14:33:12.830732	00:30:00	["S2024008"]	1st Year consultation for General Inquiries	TEACHER001	\N	Is anyone else drowning in assignments and feeling utterly depleted?	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
539	2025-08-14 14:33:12.830732	01:00:00	["S2024002"]	1st Year consultation for Learning Difficulties	TEACHER002	\N	Struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.6	\N	\N	\N	f
549	2025-04-14 14:33:12.830732	00:45:00	["S2024002"]	1st Year consultation for Personal Issues	TEACHER001	\N	Stress-related physical symptoms affecting studies	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.8	\N	\N	\N	f
525	2025-05-19 14:33:12.830732	01:00:00	["S2024002"]	Individual consultation session addressing i'm always putting things off, which means all-nighters before deadlines.. Duration: 01:00:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER001	\N	I'm always putting things off, which means all-nighters before deadlines.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.7	\N	\N	\N	f
552	2025-07-04 14:33:12.830732	00:45:00	["S2024002"]	1st Year consultation for Academic Stress	TEACHER003	\N	Career guidance and professional development opportunities	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.9	\N	\N	\N	f
526	2025-04-15 14:33:12.830732	01:00:00	["S2024006"]	Individual consultation session addressing emotional issues are disrupting my ability to concentrate.. Duration: 01:00:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER003	\N	Emotional issues are disrupting my ability to concentrate.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.8	\N	\N	\N	f
527	2025-05-26 14:33:12.830732	00:30:00	["S2024007"]	Individual consultation session addressing low test scores and quiz performance impacting final grades. Duration: 00:30:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER003	\N	Low test scores and quiz performance impacting final grades	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.7	\N	\N	\N	f
528	2025-08-05 14:33:12.830732	00:45:00	["S2024008"]	Individual consultation session addressing need for inspiration and renewed academic motivation. Duration: 00:45:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER002	\N	Need for inspiration and renewed academic motivation	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.6	\N	\N	\N	f
529	2025-05-13 14:33:12.830732	01:00:00	["S2024006"]	Individual consultation session addressing emotional difficulties are interfering with my regular activities.. Duration: 01:00:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER002	\N	Emotional difficulties are interfering with my regular activities.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
530	2025-03-24 14:33:12.830732	01:00:00	["S2024003"]	Individual consultation session addressing academic performance declining compared to previous semester. Duration: 01:00:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER001	\N	Academic performance declining compared to previous semester	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.2	\N	\N	\N	f
531	2025-03-19 14:33:12.830732	00:45:00	["S2024006"]	Individual consultation session addressing are those complex physics problems and experiments just brutal for everyone?. Duration: 00:45:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER002	\N	Are those complex physics problems and experiments just brutal for everyone?	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.7	\N	\N	\N	f
532	2025-04-14 14:33:12.830732	01:00:00	["S2024006"]	Individual consultation session addressing chemistry course content and chemical reactions confusing. Duration: 01:00:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER003	\N	Chemistry course content and chemical reactions confusing	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
533	2025-04-04 14:33:12.830732	01:00:00	["S2024002"]	Individual consultation session addressing academics have me wound up; i can't seem to relax with all this pressure.. Duration: 01:00:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER002	\N	Academics have me wound up; I can't seem to relax with all this pressure.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.4	\N	\N	\N	f
557	2025-08-03 14:33:12.831732	00:30:00	["S2024007"]	2nd Year consultation for Academic Stress	TEACHER003	\N	Biology laboratory practicals and experiments challenging	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.4	\N	\N	\N	f
560	2025-03-16 14:33:12.831732	00:45:00	["S2024001"]	2nd Year consultation for Academic Stress	TEACHER002	\N	Research methodology and thesis writing requirements unclear	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
548	2025-07-03 14:33:12.830732	00:45:00	["S2024006"]	1st Year consultation for Personal Issues	TEACHER001	\N	Complex coding concepts and data organization methods confuse me.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.3	\N	\N	\N	f
561	2025-07-15 14:33:12.831732	00:30:00	["S2024002"]	2nd Year consultation for Academic Stress	TEACHER001	\N	I'm stressed about my academic standing and its future implications.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.6	\N	\N	\N	f
553	2025-07-12 14:33:12.830732	00:45:00	["S2024008"]	1st Year consultation for Academic Stress	TEACHER002	\N	Here are four variations:	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.6	\N	\N	\N	f
574	2025-08-04 14:33:12.832738	00:45:00	["S2024004"]	2nd Year consultation for Learning Difficulties	TEACHER001	\N	Information about scholarship opportunities and applications	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
562	2025-07-08 14:33:12.831732	01:00:00	["S2024006"]	2nd Year consultation for Academic Stress	TEACHER003	\N	I'm having trouble concentrating due to emotional difficulties.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.3	\N	\N	\N	f
567	2025-07-10 14:33:12.831732	01:00:00	["S2024005"]	2nd Year consultation for Academic Stress	TEACHER002	\N	Psychological challenges are making it hard to function normally.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.9	\N	\N	\N	f
564	2025-03-16 14:33:12.831732	00:45:00	["S2024002"]	2nd Year consultation for Academic Stress	TEACHER003	\N	Struggling to grasp computational thinking and algorithmic problem-solving.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.1	\N	\N	\N	f
534	2025-05-17 14:33:12.830732	00:30:00	["S2024008"]	Individual consultation session addressing is anyone else drowning in assignments and feeling utterly depleted?. Duration: 00:30:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER001	\N	Is anyone else drowning in assignments and feeling utterly depleted?	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
566	2025-04-02 14:33:12.831732	01:00:00	["S2024008"]	2nd Year consultation for Academic Stress	TEACHER001	\N	Programming logic and data management techniques are overwhelming.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
535	2025-03-28 14:33:12.830732	00:30:00	["S2024004"]	Individual consultation session addressing my anxiety spikes whenever i face academic evaluations.. Duration: 00:30:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER001	\N	My anxiety spikes whenever I face academic evaluations.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.6	\N	\N	\N	f
575	2025-06-15 14:33:12.832738	00:45:00	["S2024005"]	2nd Year consultation for Learning Difficulties	TEACHER003	\N	So, I'm on probation because my GPA is seriously low?	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.7	\N	\N	\N	f
576	2025-06-13 14:33:12.832738	00:30:00	["S2024006"]	2nd Year consultation for Learning Difficulties	TEACHER003	\N	Is there something wrong with me? I've completely lost the spark.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
536	2025-06-18 14:33:12.830732	01:00:00	["S2024005"]	Individual consultation session addressing does anyone else struggle with the cramming cycle because of delaying tasks?. Duration: 01:00:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER002	\N	Does anyone else struggle with the cramming cycle because of delaying tasks?	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.7	\N	\N	\N	f
537	2025-03-22 14:33:12.830732	01:00:00	["S2024007"]	Individual consultation session addressing i'm struggling to keep up with the academic demands, unfortunately.. Duration: 01:00:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER001	\N	I'm struggling to keep up with the academic demands, unfortunately.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
538	2025-07-06 14:33:12.830732	00:30:00	["S2024002"]	Individual consultation addressing student's expressed loss of interest in their academic program. Counseling and support were provided to address general inquiries. The student reported an improved understanding of their situation and demonstrated increased confidence. Duration: 00:30:00.	TEACHER001	\N	Losing interest in my academic program	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.6	\N	\N	\N	f
539	2025-08-14 14:33:12.830732	01:00:00	["S2024002"]	Individual consultation session addressing struggling with advanced mathematics concepts and problem-solving. Duration: 01:00:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER002	\N	Struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.6	\N	\N	\N	f
540	2025-03-02 14:33:12.830732	01:00:00	["S2024001"]	Individual consultation session addressing i'm struggling with both the physics equations *and* the lab work.. Duration: 01:00:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER002	\N	I'm struggling with both the physics equations *and* the lab work.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.6	\N	\N	\N	f
541	2025-08-14 14:33:12.830732	00:45:00	["S2024007"]	Individual consultation session addressing mental health struggles are interfering with my academic focus.. Duration: 00:45:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER001	\N	Mental health struggles are interfering with my academic focus.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.1	\N	\N	\N	f
582	2025-05-12 14:33:12.832738	00:30:00	["S2024007"]	2nd Year consultation for Learning Difficulties	TEACHER001	\N	I need help figuring out my course schedule and degree path.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4	\N	\N	\N	f
583	2025-03-19 14:33:12.832738	00:45:00	["S2024007"]	2nd Year consultation for Learning Difficulties	TEACHER001	\N	I'm just exhausted, both mentally and emotionally, by the workload.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
595	2025-07-24 14:33:12.832738	01:00:00	["S2024003"]	2nd Year consultation for Social Integration	TEACHER002	\N	Lack of engagement and enthusiasm for coursework	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
608	2025-06-11 14:33:12.833734	00:45:00	["22-3191-534"]	3rd Year consultation for Academic Stress	TEACHER002	\N	Difficulty managing time between multiple assignments and deadlines	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
596	2025-03-26 14:33:12.832738	01:00:00	["22-3191-534"]	2nd Year consultation for Social Integration	TEACHER003	\N	My performance falls short of what I thought I could achieve.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.9	\N	\N	\N	f
588	2025-05-24 14:33:12.832738	01:00:00	["S2024003"]	2nd Year consultation for Personal Issues	TEACHER001	\N	Is there a better way to study? My time management needs serious help.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.3	\N	\N	\N	f
542	2025-06-24 14:33:12.830732	00:45:00	["S2024003"]	Individual consultation session addressing i'm dealing with poor grades in multiple subjects affecting overall gpa. Duration: 00:45:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER002	\N	I'm dealing with poor grades in multiple subjects affecting overall gpa	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.3	\N	\N	\N	f
543	2025-03-26 14:33:12.830732	01:00:00	["S2024005"]	Individual consultation session addressing wow, physics labs and those equations are seriously overwhelming, right?. Duration: 01:00:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER001	\N	Wow, physics labs and those equations are seriously overwhelming, right?	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4	\N	\N	\N	f
544	2025-03-07 14:33:12.830732	01:00:00	["S2024007"]	Individual consultation session addressing i get panic attacks when confronted with exams or speaking.. Duration: 01:00:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER001	\N	I get panic attacks when confronted with exams or speaking.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.4	\N	\N	\N	f
591	2025-07-14 14:33:12.832738	01:00:00	["22-3191-534"]	2nd Year consultation for Personal Issues	TEACHER001	\N	Will my record hurt my chances down the line? I'm concerned.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.8	\N	\N	\N	f
545	2025-08-07 14:33:12.830732	00:30:00	["S2024007"]	Individual consultation session addressing i'm struggling; my belief in myself is really tanking my grades.. Duration: 00:30:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER001	\N	I'm struggling; my belief in myself is really tanking my grades.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.7	\N	\N	\N	f
546	2025-04-18 14:33:12.830732	00:30:00	["S2024006"]	Individual consultation session addressing my mind keeps wandering; how can i stay on track while i study?. Duration: 00:30:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER003	\N	My mind keeps wandering; how can I stay on track while I study?	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.2	\N	\N	\N	f
598	2025-04-14 14:33:12.833734	00:45:00	["S2024005"]	2nd Year consultation for Social Integration	TEACHER002	\N	Enrollment is a total paperwork nightmare, right?	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.7	\N	\N	\N	f
547	2025-03-08 14:33:12.830732	00:45:00	["S2024007"]	Individual consultation session addressing stats and data analysis is absolutely drowning me right now!. Duration: 00:45:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER003	\N	Stats and data analysis is absolutely drowning me right now!	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.4	\N	\N	\N	f
548	2025-07-03 14:33:12.830732	00:45:00	["S2024006"]	Individual consultation session addressing complex coding concepts and data organization methods confuse me.. Duration: 00:45:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER001	\N	Complex coding concepts and data organization methods confuse me.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.3	\N	\N	\N	f
549	2025-04-14 14:33:12.830732	00:45:00	["S2024002"]	Individual consultation session addressing stress-related physical symptoms affecting studies. Duration: 00:45:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER001	\N	Stress-related physical symptoms affecting studies	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.8	\N	\N	\N	f
612	2025-07-05 14:33:12.833734	00:45:00	["S2024004"]	3rd Year consultation for Academic Stress	TEACHER002	\N	Struggling to reach the academic standards I set for myself.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	5	\N	\N	\N	f
615	2025-07-23 14:33:12.833734	00:45:00	["S2024006"]	3rd Year consultation for Academic Stress	TEACHER001	\N	Academic assessments trigger intense anxiety and panic responses.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
550	2025-04-16 14:33:12.830732	01:00:00	["22-3191-534"]	Individual consultation session addressing student's expressed questioning of commitment to current studies. Provided counseling and support to address underlying personal issues impacting academic motivation. The student reported improved understanding and confidence in their academic pursuits. Duration: 01:00:00.	TEACHER002	\N	Questioning my commitment to current studies	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4	\N	\N	\N	f
620	2025-06-22 14:33:12.833734	00:45:00	["S2024001"]	3rd Year consultation for Academic Stress	TEACHER001	\N	Severe nervousness overwhelms me during tests and presentations.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
551	2025-06-08 14:33:12.830732	01:00:00	["S2024002"]	Individual consultation session addressing finding the physics equations and experiments incredibly difficult, honestly.. Duration: 01:00:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER001	\N	Finding the physics equations and experiments incredibly difficult, honestly.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.6	\N	\N	\N	f
616	2025-03-08 14:33:12.833734	01:00:00	["S2024008"]	3rd Year consultation for Academic Stress	TEACHER002	\N	Mental wellness issues are affecting my ability to handle daily tasks.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.9	\N	\N	\N	f
632	2025-06-29 14:33:12.834733	00:30:00	["S2024005"]	3rd Year consultation for Career Guidance	TEACHER003	\N	My emotional state is disrupting my normal academic functioning.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.7	\N	\N	\N	f
552	2025-07-04 14:33:12.830732	00:45:00	["S2024002"]	Individual consultation session addressing career guidance and professional development opportunities. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER003	\N	Career guidance and professional development opportunities	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.9	\N	\N	\N	f
553	2025-07-12 14:33:12.830732	00:45:00	["S2024008"]	Individual consultation session addressing here are four variations:. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	Here are four variations:	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.6	\N	\N	\N	f
555	2025-07-10 14:33:12.831732	00:30:00	["S2024004"]	Individual consultation session addressing my goals feel distant; is this even what i want anymore?. Duration: 00:30:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER002	\N	My goals feel distant; is this even what I want anymore?	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
625	2025-06-26 14:33:12.833734	00:45:00	["S2024007"]	3rd Year consultation for Academic Stress	TEACHER003	\N	Seriously struggling academically; currently on probation.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
556	2025-04-29 14:33:12.831732	00:30:00	["22-3191-534"]	Individual consultation session addressing honestly, this semester is crushing me emotionally and mentally.. Duration: 00:30:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER001	\N	Honestly, this semester is crushing me emotionally and mentally.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.3	\N	\N	\N	f
557	2025-08-03 14:33:12.831732	00:30:00	["S2024007"]	Individual consultation session addressing biology laboratory practicals and experiments challenging. Duration: 00:30:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER003	\N	Biology laboratory practicals and experiments challenging	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.4	\N	\N	\N	f
627	2025-08-08 14:33:12.833734	00:45:00	["S2024001"]	3rd Year consultation for Career Guidance	TEACHER002	\N	Ugh, my study methods are a mess, hindering my actual output!	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.8	\N	\N	\N	f
642	2025-03-21 14:33:12.834733	00:30:00	["S2024001"]	3rd Year consultation for Learning Difficulties	TEACHER003	\N	The workload in this CS class is crushing my confidence, honestly.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.7	\N	\N	\N	f
558	2025-06-08 14:33:12.831732	01:00:00	["S2024004"]	Individual consultation session addressing the student's primary concern of pervasive academic performance anxiety. Counseling and support interventions specifically targeting academic stress issues were implemented. The student reported a positive outcome, expressing improved understanding of their anxiety triggers and enhanced confidence in managing their academic workload. Duration: 01:00:00.	TEACHER001	\N	Anxiety about academic performance is consuming	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.2	\N	\N	\N	f
560	2025-03-16 14:33:12.831732	00:45:00	["S2024001"]	Individual consultation session addressing the student's expressed uncertainty regarding research methodology and thesis writing requirements. Counseling and support were provided to address associated academic stress. The student reported improved understanding and demonstrated increased confidence in their academic pursuits. Duration: 00:45:00.	TEACHER002	\N	Research methodology and thesis writing requirements unclear	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
561	2025-07-15 14:33:12.831732	00:30:00	["S2024002"]	Individual consultation session addressing i'm stressed about my academic standing and its future implications.. Duration: 00:30:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER001	\N	I'm stressed about my academic standing and its future implications.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.6	\N	\N	\N	f
639	2025-07-08 14:33:12.834733	00:30:00	["S2024005"]	3rd Year consultation for Career Guidance	TEACHER002	\N	Fear and anxiety completely take over during academic evaluations.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.5	\N	\N	\N	f
562	2025-07-08 14:33:12.831732	01:00:00	["S2024006"]	Individual consultation session addressing i'm having trouble concentrating due to emotional difficulties.. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER003	\N	I'm having trouble concentrating due to emotional difficulties.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.3	\N	\N	\N	f
563	2025-04-14 14:33:12.831732	00:45:00	["S2024001"]	Individual consultation session addressing i'm dealing with low test scores and quiz performance impacting final grades. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER001	\N	I'm dealing with low test scores and quiz performance impacting final grades	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.5	\N	\N	\N	f
652	2025-05-14 14:33:12.834733	01:00:00	["22-3191-534"]	3rd Year consultation for Personal Issues	TEACHER003	\N	Software development concepts and computational methods are tough.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.6	\N	\N	\N	f
651	2025-07-15 14:33:12.834733	00:45:00	["S2024004"]	3rd Year consultation for Personal Issues	TEACHER001	\N	Where do I go for help with campus resources and services?	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.7	\N	\N	\N	f
658	2025-04-06 14:33:12.834733	01:00:00	["S2024003"]	3rd Year consultation for Social Integration	TEACHER003	\N	I'm struggling to manage my time; my assignments are piling up.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4	\N	\N	\N	f
564	2025-03-16 14:33:12.831732	00:45:00	["S2024002"]	Individual consultation session addressing the student's difficulties in computational thinking and algorithmic problem-solving. Counseling and support were provided to address academic stress contributing to these challenges. The student expressed an improved understanding of the concepts and demonstrated increased confidence. Duration: 00:45:00.	TEACHER003	\N	Struggling to grasp computational thinking and algorithmic problem-solving.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.1	\N	\N	\N	f
565	2025-08-12 14:33:12.831732	01:00:00	["S2024003"]	Individual consultation session addressing disappointed with my academic results despite working hard.. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER003	\N	Disappointed with my academic results despite working hard.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
566	2025-04-02 14:33:12.831732	01:00:00	["S2024008"]	Individual consultation session addressing programming logic and data management techniques are overwhelming.. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER001	\N	Programming logic and data management techniques are overwhelming.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
567	2025-07-10 14:33:12.831732	01:00:00	["S2024005"]	Individual consultation session addressing psychological challenges are making it hard to function normally.. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	Psychological challenges are making it hard to function normally.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.9	\N	\N	\N	f
568	2025-08-14 14:33:12.831732	01:00:00	["S2024008"]	Individual consultation session addressing the student's concern of academic pressure impacting their mental well-being. Counseling and support were provided to address academic stress. The student reported improved understanding and confidence. Duration: 01:00:00.	TEACHER002	\N	Academic pressure is affecting my mental well-being	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.7	\N	\N	\N	f
569	2025-06-16 14:33:12.831732	01:00:00	["S2024007"]	Individual consultation session focused on declining academic performance. Counseling and support were provided to address underlying academic stress. The student reported an improved understanding of their challenges and an increase in self-efficacy. Duration: 01:00:00.	TEACHER003	\N	I'm dealing with academic performance declining compared to previous semester	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.7	\N	\N	\N	f
710	2025-08-06 14:33:12.83686	00:30:00	["S2024001"]	4th Year consultation for Learning Difficulties	TEACHER003	\N	Feeling overwhelmed; I need help organizing my study schedule.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.7	\N	\N	\N	f
570	2025-04-16 14:33:12.831732	01:00:00	["S2024004"]	Individual consultation session addressing the student's concerns regarding the challenges presented by biology laboratory practicals and experiments. Counseling and support were provided to address academic stress issues. The student expressed improved understanding and a noted increase in confidence. Duration: 01:00:00.	TEACHER002	\N	I'm dealing with biology laboratory practicals and experiments challenging	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.8	\N	\N	\N	f
571	2025-08-08 14:33:12.831732	00:45:00	["S2024002"]	Individual consultation addressing student difficulty with chemistry course content and confusion regarding chemical reactions. Counseling and support were provided to address related academic stress. The student expressed improved understanding of the material and increased confidence in their abilities. Duration: 00:45:00.	TEACHER003	\N	I'm dealing with chemistry course content and chemical reactions confusing	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
709	2025-04-27 14:33:12.83686	00:30:00	["S2024008"]	4th Year consultation for Learning Difficulties	TEACHER002	\N	Academic life right now is a major source of stress for me.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.4	\N	\N	\N	f
572	2025-02-24 14:33:12.831732	00:45:00	["S2024006"]	Individual consultation session addressing are there any mental health resources available on campus?. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER001	\N	Are there any mental health resources available on campus?	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
573	2025-03-10 14:33:12.831732	01:00:00	["S2024001"]	Individual consultation session addressing computer science fundamentals like algorithms are really challenging.. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER001	\N	Computer science fundamentals like algorithms are really challenging.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.2	\N	\N	\N	f
574	2025-08-04 14:33:12.832738	00:45:00	["S2024004"]	Individual consultation session addressing student concerns regarding scholarship opportunities and application processes. Counseling and support were provided to address underlying learning difficulties potentially impacting the student's academic success. The student expressed improved understanding of scholarship applications and demonstrated enhanced confidence. Duration: 00:45:00.	TEACHER001	\N	Information about scholarship opportunities and applications	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
712	2025-03-14 14:33:12.83686	01:00:00	["S2024005"]	4th Year consultation for General Inquiries	TEACHER003	\N	So much to do, and I'm just completely freaked out about it all.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
660	2025-06-09 14:33:12.834733	00:45:00	["S2024005"]	4th Year consultation for Career Guidance	TEACHER003	\N	Dealing with emotional stress that's impacting my focus.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
705	2025-05-21 14:33:12.83686	01:00:00	["S2024007"]	4th Year consultation for Personal Issues	TEACHER002	\N	Mental health concerns are affecting my everyday academic performance.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.3	\N	\N	\N	f
707	2025-06-20 14:33:12.83686	00:45:00	["S2024008"]	4th Year consultation for Personal Issues	TEACHER003	\N	This probation thing? Yeah, it's because I'm failing classes.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.7	\N	\N	\N	f
657	2025-08-14 14:33:12.834733	00:30:00	["S2024005"]	3rd Year consultation for General Inquiries	TEACHER002	\N	Ugh, the classes are a lot, and I'm emotionally spent from it all.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
659	2025-05-03 14:33:12.834733	01:00:00	["S2024002"]	3rd Year consultation for Social Integration	TEACHER003	\N	Could someone clarify the graduation rules and academic stuff for me?	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.7	\N	\N	\N	f
708	2025-05-03 14:33:12.83686	00:30:00	["S2024005"]	4th Year consultation for Learning Difficulties	TEACHER001	\N	Need help understanding the policies and requirements for my degree.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
714	2025-02-25 14:33:12.83686	01:00:00	["S2024002"]	4th Year consultation for Social Integration	TEACHER001	\N	Experiencing poor grades in multiple subjects affecting overall gpa	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.5	\N	\N	\N	f
706	2025-03-17 14:33:12.83686	00:30:00	["S2024004"]	4th Year consultation for Personal Issues	TEACHER001	\N	Currently facing lost sense of purpose and direction in studies	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
711	2025-04-16 14:33:12.83686	00:45:00	["S2024002"]	4th Year consultation for Learning Difficulties	TEACHER003	\N	Experiencing academic performance declining compared to previous semester	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.3	\N	\N	\N	f
661	2025-04-20 14:33:12.834733	01:00:00	["S2024007"]	4th Year consultation for Career Guidance	TEACHER002	\N	Experiencing career guidance and professional development opportunities	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
599	2025-03-13 14:33:12.833734	01:00:00	["22-3191-534"]	2nd Year consultation for Social Integration	TEACHER002	\N	My workload feels chaotic; I'm always behind on deadlines.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
533	2025-04-04 14:33:12.830732	01:00:00	["S2024002"]	1st Year consultation for General Inquiries	TEACHER002	\N	Academics have me wound up; I can't seem to relax with all this pressure.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.4	\N	\N	\N	f
619	2025-03-16 14:33:12.833734	00:30:00	["S2024008"]	3rd Year consultation for Academic Stress	TEACHER002	\N	I'm constantly on edge, feeling the strain of keeping up with everything.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4	\N	\N	\N	f
628	2025-05-25 14:33:12.833734	00:45:00	["S2024007"]	3rd Year consultation for Career Guidance	TEACHER003	\N	The sheer volume of studying has my anxiety levels through the roof.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	5	\N	\N	\N	f
575	2025-06-15 14:33:12.832738	00:45:00	["S2024005"]	Individual consultation session addressing the student's academic probation status due to a low GPA. Counseling and support were provided to address underlying learning difficulties. The student expressed improved understanding of the issues and increased confidence in their ability to improve their academic standing. Duration: 00:45:00.	TEACHER003	\N	So, I'm on probation because my GPA is seriously low?	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.7	\N	\N	\N	f
633	2025-07-18 14:33:12.834733	00:45:00	["S2024001"]	3rd Year consultation for Career Guidance	TEACHER001	\N	Feeling the burn, and the weight of my classes is crushing me.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.5	\N	\N	\N	f
576	2025-06-13 14:33:12.832738	00:30:00	["S2024006"]	Individual counseling session addressing the student's expressed concern of a perceived loss of motivation and "spark." Counseling and support were provided to address underlying learning difficulties contributing to the student's feelings. The student reported an improved understanding of the issues and exhibited increased confidence. Duration: 00:30:00.	TEACHER003	\N	Is there something wrong with me? I've completely lost the spark.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
577	2025-06-15 14:33:12.832738	01:00:00	["22-3191-534"]	Individual consultation session addressing currently facing low test scores and quiz performance impacting final grades. Duration: 01:00:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER002	\N	Currently facing low test scores and quiz performance impacting final grades	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
578	2025-07-13 14:33:12.832738	01:00:00	["S2024005"]	Individual consultation session addressing personal emotional challenges are affecting my study concentration.. Duration: 01:00:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER002	\N	Personal emotional challenges are affecting my study concentration.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.6	\N	\N	\N	f
579	2025-04-09 14:33:12.832738	00:45:00	["22-3191-534"]	Individual consultation session addressing struggling to maintain the gpa i need for my goals. Duration: 00:45:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER002	\N	Struggling to maintain the GPA I need for my goals	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4	\N	\N	\N	f
580	2025-07-03 14:33:12.832738	00:30:00	["S2024006"]	Individual consultation session addressing the student's struggle with advanced mathematics concepts and problem-solving. Counseling and support were provided to address learning difficulties related to the subject matter. The student expressed improved understanding and confidence following the session. Duration: 00:30:00.	TEACHER002	\N	I'm dealing with struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.6	\N	\N	\N	f
581	2025-07-09 14:33:12.832738	00:45:00	["S2024004"]	Individual consultation session addressing the abstract nature of programming concepts is hard to comprehend.. Duration: 00:45:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER002	\N	The abstract nature of programming concepts is hard to comprehend.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.3	\N	\N	\N	f
582	2025-05-12 14:33:12.832738	00:30:00	["S2024007"]	Individual consultation session addressing concerns regarding course schedule and degree path selection. Counseling and support were provided to address underlying learning difficulties impacting academic planning. The student reported enhanced understanding of academic options and expressed increased confidence. Duration: 00:30:00.	TEACHER001	\N	I need help figuring out my course schedule and degree path.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4	\N	\N	\N	f
583	2025-03-19 14:33:12.832738	00:45:00	["S2024007"]	Individual consultation session focused on student-reported mental and emotional exhaustion stemming from workload pressures. Counseling and support were provided to address learning difficulties contributing to the student's distress. The student reported improved understanding and confidence as a result of the session. Duration: 00:45:00.	TEACHER001	\N	I'm just exhausted, both mentally and emotionally, by the workload.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
584	2025-06-01 14:33:12.832738	01:00:00	["S2024002"]	Individual consultation session addressing my test scores aren't reflecting the time i put into studying. Duration: 01:00:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER003	\N	My test scores aren't reflecting the time I put into studying	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.5	\N	\N	\N	f
585	2025-03-21 14:33:12.832738	01:00:00	["S2024005"]	Individual consultation session addressing need help with low test scores and quiz performance impacting final grades. Duration: 01:00:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER001	\N	Need help with low test scores and quiz performance impacting final grades	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.9	\N	\N	\N	f
586	2025-07-28 14:33:12.832738	00:45:00	["S2024002"]	Individual consultation addressing career guidance and professional development. Counseling and support were provided to address underlying personal issues impacting career exploration. The student expressed improved understanding and increased confidence regarding their professional goals. Duration: 00:45:00.	TEACHER001	\N	I'm dealing with career guidance and professional development opportunities	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.5	\N	\N	\N	f
587	2025-07-31 14:33:12.832738	01:00:00	["S2024007"]	Individual consultation session addressing my grades are slipping and i need help getting back on track. Duration: 01:00:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER002	\N	My grades are slipping and I need help getting back on track	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.5	\N	\N	\N	f
588	2025-05-24 14:33:12.832738	01:00:00	["S2024003"]	Individual consultation session focused on the student's expressed concern regarding study habits and time management skills. Counseling and support were provided to address personal issues impacting academic performance. The student reported enhanced understanding of strategies and demonstrated increased confidence. Duration: 01:00:00.	TEACHER001	\N	Is there a better way to study? My time management needs serious help.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.3	\N	\N	\N	f
589	2025-04-24 14:33:12.832738	01:00:00	["22-3191-534"]	Individual consultation session addressing ugh, my procrastination habits are definitely hurting my grades; it's always a rush.. Duration: 01:00:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER003	\N	Ugh, my procrastination habits are definitely hurting my grades; it's always a rush.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.6	\N	\N	\N	f
590	2025-06-30 14:33:12.832738	00:30:00	["S2024002"]	Individual consultation session addressing this coursework load leaves me feeling overwhelmed and emotionally wrecked.. Duration: 00:30:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER001	\N	This coursework load leaves me feeling overwhelmed and emotionally wrecked.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
591	2025-07-14 14:33:12.832738	01:00:00	["22-3191-534"]	Individual consultation session addressing the student's concern regarding the potential impact of their record. Counseling and support were provided to address the student's personal issues. The student expressed improved understanding and increased confidence following the session. Duration: 01:00:00.	TEACHER001	\N	Will my record hurt my chances down the line? I'm concerned.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.8	\N	\N	\N	f
592	2025-07-01 14:33:12.832738	01:00:00	["S2024004"]	Individual consultation session addressing is it normal to feel so insecure that it impacts my schoolwork?. Duration: 01:00:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER003	\N	Is it normal to feel so insecure that it impacts my schoolwork?	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
593	2025-08-13 14:33:12.832738	00:30:00	["S2024006"]	Individual consultation session addressing currently facing poor grades in multiple subjects affecting overall gpa. Duration: 00:30:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER001	\N	Currently facing poor grades in multiple subjects affecting overall gpa	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.9	\N	\N	\N	f
594	2025-05-15 14:33:12.832738	01:00:00	["S2024007"]	Individual consultation session addressing having difficulty keeping up with course requirements. Duration: 01:00:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER003	\N	Having difficulty keeping up with course requirements	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.9	\N	\N	\N	f
595	2025-07-24 14:33:12.832738	01:00:00	["S2024003"]	Individual consultation session addressing student's lack of engagement and enthusiasm for coursework. Counseling and support were provided to address social integration issues. The student expressed improved understanding and confidence as a result. Duration: 01:00:00.	TEACHER002	\N	Lack of engagement and enthusiasm for coursework	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
596	2025-03-26 14:33:12.832738	01:00:00	["22-3191-534"]	Individual consultation focused on the student's perception of underachieving academic performance. Counseling and support were provided to address social integration issues. The student reported improved understanding and demonstrated increased confidence in addressing their concerns. Duration: 01:00:00.	TEACHER003	\N	My performance falls short of what I thought I could achieve.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.9	\N	\N	\N	f
597	2025-04-26 14:33:12.833734	00:30:00	["S2024006"]	Individual consultation session addressing the student's challenges with biology laboratory practicals and experiments. Counseling and support were provided to facilitate social integration. The student expressed improved understanding and confidence as a result. Duration: 00:30:00.	TEACHER003	\N	Currently facing biology laboratory practicals and experiments challenging	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.2	\N	\N	\N	f
598	2025-04-14 14:33:12.833734	00:45:00	["S2024005"]	Individual consultation focused on the student's expressed concerns regarding the enrollment process. Counseling and support were provided to address social integration issues. The student reported improved understanding and confidence. Duration: 00:45:00.	TEACHER002	\N	Enrollment is a total paperwork nightmare, right?	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.7	\N	\N	\N	f
599	2025-03-13 14:33:12.833734	01:00:00	["22-3191-534"]	Individual consultation focused on the student's expressed concern of a chaotic workload and difficulty meeting deadlines. Counseling and support were provided to address social integration issues. The student reported enhanced understanding and confidence as a result of the session. Duration: 01:00:00.	TEACHER002	\N	My workload feels chaotic; I'm always behind on deadlines.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
600	2025-02-18 14:33:12.833734	01:00:00	["S2024008"]	Individual consultation session addressing seriously struggling to fit everything in with my schedule.. Duration: 01:00:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER003	\N	Seriously struggling to fit everything in with my schedule.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
601	2025-07-16 14:33:12.833734	00:45:00	["S2024005"]	Individual consultation session addressing coding theory and data structure implementations are confusing.. Duration: 00:45:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER001	\N	Coding theory and data structure implementations are confusing.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.5	\N	\N	\N	f
602	2025-07-20 14:33:12.833734	01:00:00	["22-3191-534"]	Individual consultation session addressing student confusion regarding chemistry course content and chemical reactions. Provided counseling and support to address general inquiries and identified areas of difficulty. The student expressed improved understanding and confidence in their grasp of the material. Duration: 01:00:00.	TEACHER003	\N	Currently facing chemistry course content and chemical reactions confusing	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
603	2025-06-30 14:33:12.833734	01:00:00	["S2024002"]	Individual consultation session focusing on the student's struggles with advanced mathematics concepts and problem-solving. Counseling and support were provided to address general inquiry issues. The student reported an improved understanding and greater confidence. Duration: 01:00:00.	TEACHER003	\N	Currently facing struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.5	\N	\N	\N	f
604	2025-06-13 14:33:12.833734	01:00:00	["S2024001"]	Individual consultation session addressing juggling my job and classes is totally overwhelming, honestly.. Duration: 01:00:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER001	\N	Juggling my job and classes is totally overwhelming, honestly.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.1	\N	\N	\N	f
605	2025-06-14 14:33:12.833734	00:30:00	["S2024004"]	Individual consultation session addressing algorithmic thinking and programming paradigms are difficult to master.. Duration: 00:30:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER003	\N	Algorithmic thinking and programming paradigms are difficult to master.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.4	\N	\N	\N	f
606	2025-07-20 14:33:12.833734	01:00:00	["S2024005"]	Individual consultation session addressing i'm a little lost on what i need to graduate, policy-wise.. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	I'm a little lost on what I need to graduate, policy-wise.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4	\N	\N	\N	f
607	2025-07-26 14:33:12.833734	00:30:00	["S2024007"]	Individual consultation focused on declining academic performance. Counseling and support were provided to address academic stress issues. The student expressed improved understanding and confidence. Duration: 00:30:00.	TEACHER002	\N	Currently facing academic performance declining compared to previous semester	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.8	\N	\N	\N	f
608	2025-06-11 14:33:12.833734	00:45:00	["22-3191-534"]	Individual consultation session addressing the student's concern regarding time management challenges amidst multiple assignments and deadlines. Counseling and support were provided to address associated academic stress. The student expressed improved understanding of time management techniques and demonstrated increased confidence in their ability to manage deadlines. Duration: 00:45:00.	TEACHER002	\N	Difficulty managing time between multiple assignments and deadlines	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
609	2025-05-20 14:33:12.833734	01:00:00	["S2024006"]	Individual consultation session addressing is it even possible to balance work and school successfully?. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER001	\N	Is it even possible to balance work and school successfully?	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.6	\N	\N	\N	f
610	2025-07-12 14:33:12.833734	00:45:00	["S2024008"]	Individual consultation session addressing guidance on my major and how to stay on track, please?. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER001	\N	Guidance on my major and how to stay on track, please?	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.8	\N	\N	\N	f
611	2025-04-27 14:33:12.833734	01:00:00	["S2024006"]	Individual consultation session addressing university workload is causing overwhelming stress. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER003	\N	University workload is causing overwhelming stress	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.4	\N	\N	\N	f
612	2025-07-05 14:33:12.833734	00:45:00	["S2024004"]	Individual consultation session addressing the student's self-identified struggle to meet academic standards. Counseling and support were provided to address academic stress concerns. The student expressed improved understanding and confidence as a result. Duration: 00:45:00.	TEACHER002	\N	Struggling to reach the academic standards I set for myself.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	5	\N	\N	\N	f
613	2025-05-26 14:33:12.833734	00:30:00	["S2024005"]	Individual consultation session addressing ugh, i'm totally lost; my ambitions have just...vanished.. Duration: 00:30:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER003	\N	Ugh, I'm totally lost; my ambitions have just...vanished.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.8	\N	\N	\N	f
614	2025-04-09 14:33:12.833734	00:30:00	["22-3191-534"]	Individual consultation session focused on career guidance and professional development exploration. Counseling and support were provided to address associated academic stress. The student reported improved understanding and expressed increased confidence. Duration: 00:30:00.	TEACHER002	\N	Currently facing career guidance and professional development opportunities	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
615	2025-07-23 14:33:12.833734	00:45:00	["S2024006"]	Individual consultation session focusing on academic assessment-related anxiety and panic. Provided counseling and support to address academic stress issues. The student expressed improved understanding and confidence regarding anxiety management strategies. Duration: 00:45:00.	TEACHER001	\N	Academic assessments trigger intense anxiety and panic responses.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
616	2025-03-08 14:33:12.833734	01:00:00	["S2024008"]	Individual consultation session addressing the student's concern regarding mental wellness issues impacting daily task management. Counseling and support were provided to address academic stress. The student expressed improved understanding and confidence following the session. Duration: 01:00:00.	TEACHER002	\N	Mental wellness issues are affecting my ability to handle daily tasks.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.9	\N	\N	\N	f
617	2025-08-09 14:33:12.833734	00:30:00	["S2024002"]	Individual consultation session focused on the student's reported exhaustion due to constant worry regarding assignments. Counseling and support were provided to address academic stress issues. The student reported improved understanding and confidence following the session. Duration: 00:30:00.	TEACHER003	\N	Constant worry about assignments is exhausting	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	5	\N	\N	\N	f
618	2025-07-29 14:33:12.833734	00:45:00	["22-3191-534"]	Individual consultation session focused on the student's concern of maintaining engagement with learning. Counseling and support were provided to address academic stress issues. The student expressed improved understanding and confidence following the session. Duration: 00:45:00.	TEACHER001	\N	Struggling to maintain engagement with learning	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.9	\N	\N	\N	f
619	2025-03-16 14:33:12.833734	00:30:00	["S2024008"]	Individual consultation session addressing i'm constantly on edge, feeling the strain of keeping up with everything.. Duration: 00:30:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	I'm constantly on edge, feeling the strain of keeping up with everything.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4	\N	\N	\N	f
620	2025-06-22 14:33:12.833734	00:45:00	["S2024001"]	Individual consultation session addressing the student's significant test and presentation anxiety. Counseling and support were provided to address academic stress. The student reported enhanced understanding and demonstrated increased confidence in managing their anxiety. Duration: 00:45:00.	TEACHER001	\N	Severe nervousness overwhelms me during tests and presentations.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
621	2025-06-15 14:33:12.833734	00:45:00	["S2024008"]	Individual consultation focused on challenges with biology laboratory practicals and experiments. Counseling and support were provided to address associated academic stress. The student expressed improved understanding and increased confidence following the 45-minute session. Duration: 00:45:00.	TEACHER003	\N	Need help with biology laboratory practicals and experiments challenging	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.4	\N	\N	\N	f
622	2025-03-10 14:33:12.833734	00:45:00	["S2024003"]	Individual consultation session addressing need help with poor grades in multiple subjects affecting overall gpa. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	Need help with poor grades in multiple subjects affecting overall gpa	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.2	\N	\N	\N	f
623	2025-07-29 14:33:12.833734	00:45:00	["S2024005"]	Individual consultation session focused on the student's struggle with advanced mathematics concepts and problem-solving. Counseling and support were provided to address associated academic stress issues. The student expressed improved understanding of the material and demonstrated increased confidence. Duration: 00:45:00.	TEACHER003	\N	Need help with struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.1	\N	\N	\N	f
624	2025-02-21 14:33:12.833734	01:00:00	["S2024001"]	Individual consultation focused on career guidance and professional development needs. Counseling and support were provided to address academic stress contributing to the student's concerns. The student expressed improved understanding of their situation and increased confidence. Duration: 01:00:00.	TEACHER002	\N	Need help with career guidance and professional development opportunities	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.1	\N	\N	\N	f
625	2025-06-26 14:33:12.833734	00:45:00	["S2024007"]	Individual consultation session focused on addressing academic struggles and probation status. Counseling and support were provided to address academic stress and related concerns. The student expressed improved understanding and confidence regarding their academic situation. Duration: 00:45:00.	TEACHER003	\N	Seriously struggling academically; currently on probation.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
626	2025-03-18 14:33:12.833734	00:30:00	["S2024007"]	Individual consultation session addressing my part-time job is making studying incredibly difficult right now.. Duration: 00:30:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER003	\N	My part-time job is making studying incredibly difficult right now.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
627	2025-08-08 14:33:12.833734	00:45:00	["S2024001"]	Individual consultation session addressing the student's concern regarding ineffective study methods impacting academic output. Counseling and support were provided for career guidance issues. The student expressed improved understanding and confidence in their approach. Duration: 00:45:00.	TEACHER002	\N	Ugh, my study methods are a mess, hindering my actual output!	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.8	\N	\N	\N	f
628	2025-05-25 14:33:12.833734	00:45:00	["S2024007"]	Individual consultation session addressing the sheer volume of studying has my anxiety levels through the roof.. Duration: 00:45:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER003	\N	The sheer volume of studying has my anxiety levels through the roof.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	5	\N	\N	\N	f
629	2025-05-24 14:33:12.833734	00:45:00	["22-3191-534"]	Individual consultation session addressing student-reported stress-related physical symptoms impacting academic performance. Counseling and support were provided to address career guidance concerns. The student expressed improved understanding and increased confidence. Duration: 00:45:00.	TEACHER002	\N	Stress-related physical symptoms affecting studies - need guidance	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.9	\N	\N	\N	f
630	2025-06-28 14:33:12.834733	00:30:00	["S2024001"]	Individual consultation session addressing is there enough time for both academics *and* my activities?. Duration: 00:30:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER001	\N	Is there enough time for both academics *and* my activities?	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4	\N	\N	\N	f
631	2025-08-15 14:33:12.834733	00:45:00	["S2024006"]	Individual consultation session addressing academic performance is declining despite my best efforts. Duration: 00:45:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER002	\N	Academic performance is declining despite my best efforts	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4	\N	\N	\N	f
632	2025-06-29 14:33:12.834733	00:30:00	["S2024005"]	Individual counseling session addressing student-reported emotional disruption of academic functioning. Career guidance counseling and support were provided to address the student's concerns. The student reported improved understanding and expressed increased confidence following the session. Duration: 00:30:00.	TEACHER003	\N	My emotional state is disrupting my normal academic functioning.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.7	\N	\N	\N	f
633	2025-07-18 14:33:12.834733	00:45:00	["S2024001"]	Individual consultation session addressing feeling the burn, and the weight of my classes is crushing me.. Duration: 00:45:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER001	\N	Feeling the burn, and the weight of my classes is crushing me.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.5	\N	\N	\N	f
634	2025-04-09 14:33:12.834733	00:45:00	["S2024005"]	Individual consultation session addressing my transcript's impact is a big deal; i need help with my grades.. Duration: 00:45:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER001	\N	My transcript's impact is a big deal; I need help with my grades.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.7	\N	\N	\N	f
635	2025-04-17 14:33:12.834733	00:30:00	["22-3191-534"]	Individual consultation session addressing i'm dealing with lost sense of purpose and direction in studies. Duration: 00:30:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER003	\N	I'm dealing with lost sense of purpose and direction in studies	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
636	2025-07-14 14:33:12.834733	00:45:00	["S2024002"]	Individual consultation addressing student disengagement and lack of enthusiasm for coursework. Counseling and support were provided, focusing on career guidance. The student expressed improved understanding of career pathways and increased confidence. Duration: 00:45:00.	TEACHER002	\N	Currently facing lack of engagement and enthusiasm for coursework	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.6	\N	\N	\N	f
637	2025-06-18 14:33:12.834733	00:30:00	["S2024003"]	Individual consultation session addressing struggling with low test scores and quiz performance impacting final grades. Duration: 00:30:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER001	\N	Struggling with low test scores and quiz performance impacting final grades	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
638	2025-04-09 14:33:12.834733	01:00:00	["S2024006"]	Individual consultation session focused on the student's reported difficulties with biology laboratory practicals and experiments. Counseling and support were provided to address related career guidance issues. The student expressed improved understanding and demonstrated enhanced confidence. Duration: 01:00:00.	TEACHER002	\N	Struggling with biology laboratory practicals and experiments challenging	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.2	\N	\N	\N	f
639	2025-07-08 14:33:12.834733	00:30:00	["S2024005"]	Individual consultation session addressing the student's reported experience of overwhelming fear and anxiety during academic evaluations. Counseling and support for career guidance issues were provided. The student expressed improved understanding and increased confidence. Duration: 00:30:00.	TEACHER002	\N	Fear and anxiety completely take over during academic evaluations.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.5	\N	\N	\N	f
640	2025-08-10 14:33:12.834733	00:45:00	["S2024004"]	Individual consultation session addressing it looks like i'm not succeeding academically, which is tough.. Duration: 00:45:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER002	\N	It looks like I'm not succeeding academically, which is tough.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
641	2025-04-01 14:33:12.834733	01:00:00	["S2024001"]	Individual consultation session focused on the student's struggles with advanced mathematics concepts and problem-solving. Counseling and support for learning difficulties were provided. Consequently, the student expressed improved understanding and demonstrated increased confidence in the subject matter. Duration: 01:00:00.	TEACHER001	\N	Struggling with struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.6	\N	\N	\N	f
642	2025-03-21 14:33:12.834733	00:30:00	["S2024001"]	Individual consultation addressing academic self-efficacy concerns related to a Computer Science course. Counseling and support were provided to address learning difficulties. The student expressed improved understanding and confidence regarding the course material. Duration: 00:30:00.	TEACHER003	\N	The workload in this CS class is crushing my confidence, honestly.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.7	\N	\N	\N	f
643	2025-07-04 14:33:12.834733	00:45:00	["S2024007"]	Individual consultation session focused on the student's struggle with advanced mathematics concepts and problem-solving. Counseling and support were provided to address learning difficulties. The student reported improved understanding and confidence in the subject matter. Duration: 00:45:00.	TEACHER003	\N	Experiencing struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.7	\N	\N	\N	f
644	2025-06-26 14:33:12.834733	00:30:00	["S2024004"]	Individual consultation session addressing uh oh, my academic performance is concerning me about my record.. Duration: 00:30:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER002	\N	Uh oh, my academic performance is concerning me about my record.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.1	\N	\N	\N	f
645	2025-07-26 14:33:12.834733	01:00:00	["S2024004"]	Individual consultation session focused on career guidance and professional development concerns. Counseling and support were provided to address learning difficulties impacting career exploration. The student expressed improved understanding and confidence regarding their professional trajectory. Duration: 01:00:00.	TEACHER003	\N	Struggling with career guidance and professional development opportunities	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.3	\N	\N	\N	f
646	2025-05-21 14:33:12.834733	00:45:00	["S2024007"]	Individual consultation session addressing student concerns regarding stress-related physical symptoms impacting academic performance. Counseling and support were provided to address underlying learning difficulties. The student expressed improved understanding and increased confidence in managing their challenges. Duration: 00:45:00.	TEACHER002	\N	Having issues with stress-related physical symptoms affecting studies	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
647	2025-07-06 14:33:12.834733	01:00:00	["S2024004"]	Individual consultation session addressing is anyone else finding this statistics coursework completely brutal?. Duration: 01:00:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER003	\N	Is anyone else finding this statistics coursework completely brutal?	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.5	\N	\N	\N	f
669	2025-06-05 14:33:12.83573	00:45:00	["S2024008"]	4th Year consultation for Career Guidance	TEACHER001	\N	My coursework is totally overwhelming, and it's messing with my head.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.7	\N	\N	\N	f
699	2025-05-07 14:33:12.83686	01:00:00	["S2024003"]	4th Year consultation for Academic Stress	TEACHER002	\N	These coding projects are seriously overwhelming, I'm drowning.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.1	\N	\N	\N	f
523	2025-04-17 14:33:12.830732	00:30:00	["S2024004"]	1st Year consultation for Social Integration	TEACHER001	\N	I'm not performing at the level I expected myself to.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
565	2025-08-12 14:33:12.831732	01:00:00	["S2024003"]	2nd Year consultation for Academic Stress	TEACHER003	\N	Disappointed with my academic results despite working hard.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
541	2025-08-14 14:33:12.830732	00:45:00	["S2024007"]	1st Year consultation for Learning Difficulties	TEACHER001	\N	Mental health struggles are interfering with my academic focus.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.1	\N	\N	\N	f
578	2025-07-13 14:33:12.832738	01:00:00	["S2024005"]	2nd Year consultation for Learning Difficulties	TEACHER002	\N	Personal emotional challenges are affecting my study concentration.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.6	\N	\N	\N	f
544	2025-03-07 14:33:12.830732	01:00:00	["S2024007"]	1st Year consultation for Learning Difficulties	TEACHER001	\N	I get panic attacks when confronted with exams or speaking.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.4	\N	\N	\N	f
683	2025-03-22 14:33:12.83573	01:00:00	["22-3191-534"]	4th Year consultation for Career Guidance	TEACHER003	\N	I panic whenever I have to present or take tests.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.5	\N	\N	\N	f
691	2025-07-14 14:33:12.83686	00:45:00	["S2024002"]	4th Year consultation for Academic Stress	TEACHER003	\N	Test anxiety and presentation fears are crippling my performance.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.8	\N	\N	\N	f
655	2025-02-20 14:33:12.834733	00:30:00	["S2024004"]	3rd Year consultation for General Inquiries	TEACHER001	\N	Psychological stress is impacting my day-to-day study abilities.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.8	\N	\N	\N	f
573	2025-03-10 14:33:12.831732	01:00:00	["S2024001"]	2nd Year consultation for Academic Stress	TEACHER001	\N	Computer science fundamentals like algorithms are really challenging.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.2	\N	\N	\N	f
581	2025-07-09 14:33:12.832738	00:45:00	["S2024004"]	2nd Year consultation for Learning Difficulties	TEACHER002	\N	The abstract nature of programming concepts is hard to comprehend.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.3	\N	\N	\N	f
601	2025-07-16 14:33:12.833734	00:45:00	["S2024005"]	2nd Year consultation for General Inquiries	TEACHER001	\N	Coding theory and data structure implementations are confusing.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.5	\N	\N	\N	f
605	2025-06-14 14:33:12.833734	00:30:00	["S2024004"]	2nd Year consultation for Career Guidance	TEACHER003	\N	Algorithmic thinking and programming paradigms are difficult to master.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.4	\N	\N	\N	f
671	2025-05-27 14:33:12.83573	00:30:00	["S2024002"]	4th Year consultation for Career Guidance	TEACHER002	\N	I'm struggling to get things done, and my studying feels all over the place.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.6	\N	\N	\N	f
634	2025-04-09 14:33:12.834733	00:45:00	["S2024005"]	3rd Year consultation for Career Guidance	TEACHER001	\N	My transcript's impact is a big deal; I need help with my grades.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.7	\N	\N	\N	f
644	2025-06-26 14:33:12.834733	00:30:00	["S2024004"]	3rd Year consultation for Learning Difficulties	TEACHER002	\N	Uh oh, my academic performance is concerning me about my record.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.1	\N	\N	\N	f
653	2025-03-22 14:33:12.834733	00:45:00	["S2024004"]	3rd Year consultation for Personal Issues	TEACHER001	\N	I'm worried about my transcript and how it reflects my work.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.6	\N	\N	\N	f
681	2025-06-22 14:33:12.83573	01:00:00	["22-3191-534"]	4th Year consultation for Career Guidance	TEACHER003	\N	My notes and planner are a mess; how do I get things together?	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
695	2025-07-07 14:33:12.83686	00:45:00	["S2024005"]	4th Year consultation for Academic Stress	TEACHER002	\N	Honestly, I'm just not feeling it for this program anymore.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.7	\N	\N	\N	f
610	2025-07-12 14:33:12.833734	00:45:00	["S2024008"]	3rd Year consultation for Academic Stress	TEACHER001	\N	Guidance on my major and how to stay on track, please?	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.8	\N	\N	\N	f
686	2025-03-09 14:33:12.83573	00:45:00	["S2024006"]	4th Year consultation for Academic Stress	TEACHER002	\N	Okay, here are three unique ways a student could express the academic concern "General academic advising and program planning":	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.1	\N	\N	\N	f
513	2025-07-27 14:33:12.829724	00:30:00	["S2024002"]	1st Year consultation for Social Integration	TEACHER002	\N	Coursework's got me completely drained; I'm burnt out emotionally.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.3	\N	\N	\N	f
556	2025-04-29 14:33:12.831732	00:30:00	["22-3191-534"]	2nd Year consultation for Academic Stress	TEACHER001	\N	Honestly, this semester is crushing me emotionally and mentally.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.3	\N	\N	\N	f
590	2025-06-30 14:33:12.832738	00:30:00	["S2024002"]	2nd Year consultation for Personal Issues	TEACHER001	\N	This coursework load leaves me feeling overwhelmed and emotionally wrecked.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
604	2025-06-13 14:33:12.833734	01:00:00	["S2024001"]	2nd Year consultation for Career Guidance	TEACHER001	\N	Juggling my job and classes is totally overwhelming, honestly.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.1	\N	\N	\N	f
609	2025-05-20 14:33:12.833734	01:00:00	["S2024006"]	3rd Year consultation for Academic Stress	TEACHER001	\N	Is it even possible to balance work and school successfully?	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.6	\N	\N	\N	f
626	2025-03-18 14:33:12.833734	00:30:00	["S2024007"]	3rd Year consultation for Career Guidance	TEACHER003	\N	My part-time job is making studying incredibly difficult right now.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
725	2025-07-31 12:30:00	01:30:00	["13", "12"]	Group consultation session addressing academic performance concerns. Duration: 01:30:00. Students showed excellent engagement and progress.	22-3191-535	Consultation session transcript - Academic Performance discussion with detailed explanations and student questions addressed comprehensively.	This semester's work is just crushing me; is anyone else struggling?	Provided academic resources and study materials for improvement	Student demonstrated improved understanding and confidence	\N	Library Private Study Room	\N	4.5	\N	\N	\N	f
722	2025-07-08 13:30:00	01:15:00	["12"]	Individual consultation session addressing time management concerns. Duration: 01:15:00. Students showed good engagement and progress.	22-3191-535	Consultation session transcript - Time Management discussion with detailed explanations and student questions addressed comprehensively.	I'm dealing with difficulty prioritizing multiple assignments and project deadlines	Developed accountability system for deadline management	Student demonstrated improved understanding and confidence	\N	Department Conference Room	\N	3.9	\N	\N	\N	f
723	2025-07-27 15:00:00	01:30:00	["11", "9", "8"]	Group consultation session addressing time management concerns. Duration: 01:30:00. Students showed excellent engagement and progress.	22-3191-535	Consultation session transcript - Time Management discussion with detailed explanations and student questions addressed comprehensively.	Ugh, I'm terrible at balancing studying with, like, everything else.	Developed accountability system for deadline management	Student needs additional follow-up sessions for continued support	\N	Department Conference Room	\N	4.2	\N	\N	\N	f
546	2025-04-18 14:33:12.830732	00:30:00	["S2024006"]	1st Year consultation for Learning Difficulties	TEACHER003	\N	My mind keeps wandering; how can I stay on track while I study?	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.2	\N	\N	\N	f
547	2025-03-08 14:33:12.830732	00:45:00	["S2024007"]	1st Year consultation for Personal Issues	TEACHER003	\N	Stats and data analysis is absolutely drowning me right now!	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.4	\N	\N	\N	f
647	2025-07-06 14:33:12.834733	01:00:00	["S2024004"]	3rd Year consultation for Learning Difficulties	TEACHER003	\N	Is anyone else finding this statistics coursework completely brutal?	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.5	\N	\N	\N	f
517	2025-05-16 14:33:12.830732	00:45:00	["S2024004"]	1st Year consultation for Social Integration	TEACHER003	\N	Balancing clubs and classes feels impossible, time-wise!	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.9	\N	\N	\N	f
600	2025-02-18 14:33:12.833734	01:00:00	["S2024008"]	2nd Year consultation for General Inquiries	TEACHER003	\N	Seriously struggling to fit everything in with my schedule.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
630	2025-06-28 14:33:12.834733	00:30:00	["S2024001"]	3rd Year consultation for Career Guidance	TEACHER001	\N	Is there enough time for both academics *and* my activities?	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4	\N	\N	\N	f
531	2025-03-19 14:33:12.830732	00:45:00	["S2024006"]	1st Year consultation for General Inquiries	TEACHER002	\N	Are those complex physics problems and experiments just brutal for everyone?	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.7	\N	\N	\N	f
540	2025-03-02 14:33:12.830732	01:00:00	["S2024001"]	1st Year consultation for Learning Difficulties	TEACHER002	\N	I'm struggling with both the physics equations *and* the lab work.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.6	\N	\N	\N	f
543	2025-03-26 14:33:12.830732	01:00:00	["S2024005"]	1st Year consultation for Learning Difficulties	TEACHER001	\N	Wow, physics labs and those equations are seriously overwhelming, right?	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4	\N	\N	\N	f
551	2025-06-08 14:33:12.830732	01:00:00	["S2024002"]	1st Year consultation for Personal Issues	TEACHER001	\N	Finding the physics equations and experiments incredibly difficult, honestly.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.6	\N	\N	\N	f
702	2025-07-14 14:33:12.83686	00:45:00	["S2024005"]	4th Year consultation for Personal Issues	TEACHER001	\N	Physics equations and labs are really hitting me hard; it's tough.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.8	\N	\N	\N	f
545	2025-08-07 14:33:12.830732	00:30:00	["S2024007"]	1st Year consultation for Learning Difficulties	TEACHER001	\N	I'm struggling; my belief in myself is really tanking my grades.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.7	\N	\N	\N	f
592	2025-07-01 14:33:12.832738	01:00:00	["S2024004"]	2nd Year consultation for Personal Issues	TEACHER003	\N	Is it normal to feel so insecure that it impacts my schoolwork?	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
519	2025-02-26 14:33:12.830732	00:45:00	["S2024007"]	1st Year consultation for Social Integration	TEACHER003	\N	I could really use some help from the counseling center, you know?	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
572	2025-02-24 14:33:12.831732	00:45:00	["S2024006"]	2nd Year consultation for Academic Stress	TEACHER001	\N	Are there any mental health resources available on campus?	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
648	2025-03-17 14:33:12.834733	00:30:00	["S2024007"]	3rd Year consultation for Learning Difficulties	TEACHER003	\N	Feeling overwhelmed; seeking support for my well-being.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.8	\N	\N	\N	f
606	2025-07-20 14:33:12.833734	01:00:00	["S2024005"]	3rd Year consultation for Academic Stress	TEACHER002	\N	I'm a little lost on what I need to graduate, policy-wise.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4	\N	\N	\N	f
525	2025-05-19 14:33:12.830732	01:00:00	["S2024002"]	1st Year consultation for Social Integration	TEACHER001	\N	I'm always putting things off, which means all-nighters before deadlines.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.7	\N	\N	\N	f
536	2025-06-18 14:33:12.830732	01:00:00	["S2024005"]	1st Year consultation for General Inquiries	TEACHER002	\N	Does anyone else struggle with the cramming cycle because of delaying tasks?	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.7	\N	\N	\N	f
589	2025-04-24 14:33:12.832738	01:00:00	["22-3191-534"]	2nd Year consultation for Personal Issues	TEACHER003	\N	Ugh, my procrastination habits are definitely hurting my grades; it's always a rush.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.6	\N	\N	\N	f
524	2025-07-15 14:33:12.830732	00:45:00	["S2024008"]	1st Year consultation for Social Integration	TEACHER003	\N	Am I falling short of what's expected in my classes?	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.3	\N	\N	\N	f
537	2025-03-22 14:33:12.830732	01:00:00	["S2024007"]	1st Year consultation for General Inquiries	TEACHER001	\N	I'm struggling to keep up with the academic demands, unfortunately.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
640	2025-08-10 14:33:12.834733	00:45:00	["S2024004"]	3rd Year consultation for Career Guidance	TEACHER002	\N	It looks like I'm not succeeding academically, which is tough.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
698	2025-03-08 14:33:12.83686	01:00:00	["S2024006"]	4th Year consultation for Academic Stress	TEACHER002	\N	My grades aren't cutting it, and I'm not hitting the mark.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.2	\N	\N	\N	f
555	2025-07-10 14:33:12.831732	00:30:00	["S2024004"]	1st Year consultation for Career Guidance	TEACHER002	\N	My goals feel distant; is this even what I want anymore?	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
613	2025-05-26 14:33:12.833734	00:30:00	["S2024005"]	3rd Year consultation for Academic Stress	TEACHER003	\N	Ugh, I'm totally lost; my ambitions have just...vanished.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.8	\N	\N	\N	f
521	2025-04-13 14:33:12.830732	00:45:00	["22-3191-534"]	1st Year consultation for Social Integration	TEACHER001	\N	Academic expectations versus reality is causing me stress	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4	\N	\N	\N	f
579	2025-04-09 14:33:12.832738	00:45:00	["22-3191-534"]	2nd Year consultation for Learning Difficulties	TEACHER002	\N	Struggling to maintain the GPA I need for my goals	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4	\N	\N	\N	f
584	2025-06-01 14:33:12.832738	01:00:00	["S2024002"]	2nd Year consultation for Learning Difficulties	TEACHER003	\N	My test scores aren't reflecting the time I put into studying	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.5	\N	\N	\N	f
587	2025-07-31 14:33:12.832738	01:00:00	["S2024007"]	2nd Year consultation for Personal Issues	TEACHER002	\N	My grades are slipping and I need help getting back on track	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.5	\N	\N	\N	f
594	2025-05-15 14:33:12.832738	01:00:00	["S2024007"]	2nd Year consultation for Social Integration	TEACHER003	\N	Having difficulty keeping up with course requirements	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.9	\N	\N	\N	f
631	2025-08-15 14:33:12.834733	00:45:00	["S2024006"]	3rd Year consultation for Career Guidance	TEACHER002	\N	Academic performance is declining despite my best efforts	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4	\N	\N	\N	f
654	2025-08-07 14:33:12.834733	00:45:00	["S2024006"]	3rd Year consultation for Personal Issues	TEACHER003	\N	Having issues with difficulty maintaining required gpa for scholarship	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
611	2025-04-27 14:33:12.833734	01:00:00	["S2024006"]	3rd Year consultation for Academic Stress	TEACHER003	\N	University workload is causing overwhelming stress	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.4	\N	\N	\N	f
542	2025-06-24 14:33:12.830732	00:45:00	["S2024003"]	1st Year consultation for Learning Difficulties	TEACHER002	\N	I'm dealing with poor grades in multiple subjects affecting overall gpa	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.3	\N	\N	\N	f
593	2025-08-13 14:33:12.832738	00:30:00	["S2024006"]	2nd Year consultation for Personal Issues	TEACHER001	\N	Currently facing poor grades in multiple subjects affecting overall gpa	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.9	\N	\N	\N	f
622	2025-03-10 14:33:12.833734	00:45:00	["S2024003"]	3rd Year consultation for Academic Stress	TEACHER002	\N	Need help with poor grades in multiple subjects affecting overall gpa	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.2	\N	\N	\N	f
650	2025-06-13 14:33:12.834733	00:30:00	["S2024006"]	3rd Year consultation for Personal Issues	TEACHER003	\N	Struggling with poor grades in multiple subjects affecting overall gpa	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.3	\N	\N	\N	f
635	2025-04-17 14:33:12.834733	00:30:00	["22-3191-534"]	3rd Year consultation for Career Guidance	TEACHER003	\N	I'm dealing with lost sense of purpose and direction in studies	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
563	2025-04-14 14:33:12.831732	00:45:00	["S2024001"]	2nd Year consultation for Academic Stress	TEACHER001	\N	I'm dealing with low test scores and quiz performance impacting final grades	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.5	\N	\N	\N	f
577	2025-06-15 14:33:12.832738	01:00:00	["22-3191-534"]	2nd Year consultation for Learning Difficulties	TEACHER002	\N	Currently facing low test scores and quiz performance impacting final grades	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
585	2025-03-21 14:33:12.832738	01:00:00	["S2024005"]	2nd Year consultation for Learning Difficulties	TEACHER001	\N	Need help with low test scores and quiz performance impacting final grades	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.9	\N	\N	\N	f
637	2025-06-18 14:33:12.834733	00:30:00	["S2024003"]	3rd Year consultation for Career Guidance	TEACHER001	\N	Struggling with low test scores and quiz performance impacting final grades	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
538	2025-07-06 14:33:12.830732	00:30:00	["S2024002"]	1st Year consultation for General Inquiries	TEACHER001	\N	Losing interest in my academic program	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.6	\N	\N	\N	f
550	2025-04-16 14:33:12.830732	01:00:00	["22-3191-534"]	1st Year consultation for Personal Issues	TEACHER002	\N	Questioning my commitment to current studies	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4	\N	\N	\N	f
569	2025-06-16 14:33:12.831732	01:00:00	["S2024007"]	2nd Year consultation for Academic Stress	TEACHER003	\N	I'm dealing with academic performance declining compared to previous semester	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.7	\N	\N	\N	f
607	2025-07-26 14:33:12.833734	00:30:00	["S2024007"]	3rd Year consultation for Academic Stress	TEACHER002	\N	Currently facing academic performance declining compared to previous semester	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.8	\N	\N	\N	f
649	2025-05-24 14:33:12.834733	00:45:00	["S2024005"]	3rd Year consultation for Personal Issues	TEACHER002	\N	Need help with academic performance declining compared to previous semester	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	5	\N	\N	\N	f
656	2025-07-03 14:33:12.834733	00:45:00	["S2024001"]	3rd Year consultation for General Inquiries	TEACHER003	\N	Struggling with academic performance declining compared to previous semester	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
571	2025-08-08 14:33:12.831732	00:45:00	["S2024002"]	2nd Year consultation for Academic Stress	TEACHER003	\N	I'm dealing with chemistry course content and chemical reactions confusing	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
602	2025-07-20 14:33:12.833734	01:00:00	["22-3191-534"]	2nd Year consultation for General Inquiries	TEACHER003	\N	Currently facing chemistry course content and chemical reactions confusing	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
580	2025-07-03 14:33:12.832738	00:30:00	["S2024006"]	2nd Year consultation for Learning Difficulties	TEACHER002	\N	I'm dealing with struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.6	\N	\N	\N	f
603	2025-06-30 14:33:12.833734	01:00:00	["S2024002"]	2nd Year consultation for General Inquiries	TEACHER003	\N	Currently facing struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.5	\N	\N	\N	f
623	2025-07-29 14:33:12.833734	00:45:00	["S2024005"]	3rd Year consultation for Academic Stress	TEACHER003	\N	Need help with struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.1	\N	\N	\N	f
641	2025-04-01 14:33:12.834733	01:00:00	["S2024001"]	3rd Year consultation for Learning Difficulties	TEACHER001	\N	Struggling with struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.6	\N	\N	\N	f
643	2025-07-04 14:33:12.834733	00:45:00	["S2024007"]	3rd Year consultation for Learning Difficulties	TEACHER003	\N	Experiencing struggling with advanced mathematics concepts and problem-solving	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.7	\N	\N	\N	f
554	2025-06-28 14:33:12.830732	01:00:00	["S2024007"]	1st Year consultation for Academic Stress	TEACHER001	\N	The pressure to succeed is mentally draining	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.3	\N	\N	\N	f
558	2025-06-08 14:33:12.831732	01:00:00	["S2024004"]	2nd Year consultation for Academic Stress	TEACHER001	\N	Anxiety about academic performance is consuming	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.2	\N	\N	\N	f
559	2025-08-15 14:33:12.831732	00:45:00	["S2024002"]	2nd Year consultation for Academic Stress	TEACHER003	\N	Academic stress is impacting my daily functioning	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.4	\N	\N	\N	f
568	2025-08-14 14:33:12.831732	01:00:00	["S2024008"]	2nd Year consultation for Academic Stress	TEACHER002	\N	Academic pressure is affecting my mental well-being	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.7	\N	\N	\N	f
617	2025-08-09 14:33:12.833734	00:30:00	["S2024002"]	3rd Year consultation for Academic Stress	TEACHER003	\N	Constant worry about assignments is exhausting	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	5	\N	\N	\N	f
629	2025-05-24 14:33:12.833734	00:45:00	["22-3191-534"]	3rd Year consultation for Career Guidance	TEACHER002	\N	Stress-related physical symptoms affecting studies - need guidance	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.9	\N	\N	\N	f
646	2025-05-21 14:33:12.834733	00:45:00	["S2024007"]	3rd Year consultation for Learning Difficulties	TEACHER002	\N	Having issues with stress-related physical symptoms affecting studies	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
586	2025-07-28 14:33:12.832738	00:45:00	["S2024002"]	2nd Year consultation for Personal Issues	TEACHER001	\N	I'm dealing with career guidance and professional development opportunities	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.5	\N	\N	\N	f
614	2025-04-09 14:33:12.833734	00:30:00	["22-3191-534"]	3rd Year consultation for Academic Stress	TEACHER002	\N	Currently facing career guidance and professional development opportunities	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
624	2025-02-21 14:33:12.833734	01:00:00	["S2024001"]	3rd Year consultation for Academic Stress	TEACHER002	\N	Need help with career guidance and professional development opportunities	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.1	\N	\N	\N	f
645	2025-07-26 14:33:12.834733	01:00:00	["S2024004"]	3rd Year consultation for Learning Difficulties	TEACHER003	\N	Struggling with career guidance and professional development opportunities	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.3	\N	\N	\N	f
570	2025-04-16 14:33:12.831732	01:00:00	["S2024004"]	2nd Year consultation for Academic Stress	TEACHER002	\N	I'm dealing with biology laboratory practicals and experiments challenging	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.8	\N	\N	\N	f
597	2025-04-26 14:33:12.833734	00:30:00	["S2024006"]	2nd Year consultation for Social Integration	TEACHER003	\N	Currently facing biology laboratory practicals and experiments challenging	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.2	\N	\N	\N	f
621	2025-06-15 14:33:12.833734	00:45:00	["S2024008"]	3rd Year consultation for Academic Stress	TEACHER003	\N	Need help with biology laboratory practicals and experiments challenging	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.4	\N	\N	\N	f
638	2025-04-09 14:33:12.834733	01:00:00	["S2024006"]	3rd Year consultation for Career Guidance	TEACHER002	\N	Struggling with biology laboratory practicals and experiments challenging	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.2	\N	\N	\N	f
713	2025-04-23 14:33:12.83686	00:30:00	["S2024008"]	4th Year consultation for General Inquiries	TEACHER002	\N	I'm dealing with research methodology and thesis writing requirements unclear	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.2	\N	\N	\N	f
618	2025-07-29 14:33:12.833734	00:45:00	["22-3191-534"]	3rd Year consultation for Academic Stress	TEACHER001	\N	Struggling to maintain engagement with learning	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.9	\N	\N	\N	f
636	2025-07-14 14:33:12.834733	00:45:00	["S2024002"]	3rd Year consultation for Career Guidance	TEACHER002	\N	Currently facing lack of engagement and enthusiasm for coursework	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.6	\N	\N	\N	f
554	2025-06-28 14:33:12.830732	01:00:00	["S2024007"]	Individual consultation session addressing student-reported mental fatigue stemming from the pressure to succeed. Counseling and support strategies were provided to address academic stress issues. The student expressed improved understanding of their stressors and a boost in confidence. Duration: 01:00:00.	TEACHER001	\N	The pressure to succeed is mentally draining	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.3	\N	\N	\N	f
559	2025-08-15 14:33:12.831732	00:45:00	["S2024002"]	Individual consultation session focused on the student's concern regarding academic stress impacting daily functioning. Counseling and support were provided to address the identified stressors. The student reported an improved understanding of the issues and expressed increased confidence. Duration: 00:45:00.	TEACHER003	\N	Academic stress is impacting my daily functioning	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.4	\N	\N	\N	f
648	2025-03-17 14:33:12.834733	00:30:00	["S2024007"]	Individual consultation session addressing feeling overwhelmed; seeking support for my well-being.. Duration: 00:30:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER003	\N	Feeling overwhelmed; seeking support for my well-being.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.8	\N	\N	\N	f
649	2025-05-24 14:33:12.834733	00:45:00	["S2024005"]	Individual consultation session focused on declining academic performance. Counseling and support were provided to address underlying personal issues impacting academic performance. The student expressed improved understanding and confidence following the session. Duration: 00:45:00.	TEACHER002	\N	Need help with academic performance declining compared to previous semester	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	5	\N	\N	\N	f
650	2025-06-13 14:33:12.834733	00:30:00	["S2024006"]	Individual consultation session addressing struggling with poor grades in multiple subjects affecting overall gpa. Duration: 00:30:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER003	\N	Struggling with poor grades in multiple subjects affecting overall gpa	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.3	\N	\N	\N	f
651	2025-07-15 14:33:12.834733	00:45:00	["S2024004"]	Individual consultation session addressing student concerns regarding access to campus resources and services. Provided counseling and support for personal issues to facilitate resource navigation. The student expressed improved understanding and confidence. Duration: 00:45:00.	TEACHER001	\N	Where do I go for help with campus resources and services?	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.7	\N	\N	\N	f
652	2025-05-14 14:33:12.834733	01:00:00	["22-3191-534"]	Individual consultation addressing student difficulties with software development concepts and computational methods. Counseling and support for personal issues were provided. The student reported improved understanding and expressed increased confidence. Duration: 01:00:00.	TEACHER003	\N	Software development concepts and computational methods are tough.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.6	\N	\N	\N	f
653	2025-03-22 14:33:12.834733	00:45:00	["S2024004"]	Individual consultation session addressing i'm worried about my transcript and how it reflects my work.. Duration: 00:45:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER001	\N	I'm worried about my transcript and how it reflects my work.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.6	\N	\N	\N	f
654	2025-08-07 14:33:12.834733	00:45:00	["S2024006"]	Individual consultation session addressing having issues with difficulty maintaining required gpa for scholarship. Duration: 00:45:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER003	\N	Having issues with difficulty maintaining required gpa for scholarship	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
655	2025-02-20 14:33:12.834733	00:30:00	["S2024004"]	Individual consultation session addressing psychological stress is impacting my day-to-day study abilities.. Duration: 00:30:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER001	\N	Psychological stress is impacting my day-to-day study abilities.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.8	\N	\N	\N	f
656	2025-07-03 14:33:12.834733	00:45:00	["S2024001"]	Individual consultation session focused on a student's reported decline in academic performance compared to the previous semester. Counseling and support were provided to address general academic inquiries. The student expressed improved understanding and confidence regarding their academic challenges during the 45-minute session. Duration: 00:45:00.	TEACHER003	\N	Struggling with academic performance declining compared to previous semester	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
657	2025-08-14 14:33:12.834733	00:30:00	["S2024005"]	Individual consultation session addressing ugh, the classes are a lot, and i'm emotionally spent from it all.. Duration: 00:30:00. Provided counseling and support for general inquiries issues Student expressed improved understanding and confidence	TEACHER002	\N	Ugh, the classes are a lot, and I'm emotionally spent from it all.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
658	2025-04-06 14:33:12.834733	01:00:00	["S2024003"]	Individual consultation focused on the student's reported difficulties with time management and assignment completion. Counseling and support for social integration issues were provided. The student expressed improved understanding and confidence. Duration: 01:00:00.	TEACHER003	\N	I'm struggling to manage my time; my assignments are piling up.	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4	\N	\N	\N	f
659	2025-05-03 14:33:12.834733	01:00:00	["S2024002"]	Individual consultation session addressing could someone clarify the graduation rules and academic stuff for me?. Duration: 01:00:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER003	\N	Could someone clarify the graduation rules and academic stuff for me?	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.7	\N	\N	\N	f
660	2025-06-09 14:33:12.834733	00:45:00	["S2024005"]	Individual consultation session addressing emotional stress affecting focus. Provided counseling and support, specifically concerning career guidance. The student expressed improved understanding and confidence as a result of the session. Duration: 00:45:00.	TEACHER003	\N	Dealing with emotional stress that's impacting my focus.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
661	2025-04-20 14:33:12.834733	01:00:00	["S2024007"]	Individual consultation session addressing experiencing career guidance and professional development opportunities. Duration: 01:00:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER002	\N	Experiencing career guidance and professional development opportunities	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
662	2025-06-08 14:33:12.834733	00:45:00	["S2024001"]	Individual consultation session focused on student-reported high levels of stress and anxiety related to academic pursuits. Counseling and support were provided, specifically addressing career guidance issues. The student expressed an improved understanding of their concerns and demonstrated increased confidence. Duration: 00:45:00.	TEACHER001	\N	Experiencing high levels of stress and anxiety about studies	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.9	\N	\N	\N	f
663	2025-06-29 14:33:12.834733	00:30:00	["S2024004"]	Individual consultation session addressing the student's difficulties with computer science programming assignments. Counseling and support were provided regarding career guidance issues. The student expressed improved understanding and confidence in addressing their academic challenges. Duration: 00:30:00.	TEACHER001	\N	Computer science programming assignments too difficult	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.8	\N	\N	\N	f
664	2025-05-09 14:33:12.834733	01:00:00	["S2024004"]	Individual consultation session addressing the student's concern of academic achievement not meeting personal expectations. Counseling and support were provided for career guidance issues. The student expressed improved understanding and confidence as a result. Duration: 01:00:00.	TEACHER003	\N	Academic achievement not meeting personal expectations	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.7	\N	\N	\N	f
665	2025-03-24 14:33:12.83573	01:00:00	["S2024002"]	Individual consultation session focused on student requests for university facility and service information. Provided counseling and support to address underlying career guidance concerns. The student expressed improved understanding and confidence regarding their career exploration. Duration: 01:00:00.	TEACHER001	\N	University facility and service information requests	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.5	\N	\N	\N	f
666	2025-04-02 14:33:12.83573	00:30:00	["S2024007"]	Individual consultation focused on addressing the student's academic probation stemming from poor academic standing. Counseling and support were provided to explore career guidance concerns. As a result of the session, the student expressed improved understanding and increased confidence. Duration: 00:30:00.	TEACHER002	\N	Academic probation due to poor academic standing	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
667	2025-06-14 14:33:12.83573	01:00:00	["S2024008"]	Individual consultation addressing emotional wellbeing concerns impacting concentration. Counseling and support were provided to address career guidance issues. The student expressed improved understanding and confidence as a result. Duration: 01:00:00.	TEACHER001	\N	Emotional wellbeing concerns affecting concentration	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4	\N	\N	\N	f
668	2025-04-23 14:33:12.83573	00:30:00	["S2024004"]	Individual consultation session addressing student-reported productivity issues and inefficient study habits. Counseling and support were provided to address career guidance concerns. The student expressed an improved understanding of their situation and a boost in confidence. Duration: 00:30:00.	TEACHER002	\N	Productivity issues and inefficient study habits	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
669	2025-06-05 14:33:12.83573	00:45:00	["S2024008"]	Individual consultation session addressing my coursework is totally overwhelming, and it's messing with my head.. Duration: 00:45:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER001	\N	My coursework is totally overwhelming, and it's messing with my head.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.7	\N	\N	\N	f
670	2025-04-27 14:33:12.83573	00:45:00	["S2024006"]	Individual consultation session focusing on the student's concerns regarding their academic record and transcript impact. Career guidance counseling and support were provided to address these concerns. The student reported an improved understanding of the situation and expressed increased confidence. Duration: 00:45:00.	TEACHER001	\N	Concerns about academic record and transcript impact	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
671	2025-05-27 14:33:12.83573	00:30:00	["S2024002"]	Individual consultation session addressing i'm struggling to get things done, and my studying feels all over the place.. Duration: 00:30:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER002	\N	I'm struggling to get things done, and my studying feels all over the place.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.6	\N	\N	\N	f
672	2025-06-25 14:33:12.83573	01:00:00	["S2024005"]	Individual consultation session focusing on student-reported difficulties with organization of study materials and scheduling. Counseling and support for career guidance issues were provided. The student expressed improved understanding and demonstrated increased confidence. Duration: 01:00:00.	TEACHER002	\N	Organization problems with study materials and schedules	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.1	\N	\N	\N	f
673	2025-03-06 14:33:12.83573	00:30:00	["S2024002"]	Individual consultation session addressing the student's lack of motivation and interest in their current academic program. Career guidance counseling and support were provided. The student expressed improved understanding and confidence following the session. Duration: 00:30:00.	TEACHER003	\N	Lack of motivation and interest in current academic program	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4	\N	\N	\N	f
674	2025-04-21 14:33:12.83573	00:30:00	["22-3191-534"]	Individual consultation session addressing general academic advising and program planning concerns. Counseling and support were provided to address career guidance issues. The student expressed improved understanding and confidence. Duration: 00:30:00.	TEACHER003	\N	General academic advising and program planning	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.4	\N	\N	\N	f
675	2025-03-29 14:33:12.83573	00:30:00	["22-3191-534"]	Individual consultation session addressing student-reported mental health issues impacting daily functioning. Counseling and support were provided to address career guidance concerns. The student expressed an improved understanding and increased confidence. Duration: 00:30:00.	TEACHER002	\N	Mental health issues impacting daily functioning	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
676	2025-03-11 14:33:12.83573	01:00:00	["S2024003"]	Individual consultation session addressing administrative issues related to enrollment and documentation. Career guidance counseling and support were provided. The student expressed enhanced understanding and reported increased confidence. Duration: 01:00:00.	TEACHER002	\N	Administrative issues with enrollment and documentation	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.3	\N	\N	\N	f
677	2025-05-19 14:33:12.83573	00:45:00	["S2024001"]	Individual consultation session addressing the student's concern that their psychological state was impacting academic performance. Counseling and support were provided for career guidance issues. The student expressed improved understanding and confidence. Duration: 00:45:00.	TEACHER001	\N	My psychological state is affecting my everyday academic tasks.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.2	\N	\N	\N	f
678	2025-04-25 14:33:12.83573	00:30:00	["S2024005"]	Individual consultation session addressing student's expressed feelings of being overwhelmed and emotionally exhausted by coursework. Counseling and support for career guidance issues were provided. The student demonstrated improved understanding and expressed increased confidence. Duration: 00:30:00.	TEACHER003	\N	Feeling overwhelmed and emotionally exhausted from coursework	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.7	\N	\N	\N	f
679	2025-05-02 14:33:12.83573	01:00:00	["S2024007"]	Individual consultation addressing work-life balance challenges stemming from part-time employment and academic pursuits. Counseling and career guidance were provided to address these concerns. The student reported enhanced understanding and demonstrated improved confidence in navigating these challenges. Duration: 01:00:00.	TEACHER001	\N	Work-life balance issues with part-time job and studies	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.1	\N	\N	\N	f
680	2025-08-15 14:33:12.83573	00:30:00	["S2024007"]	Individual consultation session addressing academic probation resulting from a decline in grades. Counseling and support were provided to address career guidance issues. The student expressed an improved understanding of their situation and demonstrated increased confidence. Duration: 00:30:00.	TEACHER002	\N	I'm on academic probation; my grades just tanked this semester.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4	\N	\N	\N	f
681	2025-06-22 14:33:12.83573	01:00:00	["22-3191-534"]	Individual consultation session addressing my notes and planner are a mess; how do i get things together?. Duration: 01:00:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER003	\N	My notes and planner are a mess; how do I get things together?	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.4	\N	\N	\N	f
682	2025-04-18 14:33:12.83573	00:45:00	["S2024004"]	Individual consultation session addressing student-reported anxiety attacks during exams and presentations. Provided counseling and support related to career guidance concerns. The student expressed improved understanding and demonstrated increased confidence. Duration: 00:45:00.	TEACHER003	\N	Anxiety attacks during exams and presentations	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.7	\N	\N	\N	f
683	2025-03-22 14:33:12.83573	01:00:00	["22-3191-534"]	Individual consultation session addressing i panic whenever i have to present or take tests.. Duration: 01:00:00. Provided counseling and support for career guidance issues Student expressed improved understanding and confidence	TEACHER003	\N	I panic whenever I have to present or take tests.	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.5	\N	\N	\N	f
684	2025-03-26 14:33:12.83573	01:00:00	["S2024007"]	Individual consultation session addressing student's expressed concerns regarding overwhelming statistics and data analysis coursework. Counseling and support were provided for career guidance issues related to the student's academic concerns. The student reported an improved understanding of the coursework and demonstrated increased confidence. Duration: 01:00:00.	TEACHER001	\N	Statistics and data analysis coursework overwhelming	Provided counseling and support for career guidance issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.6	\N	\N	\N	f
685	2025-07-10 14:33:12.83573	00:30:00	["S2024007"]	Individual consultation session addressing time allocation challenges with extracurricular activities. Duration: 00:30:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER001	\N	Time allocation challenges with extracurricular activities	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.4	\N	\N	\N	f
686	2025-03-09 14:33:12.83573	00:45:00	["S2024006"]	Individual consultation session addressing okay, here are three unique ways a student could express the academic concern "general academic advising and program planning":. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	Okay, here are three unique ways a student could express the academic concern "General academic advising and program planning":	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.1	\N	\N	\N	f
687	2025-07-14 14:33:12.83573	01:00:00	["S2024006"]	Individual consultation focusing on the student's challenges with complex physics equations and laboratory experiments. Counseling and support were provided to address associated academic stress. The student reported improved understanding and increased confidence regarding the subject matter. Duration: 01:00:00.	TEACHER002	\N	Complex physics equations and laboratory experiments challenging	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.8	\N	\N	\N	f
688	2025-04-11 14:33:12.83573	01:00:00	["S2024006"]	Individual consultation session addressing low self-confidence and self-esteem affecting performance. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	Low self-confidence and self-esteem affecting performance	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4	\N	\N	\N	f
689	2025-06-17 14:33:12.83573	00:45:00	["22-3191-534"]	Individual consultation session addressing need for psychological support and counseling services. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER003	\N	Need for psychological support and counseling services	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4	\N	\N	\N	f
690	2025-08-15 14:33:12.83686	00:45:00	["S2024008"]	Individual consultation session addressing questions about graduation requirements and academic policies. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER003	\N	Questions about graduation requirements and academic policies	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.9	\N	\N	\N	f
691	2025-07-14 14:33:12.83686	00:45:00	["S2024002"]	Individual consultation session addressing test anxiety and presentation fears are crippling my performance.. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER003	\N	Test anxiety and presentation fears are crippling my performance.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.8	\N	\N	\N	f
692	2025-05-25 14:33:12.83686	01:00:00	["S2024007"]	Individual consultation session addressing difficulty understanding programming algorithms and data structures. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	Difficulty understanding programming algorithms and data structures	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	3.7	\N	\N	\N	f
693	2025-03-21 14:33:12.83686	00:30:00	["S2024003"]	Individual consultation session focused on student-reported procrastination challenges resulting in last-minute cramming. Counseling and support were provided to address academic stress contributing to the issue. The student expressed improved understanding of the challenges and demonstrated increased confidence in their ability to manage them. Duration: 00:30:00.	TEACHER002	\N	Procrastination problems leading to last-minute cramming	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.5	\N	\N	\N	f
694	2025-05-20 14:33:12.83686	01:00:00	["S2024003"]	Individual consultation session addressing mental health struggles are disrupting my daily study routine.. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	Mental health struggles are disrupting my daily study routine.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.7	\N	\N	\N	f
695	2025-07-07 14:33:12.83686	00:45:00	["S2024005"]	Individual consultation session addressing honestly, i'm just not feeling it for this program anymore.. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	Honestly, I'm just not feeling it for this program anymore.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.7	\N	\N	\N	f
696	2025-04-12 14:33:12.83686	00:45:00	["S2024007"]	Individual consultation session addressing failing to meet academic requirements and standards. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	Failing to meet academic requirements and standards	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.6	\N	\N	\N	f
697	2025-08-02 14:33:12.83686	00:45:00	["S2024007"]	Individual consultation session addressing feeling disconnected from academic goals and aspirations. Duration: 00:45:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER003	\N	Feeling disconnected from academic goals and aspirations	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.9	\N	\N	\N	f
698	2025-03-08 14:33:12.83686	01:00:00	["S2024006"]	Individual consultation session addressing my grades aren't cutting it, and i'm not hitting the mark.. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	My grades aren't cutting it, and I'm not hitting the mark.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.2	\N	\N	\N	f
699	2025-05-07 14:33:12.83686	01:00:00	["S2024003"]	Individual consultation session addressing these coding projects are seriously overwhelming, i'm drowning.. Duration: 01:00:00. Provided counseling and support for academic stress issues Student expressed improved understanding and confidence	TEACHER002	\N	These coding projects are seriously overwhelming, I'm drowning.	Provided counseling and support for academic stress issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.1	\N	\N	\N	f
700	2025-06-27 14:33:12.83686	00:45:00	["S2024003"]	Individual consultation session addressing ugh, i'm in trouble – academic probation for bad grades.. Duration: 00:45:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER002	\N	Ugh, I'm in trouble – academic probation for bad grades.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.6	\N	\N	\N	f
701	2025-06-13 14:33:12.83686	00:30:00	["S2024001"]	Individual consultation session addressing difficulty maintaining required gpa for scholarship. Duration: 00:30:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER002	\N	Difficulty maintaining required GPA for scholarship	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	4.4	\N	\N	\N	f
702	2025-07-14 14:33:12.83686	00:45:00	["S2024005"]	Individual consultation session addressing physics equations and labs are really hitting me hard; it's tough.. Duration: 00:45:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER001	\N	Physics equations and labs are really hitting me hard; it's tough.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	3.8	\N	\N	\N	f
703	2025-04-02 14:33:12.83686	00:45:00	["S2024008"]	Individual consultation session addressing deadline pressure and time constraints causing stress. Duration: 00:45:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER003	\N	Deadline pressure and time constraints causing stress	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.8	\N	\N	\N	f
704	2025-07-17 14:33:12.83686	01:00:00	["S2024007"]	Individual consultation session addressing public speaking and testing situations trigger severe anxiety.. Duration: 01:00:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER003	\N	Public speaking and testing situations trigger severe anxiety.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4	\N	\N	\N	f
705	2025-05-21 14:33:12.83686	01:00:00	["S2024007"]	Individual consultation session addressing student-reported mental health concerns impacting academic performance. Counseling and support were provided to address personal issues. The student expressed improved understanding and confidence. Duration: 01:00:00.	TEACHER002	\N	Mental health concerns are affecting my everyday academic performance.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	4.3	\N	\N	\N	f
706	2025-03-17 14:33:12.83686	00:30:00	["S2024004"]	Individual consultation session addressing currently facing lost sense of purpose and direction in studies. Duration: 00:30:00. Provided counseling and support for personal issues issues Student expressed improved understanding and confidence	TEACHER001	\N	Currently facing lost sense of purpose and direction in studies	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
707	2025-06-20 14:33:12.83686	00:45:00	["S2024008"]	Individual consultation session addressing academic probation stemming from failing grades. Provided counseling and support to address underlying personal issues impacting academic performance. The student expressed improved understanding and confidence in addressing these challenges during the 45-minute session. Duration: 00:45:00.	TEACHER003	\N	This probation thing? Yeah, it's because I'm failing classes.	Provided counseling and support for personal issues issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.7	\N	\N	\N	f
708	2025-05-03 14:33:12.83686	00:30:00	["S2024005"]	Individual consultation session addressing need help understanding the policies and requirements for my degree.. Duration: 00:30:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER001	\N	Need help understanding the policies and requirements for my degree.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.6	\N	\N	\N	f
709	2025-04-27 14:33:12.83686	00:30:00	["S2024008"]	Individual consultation session addressing student-reported academic stress. Counseling and support were provided to address underlying learning difficulties. The student expressed improved understanding and confidence in managing academic challenges. Duration: 00:30:00.	TEACHER002	\N	Academic life right now is a major source of stress for me.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.4	\N	\N	\N	f
710	2025-08-06 14:33:12.83686	00:30:00	["S2024001"]	Individual consultation session addressing student feelings of overwhelm and need for study schedule organization. Counseling and support were provided to address learning difficulties. The student expressed improved understanding of strategies and increased confidence in approaching their academic workload. Duration: 00:30:00.	TEACHER003	\N	Feeling overwhelmed; I need help organizing my study schedule.	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.7	\N	\N	\N	f
711	2025-04-16 14:33:12.83686	00:45:00	["S2024002"]	Individual consultation session addressing experiencing academic performance declining compared to previous semester. Duration: 00:45:00. Provided counseling and support for learning difficulties issues Student expressed improved understanding and confidence	TEACHER003	\N	Experiencing academic performance declining compared to previous semester	Provided counseling and support for learning difficulties issues	Student expressed improved understanding and confidence	\N	Faculty Office	\N	4.3	\N	\N	\N	f
712	2025-03-14 14:33:12.83686	01:00:00	["S2024005"]	Individual consultation focusing on student anxiety related to overwhelming workload. Counseling and support were provided to address general inquiries and concerns. The student expressed improved understanding and confidence in managing their academic responsibilities. Duration: 01:00:00.	TEACHER003	\N	So much to do, and I'm just completely freaked out about it all.	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Library Conference Room	\N	3.9	\N	\N	\N	f
713	2025-04-23 14:33:12.83686	00:30:00	["S2024008"]	Individual consultation addressing the student's unclear understanding of research methodology and thesis writing requirements. Counseling and support were provided to address general inquiry issues. The student reported improved comprehension and demonstrated increased confidence. Duration: 00:30:00.	TEACHER002	\N	I'm dealing with research methodology and thesis writing requirements unclear	Provided counseling and support for general inquiries issues	Student expressed improved understanding and confidence	\N	Online Meeting	\N	4.2	\N	\N	\N	f
714	2025-02-25 14:33:12.83686	01:00:00	["S2024002"]	Individual consultation session addressing experiencing poor grades in multiple subjects affecting overall gpa. Duration: 01:00:00. Provided counseling and support for social integration issues Student expressed improved understanding and confidence	TEACHER001	\N	Experiencing poor grades in multiple subjects affecting overall gpa	Provided counseling and support for social integration issues	Student expressed improved understanding and confidence	\N	Guidance Center	\N	3.5	\N	\N	\N	f
715	2025-08-17 18:29:11.442	00:01:39	["22-3191-534"]	Individual consultation session addressing concerns related to "Test." Intervention involved the application of "Test" strategies. The outcome demonstrated "Test" achievement. Duration: 00:01:39.	22-3191-535		Test	Test	Test	Test	303		0	{}	[]	a0f5564e-c75d-4c0b-a82e-9f13d191ea40	t
716	2025-06-26 08:00:00	02:00:00	["14", "11"]	Group consultation session addressing student self-confidence issues that were affecting classroom participation. The intervention focused on identifying intrinsic motivators and personal learning styles to promote engagement. As a result, the student mastered key concepts and demonstrated readiness for advanced topics. Duration: 02:00:00.	22-3191-535	Consultation session transcript - Motivation discussion with detailed explanations and student questions addressed comprehensively.	Self-confidence issues affecting classroom participation	Identified intrinsic motivators and personal learning styles	Student mastered key concepts and ready for advanced topics	\N	Academic Support Center	\N	4.6	\N	\N	\N	f
717	2025-08-10 16:30:00	02:00:00	["11", "14"]	Group consultation session centered on student concerns regarding academic workload and course difficulty. Academic resources and study materials were provided to facilitate improvement. As a result, the student developed effective strategies for ongoing academic enhancement. Duration: 02:00:00.	22-3191-535	Consultation session transcript - Academic Performance discussion with detailed explanations and student questions addressed comprehensively.	Challenges with academic workload and course difficulty	Provided academic resources and study materials for improvement	Student developed effective strategies for ongoing improvement	\N	Faculty Office Room 201	\N	4.8	\N	\N	\N	f
718	2025-06-29 17:00:00	01:15:00	["7", "13"]	Group consultation focused on student-reported feelings of overwhelm related to coursework and personal responsibilities. The session incorporated stress management techniques and coping strategies. The student demonstrated excellent progress and engagement with the material. Duration: 01:15:00.	22-3191-535	Consultation session transcript - Mental Health discussion with detailed explanations and student questions addressed comprehensively.	Feeling overwhelmed with coursework and personal responsibilities	Discussed stress management techniques and coping strategies	Student showed excellent progress and engagement with material	\N	Library Private Study Room	\N	4.6	\N	\N	\N	f
719	2025-06-25 11:15:00	02:00:00	["11"]	Individual consultation session focused on student difficulty with prioritizing multiple assignments and project deadlines. Time-blocking techniques and productivity methods were introduced to aid in organization and time management. Continued support is recommended, indicating a need for additional follow-up sessions to reinforce learned strategies. Duration: 02:00:00.	22-3191-535	Consultation session transcript - Time Management discussion with detailed explanations and student questions addressed comprehensively.	Difficulty prioritizing multiple assignments and project deadlines	Taught time-blocking techniques and productivity methods	Student needs additional follow-up sessions for continued support	\N	Faculty Office Room 201	\N	4.2	\N	\N	\N	f
720	2025-06-02 11:45:00	00:45:00	["12", "13"]	Group consultation session addressing student concerns regarding maintaining the required GPA for scholarship eligibility. An action plan with milestone tracking was collaboratively created to facilitate GPA improvement. The student successfully mastered key concepts and demonstrated readiness for advanced topics. Duration: 00:45:00.	22-3191-535	Consultation session transcript - Academic Performance discussion with detailed explanations and student questions addressed comprehensively.	Student struggling with maintaining required GPA for scholarship	Created action plan for GPA improvement with milestone tracking	Student mastered key concepts and ready for advanced topics	\N	Academic Support Center	\N	3.7	\N	\N	\N	f
721	2025-07-14 11:15:00	02:00:00	["11"]	Individual consultation focused on the student's concern regarding time allocation between study and other activities. Time-blocking techniques and productivity methods were taught to facilitate effective time management. The student demonstrated mastery of key concepts and readiness for advanced topics. Duration: 02:00:00.	22-3191-535	Consultation session transcript - Time Management discussion with detailed explanations and student questions addressed comprehensively.	Poor time allocation between study sessions and other activities	Taught time-blocking techniques and productivity methods	Student mastered key concepts and ready for advanced topics	\N	Department Conference Room	\N	4.2	\N	\N	\N	f
722	2025-07-08 13:30:00	01:15:00	["12"]	Individual consultation session addressing i'm dealing with difficulty prioritizing multiple assignments and project deadlines. Duration: 01:15:00. Developed accountability system for deadline management Student demonstrated improved understanding and confidence	22-3191-535	Consultation session transcript - Time Management discussion with detailed explanations and student questions addressed comprehensively.	I'm dealing with difficulty prioritizing multiple assignments and project deadlines	Developed accountability system for deadline management	Student demonstrated improved understanding and confidence	\N	Department Conference Room	\N	3.9	\N	\N	\N	f
723	2025-07-27 15:00:00	01:30:00	["11", "9", "8"]	Group consultation session addressing ugh, i'm terrible at balancing studying with, like, everything else.. Duration: 01:30:00. Developed accountability system for deadline management Student needs additional follow-up sessions for continued support	22-3191-535	Consultation session transcript - Time Management discussion with detailed explanations and student questions addressed comprehensively.	Ugh, I'm terrible at balancing studying with, like, everything else.	Developed accountability system for deadline management	Student needs additional follow-up sessions for continued support	\N	Department Conference Room	\N	4.2	\N	\N	\N	f
724	2025-08-12 11:30:00	01:30:00	["6", "11", "8"]	Group consultation addressing student concerns regarding focus and concentration challenges during studies. Short-term, achievable goals were established to rebuild academic confidence. Continued support is recommended, and additional follow-up sessions are scheduled to facilitate sustained progress. Duration: 01:30:00.	22-3191-535	Consultation session transcript - Motivation discussion with detailed explanations and student questions addressed comprehensively.	Difficulty maintaining focus and concentration during studies	Set short-term achievable goals to rebuild academic confidence	Student needs additional follow-up sessions for continued support	\N	Faculty Office Room 201	\N	4.8	\N	\N	\N	f
725	2025-07-31 12:30:00	01:30:00	["13", "12"]	Group consultation session addressing this semester's work is just crushing me; is anyone else struggling?. Duration: 01:30:00. Provided academic resources and study materials for improvement Student demonstrated improved understanding and confidence	22-3191-535	Consultation session transcript - Academic Performance discussion with detailed explanations and student questions addressed comprehensively.	This semester's work is just crushing me; is anyone else struggling?	Provided academic resources and study materials for improvement	Student demonstrated improved understanding and confidence	\N	Library Private Study Room	\N	4.5	\N	\N	\N	f
726	2025-07-14 12:15:00	00:30:00	["8", "7"]	Group consultation session addressing student difficulty with advanced programming concepts and algorithms. Additional practice materials and supplementary resources were provided to support comprehension. The student demonstrated mastery of key concepts, indicating readiness for advanced topics. Duration: 00:30:00.	22-3191-535	Consultation session transcript - Subject-Specific discussion with detailed explanations and student questions addressed comprehensively.	Difficulty understanding advanced programming concepts and algorithms	Provided additional practice materials and supplementary resources	Student mastered key concepts and ready for advanced topics	\N	Academic Support Center	\N	4.7	\N	\N	\N	f
727	2025-05-24 10:15:00	01:15:00	["8", "10", "7"]	Group consultation addressed concerns regarding academic probation and the need for GPA improvement. An individualized action plan with milestone tracking was collaboratively developed. The student demonstrated excellent progress and engagement with the material presented. Duration: 01:15:00.	22-3191-535	Consultation session transcript - Academic Performance discussion with detailed explanations and student questions addressed comprehensively.	Academic probation concerns and improvement planning	Created action plan for GPA improvement with milestone tracking	Student showed excellent progress and engagement with material	\N	Academic Support Center	\N	4	\N	\N	\N	f
728	2025-06-24 09:45:00	02:00:00	["13", "10", "6"]	Group consultation session centered on skill development planning for the competitive job market. The session involved a comprehensive review of career options and industry requirements through detailed analysis. Students successfully mastered key concepts and are now prepared to engage with more advanced topics. Duration: 02:00:00.	22-3191-535	Consultation session transcript - Career Guidance discussion with detailed explanations and student questions addressed comprehensively.	Skill development planning for competitive job market	Reviewed career options and industry requirements analysis	Student mastered key concepts and ready for advanced topics	\N	Department Conference Room	\N	3.8	\N	\N	\N	f
729	2025-06-01 16:45:00	01:15:00	["6", "10"]	Group consultation session addressing need for better organizational skills and scheduling techniques. Duration: 01:15:00. Created detailed schedule template with priority-based task organization Student demonstrated improved understanding and confidence	22-3191-535	Consultation session transcript - Time Management discussion with detailed explanations and student questions addressed comprehensively.	Need for better organizational skills and scheduling techniques	Created detailed schedule template with priority-based task organization	Student demonstrated improved understanding and confidence	\N	Online Video Conference	\N	4.3	\N	\N	\N	f
730	2025-07-12 11:00:00	02:00:00	["6"]	Individual consultation session addressing high levels of academic stress affecting daily performance. Duration: 02:00:00. Developed wellness plan incorporating self-care practices Student developed effective strategies for ongoing improvement	22-3191-535	Consultation session transcript - Mental Health discussion with detailed explanations and student questions addressed comprehensively.	High levels of academic stress affecting daily performance	Developed wellness plan incorporating self-care practices	Student developed effective strategies for ongoing improvement	\N	Library Private Study Room	\N	4	\N	\N	\N	f
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
4	CASS
5	Mathematics
6	Engineering
7	Physics
8	Computer Science
9	Chemistry
10	Biology
11	Business
12	Education
13	Literature
14	Psychology
\.


--
-- Data for Name: faculty; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculty (id, user_id, is_active) FROM stdin;
4	5	t
1	2	t
3	4	t
5	15	t
2	3	t
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
45	4	15	14	88	Midterm	2024-2025	1st	PASSED	2025-06-09 13:51:37.175353	\N
46	4	15	14	94	Pre-Final	2024-2025	1st	PASSED	2025-06-09 13:52:05.066615	\N
47	4	15	14	95	Final	2024-2025	1st	PASSED	2025-06-09 13:52:36.812086	\N
49	4	15	8	86	Midterm	2024-2025	1st	PASSED	2025-06-09 13:57:42.612107	\N
50	4	15	8	90	Pre-Final	2024-2025	1st	PASSED	2025-06-09 13:58:16.584454	\N
51	4	15	8	95	Final	2024-2025	1st	PASSED	2025-06-09 13:58:43.486175	\N
48	4	15	8	69	Prelim	2024-2025	1st	FAILED	2025-06-09 13:57:10.228857	2025-06-09 14:31:09.002145
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
9	2025-07-09	2025-08-02	2025-2026	1st
11	2025-08-17	\N	2025-2026	2nd
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, user_id, program_id, sex, year_section, is_enrolled, enrolled_by) FROM stdin;
1	6	1	Female	BSIT-1A	f	F2024001
2	7	2	Male	BSCS-1A	f	F2024001
4	9	5	Female	BSED-3A	f	F2024001
5	10	1	Male	BSIT-1B	f	F2024001
6	11	2	Female	BSCS-2A	f	F2024001
7	12	4	Male	BSMA-1A	f	F2024001
8	13	5	Female	BSED-4A	f	F2024001
9	14	3	Male	3A	t	22-3191-535
3	8	3	Male	BSA-2B	t	22-3191-535
\.


--
-- Data for Name: teacher_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_schedules (id, teacher_id, day_of_week, start_time, end_time, venue, is_available, semester_id, created_at, updated_at) FROM stdin;
1	22-3191-535	0	13:00:00	14:00:00	B303	t	11	2025-09-10 02:48:51.379017	\N
2	22-3191-535	1	10:00:00	13:50:00	B204	t	11	2025-09-10 02:50:29.245029	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, id_number, first_name, last_name, full_name, email, password, department_id, role, archived, profile_picture, is_verified) FROM stdin;
1	admin001	Admin	User	Admin User	admin@wnu.sti.edu.ph	$2b$12$OXy/GEwI.q04avGVYNRD8OdaoO2H9q/a82JkogFMrDPzkbgZel0aK	1	admin	f	\N	t
6	S2024001	Alice	Johnson	Alice Johnson	alice.S2024001@wnu.sti.edu.ph	$2b$12$zdo9e.naxxLCmSkg3ekzD./D48SruHzuWKma8mPSNwfzI2qFG5jhG	1	student	f	\N	t
7	S2024002	Bob	Williams	Bob Williams	bob.S2024002@wnu.sti.edu.ph	$2b$12$CvwoihoBIoyeP3glX0MwN.j1I5JR4QqaHVdoFe34/ACDSLAe..J/y	1	student	f	\N	t
8	S2024003	Charlie	Davis	Charlie Davis	charlie.S2024003@wnu.sti.edu.ph	$2b$12$MHvqswJOKdnsAgBdnzeQEejm/zAYzmB3dSQGlWCsDveN6KuGTt7X6	2	student	f	\N	t
9	S2024004	Diana	Miller	Diana Miller	diana.S2024004@wnu.sti.edu.ph	$2b$12$qbaaVCPFxmkaDutcZ4yhdOLyleYYT4Q71SB9qJ7UkRLX25TXgv2j.	3	student	f	\N	t
10	S2024005	Edward	Wilson	Edward Wilson	edward.S2024005@wnu.sti.edu.ph	$2b$12$Ve4WYxSdZXnUjTw5UGPIfOWOe5USpgkBbkW4.0QqbTj8dGbwfydja	1	student	f	\N	t
11	S2024006	Fiona	Garcia	Fiona Garcia	fiona.S2024006@wnu.sti.edu.ph	$2b$12$NjLyAzBFgt1Agj/rDMUmsuoXFJt8SARsoUnRVvO7o5xUR/Nu9n8m2	1	student	f	\N	t
12	S2024007	George	Rodriguez	George Rodriguez	george.S2024007@wnu.sti.edu.ph	$2b$12$sqckg491Ih.0qGOvvQxAUeh4v/81l13wgv1Yoc5tOy2zQaYt2CN.2	2	student	f	\N	t
13	S2024008	Hannah	Martinez	Hannah Martinez	hannah.S2024008@wnu.sti.edu.ph	$2b$12$0uRGowpLr6ULi.NJiS2n9uWj.6wUu3ZP6kPbuawBLf7Oapw0UnOEm	3	student	f	\N	t
14	22-3191-534	David Paul	Desuyo	David Paul Desuyo	desuyo.191534@wnu.sti.edu.ph	$2b$12$pY8c/v99mzhfdBgO1EXg0Oe/pEhiZh17MsocnnQQcj3LBJ.OoiVGi	2	student	f	\N	t
36	TEACHER001	Orvilla	Balangue	Orvilla Balangue	teacher001@polycon.edu	scrypt:32768:8:1$MISGH51i4XI2eKXz$dbc1be21b5f84e678b23985271eff52bc2065d042b8176c3c5ac62ccdc027505b710d2d12cf55dedbf45f79a9c476ea02671cb5e2bcccc973b2263cc07a94d59	1	faculty	f	\N	t
37	TEACHER002	Danica	Duazo	Danica Duazo	teacher002@polycon.edu	scrypt:32768:8:1$0ykYQ41t1jMrIrmX$a32d76232043c4874dd04f464a93cf61a87a8840e9fddfe7cdb3c6853a0b0f08a9345dcff15b3885d9770c0043290157b5f2d02a64982a3a0c37e00c0f14c1aa	1	faculty	f	\N	t
2	F2024001	John	Doe	John Doe	john.doe@wnu.sti.edu.ph	$2b$12$drxHXvt30ArW2uarfnhmbu8aWsSpOvJef1NiqSReSeS5xlG4tp0Ym	1	faculty	f	\N	t
3	F2024002	Jane	Smith	Jane Smith	jane.smith@wnu.sti.edu.ph	$2b$12$DR77HrpK2wuJtOWo6hVp9ujfYhwHq89w3CpNtGRgIuUgjKtJZlpF6	2	faculty	f	\N	t
4	F2024003	Robert	Brown	Robert Brown	robert.brown@wnu.sti.edu.ph	$2b$12$/xaFSWnIaTJqRD4D5QxQce6Dr5RqiBfWVRhRNnF.fskv01eyMNx/S	3	faculty	f	\N	t
5	F2024004	Emily	White	Emily White	emily.white@wnu.sti.edu.ph	$2b$12$UFXyYa3H/3bun3gpLjuwOefPF/cfxBAWCHs4qhGPuP3509ig.2rHu	1	faculty	f	\N	t
15	22-3191-535	Lynol	Ibarra	Lynol Ibarra	desuyo.191535@wnu.sti.edu.ph	$2b$12$oNreF1f0SDa6R.ADEPnPjOhff1OYiEEjEoKWHMYvkcppuU/6YX6DC	2	faculty	f	a3cbca33-bd75-4f83-a3f7-ac469bbc65f3.png	t
25	T006	Dr.	Maria Santos	Dr. Maria Santos	t006@polycon.edu	hashed_password_here	5	faculty	f	\N	f
26	T007	Prof.	James Wilson	Prof. James Wilson	t007@polycon.edu	hashed_password_here	6	faculty	f	\N	f
27	T008	Dr.	Sarah Lee	Dr. Sarah Lee	t008@polycon.edu	hashed_password_here	7	faculty	f	\N	f
28	T009	Prof.	Michael Chen	Prof. Michael Chen	t009@polycon.edu	hashed_password_here	8	faculty	f	\N	f
29	T010	Dr.	Rachel Adams	Dr. Rachel Adams	t010@polycon.edu	hashed_password_here	9	faculty	f	\N	f
30	T011	Prof.	David Brown	Prof. David Brown	t011@polycon.edu	hashed_password_here	10	faculty	f	\N	f
31	T012	Dr.	Lisa Wang	Dr. Lisa Wang	t012@polycon.edu	hashed_password_here	11	faculty	f	\N	f
32	T013	Prof.	Robert Taylor	Prof. Robert Taylor	t013@polycon.edu	hashed_password_here	12	faculty	f	\N	f
33	T014	Dr.	Jennifer Davis	Dr. Jennifer Davis	t014@polycon.edu	hashed_password_here	13	faculty	f	\N	f
34	T015	Prof.	Kevin Miller	Prof. Kevin Miller	t015@polycon.edu	hashed_password_here	14	faculty	f	\N	f
38	TEACHER003	Ariel	Sumagaysay	Ariel Sumagaysay	teacher003@polycon.edu	scrypt:32768:8:1$Q2jxPmPaGF0VWbGn$924c64dab4a5281e670f77764cc2500be728b3588bbb17c3273c1cecfd428b1d21198e8cd0644a66ca4f7e9f5317ca846746b71d5560396b0a8dc6839d729ca8	1	faculty	f	\N	t
\.


--
-- Name: concern_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.concern_categories_id_seq', 225, true);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.courses_id_seq', 5, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 14, true);


--
-- Name: faculty_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faculty_id_seq', 6, true);


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_id_seq', 51, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 15, true);


--
-- Name: semesters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.semesters_id_seq', 11, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.students_id_seq', 16, true);


--
-- Name: teacher_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teacher_schedules_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 38, true);


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
-- Name: concern_categories concern_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.concern_categories
    ADD CONSTRAINT concern_categories_pkey PRIMARY KEY (id);


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
-- Name: teacher_schedules teacher_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_schedules
    ADD CONSTRAINT teacher_schedules_pkey PRIMARY KEY (id);


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
-- Name: ix_concern_categories_normalized_concern; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_concern_categories_normalized_concern ON public.concern_categories USING btree (normalized_concern);


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
-- Name: teacher_schedules teacher_schedules_semester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_schedules
    ADD CONSTRAINT teacher_schedules_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id);


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- PostgreSQL database dump complete
--

