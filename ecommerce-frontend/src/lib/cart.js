// ─── Cart Storage Helper ────────────────────────────────────────────────────
// Cart abhi sirf browser ke localStorage mein rehta hai (koi backend cart nahi).
// Har jagah raw localStorage use karne ke bajaye sab kuch yahin se guzarta hai,
// taaki HAR write ke baad "cartUpdated" event fire ho aur Navbar ka badge
// bina page reload ke turant update ho jaaye.

const CART_KEY = "cart";
export const CART_UPDATED_EVENT = "cartUpdated";

// Cart padho. Agar localStorage mein kharab/corrupt JSON hai to crash mat karo —
// warna JSON.parse ka error Navbar ko har page par tod deta hai
export const readCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Cart likho aur sabko batao ke cart badal gaya hai
export const writeCart = (items) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
};

// Total items count (badge isi ko dikhata hai)
export const getCartCount = (items = readCart()) =>
  items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
