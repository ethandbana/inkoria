

# Fix Build Errors & Connect Real Data

## Summary
There are 8 build errors to fix plus the core issue: ForestLayout uses hardcoded mock data instead of real database queries. The plan fixes all errors first, then wires up real data loading for posts, stories, follows, and messages.

## Phase 1: Fix All Build Errors

### 1. Edge function type resolution error
- Add `// @ts-ignore` or a `deno.json` with `nodeModulesDir: "auto"` in the edge function directory to suppress the openai type resolution error (same fix applied before).

### 2. GroupChat.tsx — `Property 'online' does not exist on type 'Member'`
- Add `online?: boolean` to the `Member` interface.

### 3. LiveIndicators.tsx — destructuring from empty context
- Fix `ActivityContext.tsx`: add proper TypeScript typing with `createContext<ActivityContextType>()` instead of `createContext()` with no argument.

### 4. RichTextEditor.tsx — `placeholder` on contentEditable div
- Remove the `placeholder` prop from the div. Use a CSS pseudo-element (`[contenteditable]:empty:before`) or `data-placeholder` attribute instead.

### 5. ThoughtStream.tsx — duplicate `color` property
- Remove the duplicate `color: 'white'` on line 165 (the gradient text version on line 171 is the intended one).

### 6. ActivityContext.tsx — `Expected 1 arguments, but got 0`
- Provide a default value to `createContext()` matching the context shape.

### 7. useNotifications.ts — cleanup returns Promise
- The `useEffect` cleanup `() => subscription.unsubscribe()` returns a Promise. Wrap it: `return () => { subscription.unsubscribe(); };` to avoid returning the promise directly.

### 8. ForestLayout.tsx line 188 — same useEffect cleanup issue
- Same fix as #7 for the notification subscription cleanup.

### 9. ForestLayout.tsx line 314 — story `time` type mismatch
- Update the story type union to allow `time: string` on all variants (fix the type that has `time?: undefined`).

## Phase 2: Wire Up Real Database Data

### 10. Load posts from `books` table
- Replace hardcoded `posts` array with a `useEffect` that fetches published books from Supabase, joining with `profiles` for author info, `likes` for count, and `comments`.

### 11. Load stories from `statuses` table  
- Replace hardcoded `stories` array with real query to `statuses` table (where `expires_at > now()`), joined with `profiles`.

### 12. Load follows from `follows` table
- Replace hardcoded `followedUsers` with real query using `auth.uid()` as `follower_id`.

### 13. Connect post actions to database
- `handleLike`: insert/delete from `likes` table
- `handleSave`: insert/delete from `bookmarks` table  
- `handleAddComment`: insert into `comments` table
- `handleCreatePost`: insert into `books` table with upload to storage

### 14. Connect stories to database
- `handleCreateStory`: upload media to `uploads` bucket, insert into `statuses` table
- Story viewers/likes: query from statuses data

### 15. Use real user profile
- Fix `ForestLayout` user loading to use correct column names (`display_name` instead of `full_name`, which doesn't exist).

## Technical Details

**Files to modify:**
- `src/contexts/ActivityContext.tsx` — add TypeScript types
- `src/components/LiveIndicators.tsx` — no changes needed after context fix
- `src/components/GroupChat.tsx` — add `online` to Member interface
- `src/components/RichTextEditor.tsx` — remove `placeholder` prop, use CSS
- `src/components/ThoughtStream.tsx` — remove duplicate property
- `src/hooks/useNotifications.ts` — fix cleanup function
- `src/pages/ForestLayout.tsx` — fix cleanup, fix story types, replace mock data with Supabase queries
- `supabase/functions/extract-pdf-text/index.ts` — suppress type error if needed

**No new database tables needed** — all required tables already exist (profiles, books, comments, likes, bookmarks, follows, statuses, messages, notifications).

