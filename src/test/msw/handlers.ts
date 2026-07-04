import { http, HttpResponse } from "msw";

const API_URL = "http://localhost:5000/api";

/**
 * Base MSW request handlers for the BE REST API. These cover the common
 * "happy path" shape (`{ success, data, meta }`) so individual test files
 * can rely on sane defaults and only override what they need with
 * `server.use(...)`.
 */
export const handlers = [
  http.get(`${API_URL}/products`, () =>
    HttpResponse.json({
      success: true,
      data: [],
      meta: { pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
    })
  ),
  http.get(`${API_URL}/categories`, () =>
    HttpResponse.json({
      success: true,
      data: [],
      meta: { pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } },
    })
  ),
  http.get(`${API_URL}/brands`, () =>
    HttpResponse.json({
      success: true,
      data: [],
      meta: { pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } },
    })
  ),
];
