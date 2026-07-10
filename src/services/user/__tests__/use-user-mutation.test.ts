import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import {
  useCreateUserProfile,
  useUpdateUserProfile,
} from "../use-user-mutation";

describe("useUpdateUserProfile", () => {
  it("patches the profile and caches the result under the user's profile key", async () => {
    let receivedBody: Record<string, unknown> = {};
    server.use(
      http.patch(`${API_URL}/auth/profile`, async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          data: { id: "user-1", first_name: "Jane" },
        });
      }),
    );

    const { result, queryClient } = renderHookWithQueryClient(() =>
      useUpdateUserProfile(),
    );
    result.current.mutate({
      userId: "user-1",
      updates: { first_name: "Jane" },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(receivedBody).toMatchObject({ firstName: "Jane" });
    // authQueryKeys.userProfile() aliases ["auth","me"] after the /auth/me dedup refactor
    expect(queryClient.getQueryData(["auth", "me"])).toEqual({
      id: "user-1",
      first_name: "Jane",
    });
  });
});

describe("useCreateUserProfile", () => {
  it("creates a profile via PATCH /auth/profile", async () => {
    server.use(
      http.patch(`${API_URL}/auth/profile`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "user-1", first_name: "Jane" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useCreateUserProfile());
    result.current.mutate({
      userId: "user-1",
      profileData: { first_name: "Jane" },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: "user-1", first_name: "Jane" });
  });
});
