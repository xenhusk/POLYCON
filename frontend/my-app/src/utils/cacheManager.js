/**
 * Cache Manager for Student Concern Analytics
 * Handles caching of analytics data with session count validation
 */

class CacheManager {
  constructor() {
    this.CACHE_PREFIX = 'concern_analytics_';
    this.SESSION_COUNT_KEY = 'session_count';
    this.CACHE_TIMESTAMP_KEY = 'cache_timestamp';
  }

  /**
   * Generate cache key based on parameters
   */
  generateCacheKey(teacherId, departmentId, semester, schoolYear) {
    const keyData = {
      teacherId: teacherId || 'all',
      departmentId: departmentId || 'all',
      semester: semester || 'all',
      schoolYear: schoolYear || 'all'
    };
    return this.CACHE_PREFIX + JSON.stringify(keyData);
  }

  /**
   * Get cached data if valid
   */
  async getCachedData(teacherId, departmentId, semester, schoolYear, apiUrl) {
    try {
      const cacheKey = this.generateCacheKey(teacherId, departmentId, semester, schoolYear);
      const cachedItem = localStorage.getItem(cacheKey);
      
      if (!cachedItem) {
        console.log('Cache miss: No cached data found');
        return null;
      }

      const parsedCache = JSON.parse(cachedItem);
      
      // Check if cache is still valid by comparing session counts
      const isValid = await this.isCacheValid(apiUrl, parsedCache.sessionCount);
      
      if (isValid) {
        console.log('Cache hit: Using cached data', {
          cacheKey: cacheKey.substring(0, 50) + '...',
          cachedAt: parsedCache.cachedAt,
          sessionCount: parsedCache.sessionCount
        });
        return parsedCache.data;
      } else {
        console.log('Cache invalid: Session count changed, clearing cache');
        this.clearCache(cacheKey);
        return null;
      }
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async setCachedData(teacherId, departmentId, semester, schoolYear, data, apiUrl) {
    try {
      const cacheKey = this.generateCacheKey(teacherId, departmentId, semester, schoolYear);
      
      // Get current session count
      const currentSessionCount = await this.getCurrentSessionCount(apiUrl);
      
      const cacheItem = {
        data: data,
        cachedAt: new Date().toISOString(),
        sessionCount: currentSessionCount,
        cacheKey: cacheKey.substring(this.CACHE_PREFIX.length, 50) // For debugging
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      console.log('Data cached successfully', {
        cacheKey: cacheKey.substring(0, 50) + '...',
        sessionCount: currentSessionCount
      });
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  /**
   * Check if cache is valid by comparing session counts
   */
  async isCacheValid(apiUrl, cachedSessionCount) {
    try {
      const currentSessionCount = await this.getCurrentSessionCount(apiUrl);
      return currentSessionCount === cachedSessionCount;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  /**
   * Get current session count from backend
   */
  async getCurrentSessionCount(apiUrl) {
    try {
      const response = await fetch(`${apiUrl}/hometeacher/cache_status`);
      if (response.ok) {
        const data = await response.json();
        return data.current_session_count;
      }
      return null;
    } catch (error) {
      console.error('Error fetching session count:', error);
      return null;
    }
  }

  /**
   * Clear specific cache entry
   */
  clearCache(cacheKey) {
    try {
      localStorage.removeItem(cacheKey);
      console.log('Cache cleared for key:', cacheKey.substring(0, 50) + '...');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Clear all concern analytics cache
   */
  clearAllCache() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log('All concern analytics cache cleared');
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      const stats = {
        totalCacheEntries: cacheKeys.length,
        cacheKeys: cacheKeys.map(key => ({
          key: key.substring(this.CACHE_PREFIX.length),
          size: localStorage.getItem(key).length
        })),
        totalCacheSize: cacheKeys.reduce((total, key) => {
          return total + localStorage.getItem(key).length;
        }, 0)
      };

      return stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new CacheManager();
