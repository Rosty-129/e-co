
import rateLimit from "express-rate-limit";

// Shared configuration
const createLimiter = (limit, message) => {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        limit,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: {
            success: false,
            message
        }
    });
};

// GENERAL API
export const generalLimiter = createLimiter(
    100,
    "Too many requests. Please try again later."
);

// AUTHENTICATION
export const loginLimiter = createLimiter(
    5,
    "Too many login attempts. Please try again later."
);

export const registerLimiter = createLimiter(
    5,
    "Too many registration attempts. Please try again later."
);

export const forgotPasswordLimiter = createLimiter(
    3,
    "Too many password reset requests. Please try again later."
);

export const resetPasswordLimiter = createLimiter(
    5,
    "Too many password reset attempts. Please try again later."
);

export const resendCodeLimiter = createLimiter(
    3,
    "Too many verification code requests. Please try again later."
);

export const verifyEmailLimiter = createLimiter(
    5,
    "Too many verification attempts. Please try again later."
);

export const refreshTokenLimiter = createLimiter(
    10,
    "Too many token refresh requests. Please try again later."
);

// ORDERS
export const ordersLimiter = createLimiter(
    10,
    "Too many order requests. Please try again later."
);

// REVIEWS
export const reviewsLimiter = createLimiter(
    5,
    "Too many review requests. Please try again later."
);

// CART
export const cartLimiter = createLimiter(
    30,
    "Too many cart requests. Please try again later."
);

// PRODUCT AND CATEGORY READING
export const readLimiter = createLimiter(
    100,
    "Too many requests. Please try again later."
);

// DASHBOARD
export const dashboardLimiter = createLimiter(
    60,
    "Too many dashboard requests. Please try again later."
);

// ADMIN OPERATIONS
export const adminWriteLimiter = createLimiter(
    30,
    "Too many administrative requests. Please try again later."
);
