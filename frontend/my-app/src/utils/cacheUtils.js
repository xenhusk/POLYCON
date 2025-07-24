/**
 * Cache management utilities for ActionButton data
 */

export const CACHE_KEYS = {
  STUDENTS: 'actionButtonData_students',
  TEACHERS: 'actionButtonData_teachers',
  LAST_FETCH: 'actionButtonData_lastFetch',
  USER_ID: 'actionButtonData_userId'
};

/**
 * Get cache information and statistics
 */
export const getCacheInfo = () => {
  try {
    const students = localStorage.getItem(CACHE_KEYS.STUDENTS);
    const teachers = localStorage.getItem(CACHE_KEYS.TEACHERS);
    const lastFetch = localStorage.getItem(CACHE_KEYS.LAST_FETCH);
    const userId = localStorage.getItem(CACHE_KEYS.USER_ID);

    const studentsCount = students ? JSON.parse(students).length : 0;
    const teachersCount = teachers ? JSON.parse(teachers).length : 0;
    
    // Calculate cache size in KB
    const studentsSize = students ? (new Blob([students]).size / 1024).toFixed(2) : 0;
    const teachersSize = teachers ? (new Blob([teachers]).size / 1024).toFixed(2) : 0;
    const totalSize = parseFloat(studentsSize) + parseFloat(teachersSize);

    return {
      hasCache: !!(students || teachers),
      studentsCount,
      teachersCount,
      lastFetch: lastFetch ? new Date(parseInt(lastFetch)) : null,
      userId,
      cacheSizeKB: {
        students: studentsSize,
        teachers: teachersSize,
        total: totalSize.toFixed(2)
      }
    };
  } catch (error) {
    console.error('Error getting cache info:', error);
    return {
      hasCache: false,
      studentsCount: 0,
      teachersCount: 0,
      lastFetch: null,
      userId: null,
      cacheSizeKB: { students: 0, teachers: 0, total: 0 }
    };
  }
};

/**
 * Check if cache should be cleared based on storage limits
 */
export const shouldClearCacheForSpace = () => {
  try {
    // Check if localStorage is getting full (most browsers limit to ~5-10MB)
    const totalUsed = JSON.stringify(localStorage).length;
    const maxStorage = 5 * 1024 * 1024; // 5MB conservative estimate
    
    return totalUsed > maxStorage * 0.8; // Clear if using more than 80% of storage
  } catch (error) {
    console.error('Error checking storage space:', error);
    return false;
  }
};

/**
 * Export cache data for debugging or backup
 */
export const exportCacheData = () => {
  try {
    const cacheData = {
      students: localStorage.getItem(CACHE_KEYS.STUDENTS),
      teachers: localStorage.getItem(CACHE_KEYS.TEACHERS),
      lastFetch: localStorage.getItem(CACHE_KEYS.LAST_FETCH),
      userId: localStorage.getItem(CACHE_KEYS.USER_ID),
      exportTimestamp: Date.now()
    };
    
    return JSON.stringify(cacheData, null, 2);
  } catch (error) {
    console.error('Error exporting cache data:', error);
    return null;
  }
};

/**
 * Import cache data from backup
 */
export const importCacheData = (cacheDataString) => {
  try {
    const cacheData = JSON.parse(cacheDataString);
    
    if (cacheData.students) {
      localStorage.setItem(CACHE_KEYS.STUDENTS, cacheData.students);
    }
    if (cacheData.teachers) {
      localStorage.setItem(CACHE_KEYS.TEACHERS, cacheData.teachers);
    }
    if (cacheData.lastFetch) {
      localStorage.setItem(CACHE_KEYS.LAST_FETCH, cacheData.lastFetch);
    }
    if (cacheData.userId) {
      localStorage.setItem(CACHE_KEYS.USER_ID, cacheData.userId);
    }
    
    console.log('Cache data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing cache data:', error);
    return false;
  }
};

/**
 * Validate cache data integrity
 */
export const validateCacheData = () => {
  try {
    const studentsData = localStorage.getItem(CACHE_KEYS.STUDENTS);
    const teachersData = localStorage.getItem(CACHE_KEYS.TEACHERS);
    
    const errors = [];
    
    if (studentsData) {
      try {
        const students = JSON.parse(studentsData);
        if (!Array.isArray(students)) {
          errors.push('Students data is not an array');
        }
      } catch (e) {
        errors.push('Students data is corrupted');
      }
    }
    
    if (teachersData) {
      try {
        const teachers = JSON.parse(teachersData);
        if (!Array.isArray(teachers)) {
          errors.push('Teachers data is not an array');
        }
      } catch (e) {
        errors.push('Teachers data is corrupted');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Error validating cache data']
    };
  }
};
