// ─── Async Handler Wrapper ──────────────────────────────────────────────────
// Har controller function ko wrap karo — try/catch likhne ki zarurat nahi
//
// ❌ Without asyncHandler:
//   export const login = async (req, res, next) => {
//     try { ... } catch (error) { next(error); }
//   };
//
// ✅ With asyncHandler:
//   export const login = asyncHandler(async (req, res) => {
//     ... (error automatically next() mein chala jayega)
//   });

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
