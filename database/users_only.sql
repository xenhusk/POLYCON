SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
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
14	22-3191-534	David Paul	Desuyo	David Paul Desuyo	desuyo.191534@wnu.sti.edu.ph	$2b$12$pY8c/v99mzhfdBgO1EXg0Oe/pEhiZh17MsocnnQQcj3LBJ.OoiVGi	2	student	f	\N	t
24	20-0062-747	Kyrell 	Santillan	Kyrell  Santillan	santillan.062747@wnu.sti.edu.ph	$2b$12$UQeFbrL20M24IY82y1xJl.j.8l7ry31Zw2kpmWMtH5rqTmpKSDfta	1	student	f	\N	t
15	22-3191-535	David Paul	Desuyo	David Paul Desuyo	desuyo.191535@wnu.sti.edu.ph	$2b$12$oNreF1f0SDa6R.ADEPnPjOhff1OYiEEjEoKWHMYvkcppuU/6YX6DC	2	faculty	f	https://res.cloudinary.com/dcaqxvejm/image/upload/v1753334701/polycon/profiles/profile_pictures/b6f5f5d2f7b94e7995610b0689f7d59d_profile.png.jpg	t
\.
