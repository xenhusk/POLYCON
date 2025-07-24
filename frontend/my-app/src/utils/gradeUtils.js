import API_URL from '../apiConfig';

// Utility function for fetching initial grade data
export const fetchInitialGradeData = async (setters) => {
  const {
    setIsLoading,
    setSchoolYear,
    setSemester,
    setSchoolYearFilter,
    setSemesterFilter,
    setStudents,
    setGrades,
    setFilteredGrades,
    setCourses,
    setUniqueSchoolYears,
    setMessage
  } = setters;

  setIsLoading(true);
  try {
    // Check if teacherID is available
    const teacherID = localStorage.getItem("teacherID");
    if (!teacherID) {
      console.error("teacherID not found in localStorage");
      setMessage({ type: "error", content: "Teacher ID not found. Please try logging in again." });
      return;
    }

    // First get the latest semester info
    const latestSemesterResponse = await fetch(
      `${API_URL}/semester/get_latest_filter`
    );
    const latestSemesterData = await latestSemesterResponse.json();

    // Set both form and filter values
    setSchoolYear(latestSemesterData.school_year);
    setSemester(latestSemesterData.semester);
    setSchoolYearFilter(latestSemesterData.school_year);
    setSemesterFilter(latestSemesterData.semester);

    const cachedStudents = localStorage.getItem("students");
    const cachedCourses = localStorage.getItem("courses");

    // Fetch ALL grades for this teacher without semester filter
    const gradesUrl = new URL(`${API_URL}/grade/get_grades`);
    gradesUrl.searchParams.append("facultyID", teacherID);

    let gradesData; // Declare gradesData here

    if (cachedStudents && cachedCourses) {
      setStudents(JSON.parse(cachedStudents));
      setCourses(JSON.parse(cachedCourses));

      // Fetch all grades
      const gradesResponse = await fetch(gradesUrl);
      gradesData = await gradesResponse.json(); // Assign to gradesData

      // Store all grades
      setGrades(Array.isArray(gradesData) ? gradesData : []);

      // Filter to show only latest semester grades initially
      const filteredGradesData = (
        Array.isArray(gradesData) ? gradesData : []
      ).filter(
        (grade) =>
          grade.school_year === latestSemesterData.school_year &&
          grade.semester === latestSemesterData.semester
      );

      setFilteredGrades(filteredGradesData);
    } else {
      const [studentsResponse, gradesResponse, coursesResponse] =
        await Promise.all([
          fetch(`${API_URL}/grade/get_students`),
          fetch(gradesUrl),
          fetch(`${API_URL}/course/get_courses?facultyID=${teacherID}`),
        ]);

      const studentsData = await studentsResponse.json();
      gradesData = await gradesResponse.json(); // Assign to gradesData
      const coursesData = await coursesResponse.json();

      setStudents(Array.isArray(studentsData) ? studentsData : []);

      // Store all grades
      setGrades(Array.isArray(gradesData) ? gradesData : []);

      // Filter to show only latest semester grades initially
      const filteredGradesData = (
        Array.isArray(gradesData) ? gradesData : []
      ).filter(
        (grade) =>
          grade.school_year === latestSemesterData.school_year &&
          grade.semester === latestSemesterData.semester
      );

      setFilteredGrades(filteredGradesData);
      setCourses(
        Array.isArray(coursesData.courses) ? coursesData.courses : []
      );

      // Update cache
      localStorage.setItem("students", JSON.stringify(studentsData));
      localStorage.setItem("grades", JSON.stringify(gradesData)); // Cache all grades
      localStorage.setItem("courses", JSON.stringify(coursesData.courses));
    }

    // Move this after we have gradesData
    const uniqueYears = [
      ...new Set(
        (Array.isArray(gradesData) ? gradesData : []).map(
          (grade) => grade.school_year
        )
      ),
    ];
    setUniqueSchoolYears(uniqueYears);
  } catch (error) {
    console.error("Error fetching initial data:", error);
    setMessage({ type: "error", content: "Error loading grades" });
  } finally {
    setIsLoading(false);
  }
};
