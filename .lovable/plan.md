
## Goal
Improve the Landing page and Order page mobile experience (smaller text, tighter spacing, better CTA buttons, and a sticky mobile CTA), while keeping the current desktop look and keeping **3 CTAs inside SalesCopy** as you selected.

---

## What I observed in current code (mobile pain points)
### Landing (`SalesCopy.tsx`, `FinalCTA.tsx`, `HeroVideo.tsx`)
- `SalesCopy` uses `prose prose-lg` plus many `text-lg` paragraphs, which can feel large and long on mobile.
- CTA buttons use large padding (`py-6`) and are not full-width on mobile.
- Section paddings are generous (`py-12/16/20`), making the page feel extra long on phones.
- No sticky CTA; user must scroll back to find a button.

### Order (`Order.tsx`)
- Payment instruction box is ok, but can be tightened for mobile and made clearer.
- bKash number + copy button layout is `flex-col`; on mobile it’s fine, but a more polished layout would:
  - keep number readable
  - keep “Copy bKash” easy to tap
  - avoid awkward wrapping
- Form spacing and labels can be slightly improved for thumb use.
- Success message is good; we can make next steps clearer.

---

## Implementation plan (what I will change)

### A) Landing page mobile typography + spacing (no content changes)
**Files:**
- `src/components/landing/SalesCopy.tsx`
- `src/components/landing/FinalCTA.tsx`
- (optional minor) `src/components/landing/HeroVideo.tsx`

**Changes:**
1. **Make the prose responsive**
   - Change `prose prose-lg` to something like:
     - `prose prose-base md:prose-lg`
   - Reduce paragraph font sizes on small screens by removing hardcoded `text-lg` everywhere and replacing with responsive sizes:
     - `text-base md:text-lg`
   - Keep headings readable:
     - `text-xl md:text-3xl` patterns where needed.

2. **Tighter vertical spacing on mobile**
   - Convert `py-12 md:py-16` into:
     - `py-8 md:py-16` (or similar) on sections
   - Convert big CTA margins (`my-12`, `my-8`) to responsive:
     - `my-6 md:my-8`, `my-8 md:my-12`

3. **Better CTA buttons on mobile**
   - Make SalesCopy CTAs full-width on mobile but same size on desktop:
     - `w-full sm:w-auto`
   - Reduce button height slightly on mobile:
     - `py-5 md:py-6` (or use `h-12 md:h-14` style)
   - Keep your existing shadows/hover behavior.

4. **FinalCTA button mobile optimization**
   - Similar responsive sizing:
     - `w-full sm:w-auto`
     - slightly reduced padding on mobile while preserving the “big CTA” feel.

---

### B) Add a sticky bottom CTA on mobile (Landing page)
**Files:**
- Likely create a small reusable component (or inline in `Index.tsx`)
- `src/pages/Index.tsx`
- `src/hooks/use-mobile.tsx` will be reused (already exists)

**Changes:**
1. Add a **sticky bottom bar CTA** visible only on mobile:
   - Show when `useIsMobile()` is true.
   - Button text: “ই-বুকটি অর্ডার করতে চাই”
   - On click: navigate to `/order`

2. Prevent sticky bar from covering page content:
   - Add bottom padding to the main landing wrapper (Index page) on mobile:
     - e.g. `pb-20 md:pb-0`

3. Styling:
   - Sticky container: `fixed bottom-0 left-0 right-0 z-50`
   - Background: `bg-background/90 backdrop-blur border-t`
   - Inner container: centered max width + padding
   - Button: full width

---

### C) Order page mobile polish
**File:**
- `src/pages/Order.tsx`

**Changes:**
1. **Compact payment instructions block**
   - Reduce padding slightly on mobile:
     - `p-3 md:p-4`
   - Improve line spacing:
     - `text-sm leading-relaxed`
   - Make price + instruction text cleaner.

2. **Improve bKash number + copy row**
   - Switch to responsive layout:
     - On mobile: stacked is ok, but we’ll ensure no overflow and good tap target.
     - On slightly larger screens: align side-by-side.
   - Add:
     - `break-all` or `break-words` to number
     - Button remains `size="sm"` but with adequate padding and full width on mobile if needed.

3. **Form mobile polish**
   - Increase spacing consistency:
     - `space-y-3 md:space-y-4`
   - Ensure inputs have comfortable height on mobile (if not already).
   - Optional: make submit button label Bengali (if you want), otherwise keep as is.

4. **Success message polish**
   - Make next steps clearer (still short):
     - confirm 24 hours
     - mention WhatsApp/Mobile
   - Keep the “Back to home” button full width (already is).

---

## Testing checklist (what I will verify)
- Mobile view (using the phone icon in preview):
  - Sticky CTA shows and doesn’t cover content
  - SalesCopy text not overly large, still readable
  - CTAs are easy to tap and consistent
- Desktop view:
  - No unwanted typography changes
  - Spacing remains similar to current
- Order page:
  - Copy button works
  - Layout looks clean on small screens
  - Form fields are comfortable to use

---

## Out of scope (unless you ask)
- Changing any Bangla copy content
- Changing the number of CTAs in SalesCopy (we will keep 3)
- Adding new backend features / payment verification automation

---

## Files I expect to touch
- `src/pages/Index.tsx`
- `src/components/landing/SalesCopy.tsx`
- `src/components/landing/FinalCTA.tsx`
- `src/pages/Order.tsx`
- (optional) a small new component for the sticky CTA (if we prefer not to inline it)

---

## Feature suggestions (optional next improvements)
1) Add a WhatsApp “Help” button on Order page (opens chat with prefilled message).
2) Add a lightweight “scroll to order” CTA in Hero section for better flow.
3) Add a “Payment step checklist” UI (Step 1 Send Money → Step 2 Fill form → Step 3 Receive ebook).
4) Add a small FAQ accordion on the Order page (common payment questions).
5) Add PWA install support so users can “install” the site like an app on mobile.
