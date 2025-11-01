import { useState, useEffect } from 'react';
import api from '../api/client';

// Global cache for users and departments
let cachedUsers: any[] | null = null;
let cachedDepartments: any[] | null = null;
let loadingUsers = false;
let loadingDepartments = false;
let usersPromise: Promise<any> | null = null;
let departmentsPromise: Promise<any> | null = null;

// Helper to load users once and cache
export const loadUsers = async (): Promise<any[]> => {
  // Return cached data if available
  if (cachedUsers !== null) {
    return cachedUsers;
  }

  // If already loading, wait for existing promise
  if (loadingUsers && usersPromise) {
    return usersPromise;
  }

  // Start loading
  loadingUsers = true;
  usersPromise = api.get('/users?limit=100')
    .then((response) => {
      cachedUsers = response.data.data?.users || response.data.users || [];
      loadingUsers = false;
      return cachedUsers;
    })
    .catch((error) => {
      console.error('Error loading users:', error);
      loadingUsers = false;
      return [];
    });

  return usersPromise;
};

// Helper to load departments once and cache
export const loadDepartments = async (): Promise<any[]> => {
  // Return cached data if available
  if (cachedDepartments !== null) {
    return cachedDepartments;
  }

  // If already loading, wait for existing promise
  if (loadingDepartments && departmentsPromise) {
    return departmentsPromise;
  }

  // Start loading
  loadingDepartments = true;
  departmentsPromise = api.get('/departments')
    .then((response) => {
      cachedDepartments = response.data.data?.departments || response.data.departments || [];
      loadingDepartments = false;
      return cachedDepartments;
    })
    .catch((error) => {
      console.error('Error loading departments:', error);
      loadingDepartments = false;
      return [];
    });

  return departmentsPromise;
};

// Clear cache (use when data is updated)
export const clearUsersCache = () => {
  cachedUsers = null;
  usersPromise = null;
};

export const clearDepartmentsCache = () => {
  cachedDepartments = null;
  departmentsPromise = null;
};

// React hook to use users and departments
export const useUsersAndDepartments = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      // If data is already cached, use it immediately
      if (cachedUsers && cachedDepartments) {
        setUsers(cachedUsers);
        setDepartments(cachedDepartments);
        return;
      }

      setLoading(true);
      try {
        const [usersData, departmentsData] = await Promise.all([
          loadUsers(),
          loadDepartments()
        ]);

        if (isMounted) {
          setUsers(usersData);
          setDepartments(departmentsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { users, departments, loading };
};
