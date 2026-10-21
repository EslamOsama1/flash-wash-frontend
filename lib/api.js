const BASE_URL = 'http://localhost:4000/api/v1';

async function fetchWrapper(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  try {
    console.log('API REQUEST:', url);
    console.log('METHOD:', method);

    const headers = {
      ...(options.headers || {}),
    };

    let token = null;

    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminToken');
      const workerToken = localStorage.getItem('workerToken');
      const operationalManagerToken = localStorage.getItem(
        'operationalManagerToken'
      );

      // Normalize endpoint for consistent matching
      const path = endpoint.split('?')[0].replace(/\/+$/, '') || '/';

      // =========================================
      // 1. Public endpoints
      // =========================================

      // Customers can check business hours without login.
      // Business settings modifications require Admin authentication.
      if (path === '/business-settings') {
        token = method === 'GET' ? null : adminToken;

        // =========================================
        // 2. Worker endpoints
        // =========================================

      } else if (
        path === '/worker' ||
        path.startsWith('/worker/')
      ) {
        token = workerToken;

        // =========================================
        // 3. Admin endpoints
        // =========================================

      } else if (
        path === '/admin' ||
        path.startsWith('/admin/') ||
        path === '/workers' ||
        path.startsWith('/workers/') ||
        path === '/payment-settings' ||
        path.startsWith('/payment-settings/')
      ) {
        token = adminToken;

        // =========================================
        // 4. Attendance endpoints
        // =========================================

      } else if (
        path === '/attendance/admin' ||
        path.startsWith('/attendance/admin/')
      ) {
        token = adminToken;

      } else if (path === '/attendance') {
        // GET attendance listing can be used by Admin.
        // Other attendance operations belong to the Worker.
        token = method === 'GET' ? adminToken : workerToken;

      } else if (path.startsWith('/attendance/')) {
        token = workerToken;

        // =========================================
        // 5. Operational Manager endpoints
        // =========================================

      } else if (
        path === '/operations/dashboard'
      ) {
        // The Admin dashboard currently calls this endpoint.
        token = adminToken;

      } else if (
        path === '/operations' ||
        path.startsWith('/operations/')
      ) {
        token = operationalManagerToken;

        // =========================================
        // 6. Order endpoints
        // =========================================

      } else if (
        path === '/Orders' ||
        path.startsWith('/Orders/')
      ) {
        // Choose a token based on the specific order operation.
        //
        // Order history is restricted to Admin and
        // Operational Manager in the current backend routes.
        if (path === '/Orders/history') {
          token = adminToken || operationalManagerToken;

          // Waiting orders and work operations require a Worker
          // who has checked in.
        } else if (
          path === '/Orders/waiting' ||
          path === '/Orders/my-active-wash' ||
          /^\/Orders\/[^/]+\/(start|finish)$/.test(path)
        ) {
          token = workerToken;

          // Payment and order review operations are generally
          // Admin/Operational Manager operations.
        } else if (
          /\/payment\/(approve|reject)$/.test(path)
        ) {
          token = adminToken || operationalManagerToken;

        } else if (
          /\/(confirm-payment|cancel|remove)$/.test(path)
        ) {
          token = operationalManagerToken;

        } else {
          // Preserve compatibility with existing order calls.
          token =
            adminToken ||
            operationalManagerToken ||
            workerToken;
        }

        // =========================================
        // 7. Other endpoints
        // =========================================

      } else {
        // Keep existing fallback behavior for endpoints
        // whose role requirements have not been mapped yet.
        token = adminToken || workerToken;
      }
    }

    // Avoid accidentally sending a stale Authorization header
    // when the current request is public or has no matching token.
    delete headers.Authorization;

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Do not print the actual token in the console.
    console.log('AUTH TOKEN PRESENT:', Boolean(token));

    const response = await fetch(url, {
      ...options,
      method,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        data.message ||
        data.error ||
        `HTTP error! status: ${response.status}`
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;

  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  get: (endpoint) =>
    fetchWrapper(endpoint, {
      method: 'GET',
    }),

  post: (endpoint, body) => {
    const isFormData =
      typeof FormData !== 'undefined' &&
      body instanceof FormData;

    return fetchWrapper(endpoint, {
      method: 'POST',
      headers: isFormData
        ? {}
        : {
          'Content-Type': 'application/json',
        },
      body: isFormData
        ? body
        : JSON.stringify(body),
    });
  },

  patch: (endpoint, body) => {
    const isFormData =
      typeof FormData !== 'undefined' &&
      body instanceof FormData;

    return fetchWrapper(endpoint, {
      method: 'PATCH',
      headers: isFormData
        ? {}
        : {
          'Content-Type': 'application/json',
        },
      body: isFormData
        ? body
        : JSON.stringify(body),
    });
  },

  delete: (endpoint) =>
    fetchWrapper(endpoint, {
      method: 'DELETE',
    }),
};