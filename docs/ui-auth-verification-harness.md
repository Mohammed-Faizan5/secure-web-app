# UI Authentication Verification Harness

Use the preview URL with an authenticated session supplied by the Manus preview runtime. The harness is a short route-and-state checklist that can be repeated without modifying application data.

| Check | Action | Expected result |
|---|---|---|
| Unauthenticated gate | Open `/`, `/notes`, or `/admin` with no session cookie or preview bearer token | The page shows **Sign in to continue** and does not render protected content. |
| Authenticated notes access | Open `/notes` with a valid session | The Sentinel Desk shell renders **My notes**, and the page can list, create, edit, and delete only the current user's notes. |
| Admin visibility | Open `/admin` with an admin session | The sidebar shows **Admin console**, and the page can load user and audit panels. |
| Role boundary | Open `/admin` with a regular-user session | The admin procedure returns `FORBIDDEN`; the UI must not expose admin data. |
| Logout transition | Choose the profile menu and select **Sign out** | The session cookie is cleared, `auth.me` becomes `null`, and the protected layout returns to the sign-in gate. |

The final preview evidence showed the authenticated admin shell and successful Notes/Admin data requests, followed by a request without authorization where `auth.me` returned `null`. The dedicated OAuth portal returned a CloudFront 403 during a fresh browser sign-in, so the runtime-provided authenticated preview session and automated backend authorization tests are the available verification path until the external portal is available again.
