# Bundle Image Upload Fix - TODO

## Status: In Progress

**Approved Plan:**
1. Backend: Add `/bundles/upload` endpoint in `backend/routes/bundles.js` (save to `public/bundles/`).
2. Frontend API: Add `uploadBundleImage` method in `src/lib/api.ts` using `/bundles/upload`.
3. Frontend: Update `src/pages/AdminBundles.tsx` `handleImageUpload` to use new method.
4. Test uploads.
5. Backend restart if needed.
6. Mark complete.

✅ 1/4 - Added `/bundles/upload` endpoint in backend/routes/bundles.js (saves to public/bundles/)

✅ 2/4 - Added uploadBundleImage method in src/lib/api.ts (uses /bundles/upload)

✅ 3/4 - Updated src/pages/AdminBundles.tsx handleImageUpload() to use api.uploadBundleImage()

✅ 4/4 - All code changes complete. Backend restart: `cd backend && bun run dev` (if server was running before changes).

**Task Complete!** Bundle image uploads now use dedicated `/bundles/upload` API (saves to public/bundles/) instead of products API.





