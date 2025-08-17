import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API_URL from '../apiConfig';
import cacheManager from '../utils/cacheManager';

const StudentConcernAnalytics = ({ teacherId, selectedSemester, selectedSchoolYear, selectedDepartment, apiEndpoint = '/hometeacher/student_concern_analytics' }) => {
  const [concernData, setConcernData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [highlightedConcern, setHighlightedConcern] = useState(null);

  // Color palette for charts
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
    '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
  ];

  const views = [
    'overview',
    'rankings', 
    'demographics',
    'insights'
  ];

  // Helper function to parse markdown bold syntax (**text**) and convert to JSX
  const parseMarkdownBold = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** markers and wrap in bold
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-bold">{boldText}</strong>;
      }
      return part;
    });
  };

  useEffect(() => {
    fetchConcernAnalytics();
  }, [selectedSemester, selectedSchoolYear, teacherId, selectedDepartment]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchConcernAnalytics = async () => {
    try {
      setLoading(true);
      
      // Try to get cached data first
      const cachedData = await cacheManager.getCachedData(
        teacherId, 
        selectedDepartment, 
        selectedSemester, 
        selectedSchoolYear, 
        API_URL
      );
      
      if (cachedData) {
        setConcernData(cachedData);
        setLoading(false);
        return;
      }
      
      // Cache miss or invalid - fetch fresh data
      console.log('Fetching fresh concern analytics data');
      const params = new URLSearchParams();
      if (teacherId) params.append('teacher_id', teacherId);
      if (selectedDepartment && selectedDepartment !== 'all') params.append('department_id', selectedDepartment);
      if (selectedSemester) params.append('semester', selectedSemester);
      if (selectedSchoolYear) params.append('school_year', selectedSchoolYear);

      const response = await fetch(`${API_URL}${apiEndpoint}?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setConcernData(data);
        
        // Cache the fresh data
        await cacheManager.setCachedData(
          teacherId, 
          selectedDepartment, 
          selectedSemester, 
          selectedSchoolYear, 
          data, 
          API_URL
        );
      } else {
        console.error('API Error:', data);
        setConcernData(null);
      }
    } catch (error) {
      console.error('Error fetching concern analytics:', error);
      setConcernData(null);
    } finally {
      setLoading(false);
    }
  };

  const nextView = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentView((prev) => (prev + 1) % views.length);
      setIsAnimating(false);
    }, 300);
  };

  const prevView = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentView((prev) => (prev - 1 + views.length) % views.length);
      setIsAnimating(false);
    }, 300);
  };

  // Function to handle pie chart click and highlight corresponding concern
  const handlePieChartClick = (data) => {
    console.log('Pie chart clicked:', data); // Debug log
    let concernName = null;
    
    // Handle pie chart data structure
    if (data && data.fullName) {
      concernName = data.fullName;
    }
    // Handle direct click event data
    else if (data && data.payload) {
      concernName = data.payload.fullName;
    }
    
    if (concernName) {
      console.log('Highlighting concern:', concernName); // Debug log
      setHighlightedConcern(concernName);
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedConcern(null);
      }, 3000);
    }
  };

  // Function to handle bar chart click with auto-scroll to Category Analysis
  const handleBarChartClick = (data) => {
    console.log('Bar chart clicked:', data); // Debug log
    let concernName = null;
    
    // Handle bar chart data structure
    if (data && data.fullConcern) {
      concernName = data.fullConcern;
    }
    // Handle direct click event data
    else if (data && data.payload) {
      concernName = data.payload.fullConcern;
    }
    
    if (concernName) {
      console.log('Highlighting concern and scrolling:', concernName); // Debug log
      setHighlightedConcern(concernName);
      
      // Scroll to Category Analysis section
      setTimeout(() => {
        const categoryAnalysisElement = document.getElementById('category-analysis-section');
        if (categoryAnalysisElement) {
          categoryAnalysisElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100); // Small delay to ensure highlighting is set
      
      // Clear highlight after 3 seconds
      setTimeout(() => {
        setHighlightedConcern(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Enhanced loading animation */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0065A8] rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[#397de2] rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          
          {/* Loading text with animation */}
          <div className="text-center space-y-3">
            <h3 className="text-xl font-semibold text-[#0065A8]">Student Concern Analytics</h3>
            <p className="text-lg font-medium text-gray-700 animate-pulse">Analyzing consultation data...</p>
            <p className="text-sm text-gray-500">Processing student concerns and generating insights</p>
          </div>
          
          {/* Animated dots */}
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-[#0065A8] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-3 h-3 bg-[#397de2] rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
            <div className="w-3 h-3 bg-[#0065A8] rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
          </div>
          
          {/* Progress-like animation */}
          <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0065A8] to-[#397de2] h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!concernData || concernData.total_concerns === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-xl font-semibold text-[#0065A8] mb-4">Student Concern Analytics</h3>
        <div className="text-gray-500 space-y-3">
          <p>No concern data available for the selected period.</p>
          
          {/* Show available semesters if provided */}
          {concernData?.available_semesters && concernData.available_semesters.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Data available in other semesters:</p>
              <div className="space-y-1">
                {concernData.available_semesters.map((sem, index) => (
                  <div key={index} className="text-sm text-blue-700">
                    {sem.semester} Semester {sem.school_year} ({sem.session_count} sessions)
                  </div>
                ))}
              </div>
              {concernData.suggested_semester && (
                <p className="text-xs text-blue-600 mt-2 italic">
                  Suggestion: Try "{concernData.suggested_semester.semester} Semester {concernData.suggested_semester.school_year}"
                </p>
              )}
            </div>
          )}
          
          {/* Show insights if any */}
          {concernData?.insights && concernData.insights.length > 0 && (
            <div className="mt-4 space-y-2">
              {concernData.insights.map((insight, index) => (
                <p key={index} className="text-sm text-gray-600 italic">
                  {parseMarkdownBold(insight)}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderOverview = () => {
    if (!concernData || !concernData.concern_rankings) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No concern data available</p>
        </div>
      );
    }

    // Always use individual concern rankings for distribution
    const allConcerns = concernData.concern_rankings;
    const topConcerns = allConcerns.slice(0, 6);
    const otherConcerns = allConcerns.slice(6);
    
    let pieData = topConcerns.map(([concern, count], index) => ({
      name: concern, // Keep full name for summary display
      fullName: concern,
      value: count,
      percentage: concernData.concern_percentages?.[concern] || 0
    }));

    // Add "Others" category if there are more concerns
    if (otherConcerns.length > 0) {
      const othersCount = otherConcerns.reduce((sum, [, count]) => sum + count, 0);
      const othersPercentage = otherConcerns.reduce((sum, [concern]) => 
        sum + (concernData.concern_percentages?.[concern] || 0), 0);
      
      pieData.push({
        name: `Others (${otherConcerns.length} more)`,
        fullName: `Others (${otherConcerns.length} more concerns)`,
        value: othersCount,
        percentage: Math.round(othersPercentage * 10) / 10
      });
    }

    return (
      <div className="space-y-6 md:space-y-8">
        <div className="text-center">
          <h4 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">Top 10 Concern Distribution</h4>
          <p className="text-sm text-gray-600">
            Total Consultations with Concerns: <span className="font-semibold">{concernData.sessions_with_concerns || 0}</span>
            <span className="text-gray-500 ml-2">• Showing Top {concernData.concern_rankings ? concernData.concern_rankings.length : 0} Most Frequent Concerns</span>
          </p>
        </div>
        
        <div className="flex flex-col xl:grid xl:grid-cols-3 gap-4 md:gap-6">
          {/* Pie Chart - Better sizing and positioning */}
          <div className="xl:col-span-2 h-96 md:h-[450px] lg:h-[500px] order-2 xl:order-1">
            <style>
              {`
                .recharts-pie-sector:focus,
                .recharts-pie-sector:focus-visible,
                .recharts-pie-sector:active {
                  outline: none !important;
                  box-shadow: none !important;
                }
                .recharts-pie-sector {
                  cursor: pointer;
                  outline: none !important;
                }
                .recharts-wrapper:focus,
                .recharts-wrapper:focus-visible {
                  outline: none !important;
                }
              `}
            </style>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage, value }) => {
                    // Show percentage for all segments, but with better positioning
                    if (percentage >= 3) {
                      return `${percentage}%`;
                    }
                    return '';
                  }}
                  outerRadius={windowWidth < 768 ? 120 : windowWidth < 1024 ? 150 : windowWidth < 1280 ? 170 : 190}
                  innerRadius={windowWidth < 768 ? 50 : windowWidth < 1024 ? 65 : windowWidth < 1280 ? 75 : 85}
                  fill="#8884d8"
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                  onClick={handlePieChartClick}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      onClick={() => handlePieChartClick(entry)}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    const payload = props.payload;
                    return [`${value} cases (${payload.percentage}%)`];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return payload[0].payload.fullName;
                    }
                    return label;
                  }}
                  contentStyle={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    fontSize: windowWidth < 768 ? '12px' : '14px',
                    maxWidth: windowWidth < 768 ? '280px' : '350px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats - Better proportions */}
          <div className="xl:col-span-1 space-y-3 order-1 xl:order-2">
            <h5 className="font-semibold text-gray-700 text-base md:text-lg">
              Top Concerns Summary
            </h5>
            <div className="space-y-3">
              {pieData.map((item, index) => (
                <div 
                  key={item.name} 
                  className={`rounded-lg p-3 transition-all duration-300 ${
                    highlightedConcern === item.fullName 
                      ? 'bg-blue-100 border-2 border-blue-300 shadow-md transform scale-105' 
                      : 'bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0 mt-1" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium text-sm leading-tight" title={item.fullName}>
                        {item.fullName}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="font-semibold text-lg">{item.value}</div>
                      <div className="text-sm text-gray-600 font-medium">{item.percentage}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chart Legend Helper */}
            <div className="mt-4 xl:hidden">
              <div className="text-xs text-gray-500 text-center p-3 bg-blue-50 rounded-lg">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hover over chart segments for detailed information
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRankings = () => {
    // Check for categorized data first, fallback to concern rankings
    const hasCategories = concernData?.nlp_categories && Object.keys(concernData.nlp_categories).length > 0;
    
    if (!concernData || (!hasCategories && !concernData.concern_rankings)) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No ranking data available</p>
        </div>
      );
    }

    let barData = [];
    let chartTitle = "Concern Categories";
    let chartSubtitle = "Categories ordered by frequency with statistical analysis";
    
    if (hasCategories) {
      // Use categorized data for rankings page
      barData = Object.entries(concernData.nlp_categories)
        .sort(([,a], [,b]) => (b.count || 0) - (a.count || 0)) // Sort by count descending
        .map(([category, data]) => ({
          concern: category,
          fullConcern: category,
          count: data.count || 0,
          percentage: data.percentage || 0,
          sampleConcerns: data.sample_concerns || []
        }));
    } else {
      // Fallback to individual concerns if categories not available
      const topConcerns = concernData.concern_rankings.slice(0, 8);
      barData = topConcerns.map(([concern, count]) => ({
        concern: concern.length > 25 ? concern.substring(0, 25) + '...' : concern,
        fullConcern: concern,
        count,
        percentage: concernData.concern_percentages?.[concern] || 0
      }));
      chartTitle = "Concern Rankings";
      chartSubtitle = "Top concerns ordered by frequency";
    }

    return (
      <div className="space-y-4 md:space-y-6">
        <div className="text-center">
          <h4 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">{chartTitle}</h4>
          <p className="text-sm text-gray-500">{chartSubtitle}</p>
        </div>

        {/* Bar Chart - Mobile Optimized with Larger Size */}
        <div className="h-80 md:h-96 lg:h-[400px] xl:h-[450px]">
          <style>
            {`
              .recharts-bar-rectangle:focus,
              .recharts-bar-rectangle:focus-visible,
              .recharts-bar-rectangle:active {
                outline: none !important;
                box-shadow: none !important;
              }
              .recharts-bar-rectangle {
                outline: none !important;
              }
              .recharts-wrapper:focus,
              .recharts-wrapper:focus-visible {
                outline: none !important;
              }
            `}
          </style>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={barData} 
              margin={{ 
                top: 30, 
                right: windowWidth < 768 ? 15 : 30, 
                left: windowWidth < 768 ? 15 : 30, 
                bottom: windowWidth < 768 ? 120 : 100 
              }}
            >
              <XAxis 
                dataKey="concern" 
                angle={windowWidth < 768 ? -60 : -45}
                textAnchor="end"
                height={windowWidth < 768 ? 140 : 100}
                fontSize={windowWidth < 768 ? 11 : 13}
                interval={0}
              />
              <YAxis fontSize={windowWidth < 768 ? 11 : 13} />
              <Tooltip 
                formatter={(value) => {
                  const result = [`${value} cases`];
                  return result;
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    const data = payload[0].payload;
                    let result = data.fullConcern;
                    
                    // Add percentage
                    if (data.percentage) {
                      result += ` (${data.percentage}%)`;
                    }
                    
                    // Add sample concerns for categorized data
                    if (data.sampleConcerns && data.sampleConcerns.length > 0) {
                      result += `\n\nExamples: ${data.sampleConcerns.slice(0, 2).join(', ')}${data.sampleConcerns.length > 2 ? '...' : ''}`;
                    }
                    
                    return result;
                  }
                  return label;
                }}
                contentStyle={{
                  fontSize: windowWidth < 768 ? '12px' : '14px',
                  minWidth: windowWidth < 768 ? '300px' : '450px',
                  maxWidth: windowWidth < 768 ? '350px' : '550px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '12px',
                  whiteSpace: 'pre-line',
                  wordWrap: 'break-word'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#0088FE"
                radius={[2, 2, 0, 0]}
                onClick={handleBarChartClick}
                style={{ cursor: 'pointer', outline: 'none' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mobile-Optimized Table */}
        <div id="category-analysis-section" className="mt-4 md:mt-6">
          <h5 className="font-semibold text-gray-700 mb-3 text-sm md:text-base">
            {hasCategories ? 'Category Analysis' : 'Most Common Concerns'}
          </h5>
          
          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-2">
            {barData.slice(0, 6).map((item, index) => (
              <div 
                key={index} 
                className={`p-3 border border-gray-200 rounded-lg shadow-sm transition-all duration-300 ${
                  highlightedConcern === item.fullConcern 
                    ? 'bg-blue-100 border-blue-300 shadow-md transform scale-105' 
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        #{index + 1}
                      </span>
                      <span className="text-xs text-gray-500">Rank</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">{item.fullConcern}</p>
                    {/* Show sample concerns for categorized data */}
                    {hasCategories && item.sampleConcerns && item.sampleConcerns.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">Examples:</span> {item.sampleConcerns.slice(0, 2).join(', ')}
                        {item.sampleConcerns.length > 2 && '...'}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <div className="text-lg font-bold text-blue-600">{item.count}</div>
                    <div className="text-xs text-gray-500">cases</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {hasCategories ? 'Category' : 'Concern'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {barData.slice(0, 10).map((item, index) => (
                  <tr 
                    key={index} 
                    className={`transition-all duration-300 ${
                      highlightedConcern === item.fullConcern 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                      <div className="font-medium" title={item.fullConcern}>{item.fullConcern}</div>
                      {/* Show sample concerns for categorized data */}
                      {hasCategories && item.sampleConcerns && item.sampleConcerns.length > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Examples:</span> {item.sampleConcerns.slice(0, 2).join(', ')}
                          {item.sampleConcerns.length > 2 && '...'}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm items-center font-semibold text-gray-900">{item.count}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDemographics = () => {
    if (!concernData || !concernData.demographic_breakdown) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No demographic data available</p>
        </div>
      );
    }

    const yearData = Object.entries(concernData.demographic_breakdown)
      .map(([year, concerns]) => {
        const total = Object.values(concerns).reduce((sum, count) => sum + count, 0);
        let displayYear;
        
        if (year === 'Unknown') {
          displayYear = 'Year Not Specified';
        } else if (year.includes('unknown') || year.includes('Unknown')) {
          displayYear = 'Year Not Specified';
        } else {
          displayYear = ` ${year}`;
        }
        
        return {
          year: displayYear,
          total,
          ...concerns
        };
      })
      .filter(item => item.total > 0) // Only show years with data
      .sort((a, b) => {
        // Sort by total, but put "Year Not Specified" at the end
        if (a.year === 'Year Not Specified') return 1;
        if (b.year === 'Year Not Specified') return -1;
        return b.total - a.total;
      });

    return (
      <div className="space-y-4 md:space-y-6">
        <div className="text-center">
          <h4 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">Demographic Breakdown</h4>
          <p className="text-sm text-gray-500">Concerns by student year level</p>
        </div>

        {/* Mobile-First Bar Chart with Larger Size */}
        <div className="h-80 md:h-96 lg:h-[400px] xl:h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={yearData} 
              margin={{ 
                top: 30, 
                right: windowWidth < 768 ? 15 : 30, 
                left: windowWidth < 768 ? 15 : 30, 
                bottom: 40 
              }}
            >
              <XAxis 
                dataKey="year" 
                fontSize={windowWidth < 768 ? 12 : 14}
              />
              <YAxis fontSize={windowWidth < 768 ? 12 : 14} />
              <Tooltip 
                contentStyle={{
                  fontSize: windowWidth < 768 ? '12px' : '14px',
                  maxWidth: windowWidth < 768 ? '220px' : '300px'
                }}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: windowWidth < 768 ? 11 : 13
                }}
              />
              <Bar dataKey="Academic Performance" stackId="a" fill="#FF8042" />
              <Bar dataKey="Subject-Specific" stackId="a" fill="#0088FE" />
              <Bar dataKey="Mental Health" stackId="a" fill="#00C49F" />
              <Bar dataKey="Time Management" stackId="a" fill="#FFBB28" />
              <Bar dataKey="Motivation" stackId="a" fill="#8884D8" />
              <Bar dataKey="Other" stackId="a" fill="#82CA9D" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mobile-Optimized Breakdown */}
        <div className="mt-4 md:mt-6">
          <h5 className="font-semibold text-gray-700 mb-3 text-sm md:text-base">Year-wise Summary</h5>
          
          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3">
            {yearData.map((yearInfo) => {
              const concerns = { ...yearInfo };
              delete concerns.year;
              delete concerns.total;
              const sortedConcerns = Object.entries(concerns).sort((a, b) => {
                if (b[1] === a[1]) return a[0].localeCompare(b[0]); // Alphabetical for ties
                return b[1] - a[1]; // Highest to lowest
              });
              const topConcern = sortedConcerns[0];
              const secondConcern = sortedConcerns[1];
              
              return (
                <div key={yearInfo.year} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="font-semibold text-gray-900">{yearInfo.year}</h6>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {yearInfo.total} total
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Primary:</span>
                        <span className="font-medium text-gray-900">{topConcern[0]}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{topConcern[1]} cases</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all" 
                            style={{ width: `${Math.round((topConcern[1] / yearInfo.total) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{Math.round((topConcern[1] / yearInfo.total) * 100)}%</span>
                      </div>
                    </div>
                    {secondConcern && secondConcern[1] > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Secondary:</span>
                        <span>{secondConcern[0]} ({secondConcern[1]})</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cases</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Concern</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {yearData.map((yearInfo) => {
                  const concerns = { ...yearInfo };
                  delete concerns.year;
                  delete concerns.total;
                  const sortedConcerns = Object.entries(concerns).sort((a, b) => {
                    if (b[1] === a[1]) return a[0].localeCompare(b[0]); // Alphabetical for ties
                    return b[1] - a[1]; // Highest to lowest
                  });
                  const topConcern = sortedConcerns[0];
                  const secondConcern = sortedConcerns[1];
                  
                  return (
                    <tr key={yearInfo.year} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{yearInfo.year}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {yearInfo.total}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{topConcern[0]}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px] max-w-[120px]">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all" 
                              style={{ width: `${Math.round((topConcern[1] / yearInfo.total) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{topConcern[1]}</span>
                          <span className="text-xs text-gray-400">({Math.round((topConcern[1] / yearInfo.total) * 100)}%)</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderInsights = () => {
    if (!concernData || !concernData.insights) {
      return (
        <div className="text-center py-8">
          <div className="flex flex-col items-center space-y-3">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No insights available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 md:space-y-8">
        <div className="text-center">
          <h4 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">Key Insights & Analysis</h4>
          <p className="text-sm text-gray-500">Statistical patterns and data-driven recommendations</p>
        </div>

        {/* Mobile-First Layout */}
        <div className="space-y-8">
          {/* Key Insights */}
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h5 className="font-semibold text-gray-700 text-base md:text-lg">Key Findings</h5>
            </div>
            <div className="grid gap-4">
              {concernData.insights.map((insight, index) => (
                <div key={index} className="relative">
                  <div className="flex">
                    <div className="flex-shrink-0 mt-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium">
                          {parseMarkdownBold(insight)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NLP-Powered Recommendations */}
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h5 className="font-semibold text-gray-700 text-base md:text-lg">
                AI-Powered Recommendations
                {concernData.analysis_method && concernData.analysis_method.includes('AI') && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    NLP Enhanced
                  </span>
                )}
              </h5>
            </div>
            
            <div className="grid gap-4">
              {concernData.recommendations && concernData.recommendations.length > 0 ? (
                concernData.recommendations.map((recommendation, index) => (
                  <div key={index} className="relative">
                    <div className="flex">
                      <div className="flex-shrink-0 mt-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm">
                          <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium">
                            {parseMarkdownBold(recommendation)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback to category-based recommendations if NLP recommendations aren't available
                <div className="space-y-4">
                  {concernData.nlp_categories && concernData.nlp_categories['Mental Health'] && 
                   concernData.nlp_categories['Mental Health'].percentage > 20 && (
                    <div className="flex">
                      <div className="flex-shrink-0 mt-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg shadow-sm">
                          <h6 className="font-semibold text-red-800 text-sm md:text-base mb-2 flex items-center">
                            High Mental Health Concerns
                            <span className="ml-2 px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">
                              {concernData.nlp_categories['Mental Health'].percentage}%
                            </span>
                          </h6>
                          <p className="text-sm md:text-base text-gray-700">
                            Consider implementing stress management workshops and counseling services.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {concernData.nlp_categories && concernData.nlp_categories['Academic Performance'] && 
                   concernData.nlp_categories['Academic Performance'].percentage > 30 && (
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg shadow-sm">
                          <h6 className="font-semibold text-yellow-800 text-sm md:text-base mb-2 flex items-center">
                            Academic Performance Issues
                            <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                              {concernData.nlp_categories['Academic Performance'].percentage}%
                            </span>
                          </h6>
                          <p className="text-sm md:text-base text-gray-700">
                            Develop targeted tutoring programs and study skills workshops.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg shadow-sm">
                        <h6 className="font-semibold text-purple-800 text-sm md:text-base mb-2">Regular Monitoring</h6>
                        <p className="text-sm md:text-base text-gray-700">
                          Track these metrics monthly to identify emerging trends and intervention needs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Definitions */}
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h5 className="font-semibold text-gray-700 text-base md:text-lg">Concern Categories</h5>
            </div>
            
            {/* Mobile: Stack cards vertically, Desktop: Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {concernData.category_definitions && Object.entries(concernData.category_definitions).map(([category, keywords]) => (
                <div key={category} className="group hover:shadow-md transition-shadow duration-200">
                  <div className="p-4 md:p-5 bg-white rounded-lg border border-gray-200 hover:border-indigo-300">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="font-semibold text-sm md:text-base text-gray-800 mb-2 leading-tight">{category}</h6>
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                          <span className="font-medium text-gray-700">Keywords:</span>{' '}
                          {Array.isArray(keywords) ? keywords.slice(0, 3).join(', ') : 'No keywords available'}
                          {Array.isArray(keywords) && keywords.length > 3 && (
                            <span className="text-gray-400"> +{keywords.length - 3} more</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile helper text */}
        <div className="mt-8 md:hidden">
          <div className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-600 text-center">
              Tip: Scroll horizontally on charts for better view on smaller screens
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (views[currentView]) {
      case 'overview': return renderOverview();
      case 'rankings': return renderRankings();
      case 'demographics': return renderDemographics();
      case 'insights': return renderInsights();
      default: return renderOverview();
    }
  };

  const viewTitles = {
    'overview': 'Overview',
    'rankings': 'Rankings',
    'demographics': 'Demographics',
    'insights': 'Insights'
  };

  return (
    <div className="bg-white p-3 md:p-6 rounded-lg shadow-lg relative overflow-hidden animate-fade-in">
      {/* Custom CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
      {/* Header with navigation - Mobile Optimized */}
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-center mb-4 md:mb-6">
        {/* Navigation buttons - Mobile Optimized */}
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={prevView}
            className="p-2 md:p-2 rounded-full bg-[#0065A8] text-white hover:bg-[#004785] transition-colors duration-200 disabled:opacity-50 touch-manipulation"
            disabled={isAnimating}
            aria-label="Previous view"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* View indicators - Mobile Optimized */}
          <div className="flex space-x-1 md:space-x-2">
            {views.map((_, index) => (
              <button
                key={index}
                onClick={() => !isAnimating && setCurrentView(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors duration-200 touch-manipulation ${
                  index === currentView ? 'bg-[#0065A8]' : 'bg-gray-300'
                }`}
                aria-label={`Go to ${viewTitles[views[index]]}`}
              />
            ))}
          </div>

          <button
            onClick={nextView}
            className="p-2 md:p-2 rounded-full bg-[#0065A8] text-white hover:bg-[#004785] transition-colors duration-200 disabled:opacity-50 touch-manipulation"
            disabled={isAnimating}
            aria-label="Next view"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content with animation - Mobile Optimized */}
      <div className={`transition-all duration-300 ${
        isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
      }`}>
        {renderCurrentView()}
      </div>

      {/* Mobile Navigation Help */}
      <div className="mt-4 md:hidden">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <span>👈</span>
            <span>Swipe</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <span>Tap dots to navigate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentConcernAnalytics;
