const { z } = require("zod");

// Auth schemas
const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
    email: z.string().trim().email("Invalid email address").toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["tenant", "owner", "admin"], {
      errorMap: () => ({ message: "Role must be tenant, owner, or admin" }),
    }),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address").toLowerCase(),
    password: z.string().min(1, "Password is required"),
  }),
});

// Listing schemas
const createListingSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
    location: z.string().trim().min(1, "Location is required"),
    rent: z.coerce.number().nonnegative("Rent must be a positive number"),
    availableFrom: z.string().transform((val) => new Date(val)),
    roomType: z.enum(["single", "shared", "1bhk", "2bhk", "other"]).default("single"),
    furnishing: z.enum(["furnished", "semi-furnished", "unfurnished"]).default("unfurnished"),
    description: z.string().optional().default(""),
    photos: z.array(z.string()).optional().default([]),
    societyName: z.string().optional().default(""),
    area: z.string().optional().default(""),
    city: z.string().optional().default(""),
    state: z.string().optional().default(""),
    pincode: z.string().optional().default(""),
    landmark: z.string().optional().default(""),
    locationCoords: z.object({
      type: z.string().default("Point"),
      coordinates: z.array(z.number()).length(2),
    }).optional(),
  }),
});

const updateListingSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(200, "Title is too long").optional(),
    location: z.string().trim().min(1, "Location is required").optional(),
    rent: z.coerce.number().nonnegative("Rent must be a positive number").optional(),
    availableFrom: z.string().transform((val) => new Date(val)).optional(),
    roomType: z.enum(["single", "shared", "1bhk", "2bhk", "other"]).optional(),
    furnishing: z.enum(["furnished", "semi-furnished", "unfurnished"]).optional(),
    description: z.string().optional(),
    photos: z.array(z.string()).optional(),
    status: z.enum(["available", "filled"]).optional(),
    societyName: z.string().optional(),
    area: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    landmark: z.string().optional(),
    locationCoords: z.object({
      type: z.string().default("Point"),
      coordinates: z.array(z.number()).length(2),
    }).optional(),
  }),
});

// Tenant Profile schemas
const upsertProfileSchema = z.object({
  body: z.object({
    preferredLocation: z.string().trim().min(1, "Preferred location is required"),
    budgetMin: z.coerce.number().nonnegative("Min budget must be a positive number"),
    budgetMax: z.coerce.number().nonnegative("Max budget must be a positive number"),
    moveInDate: z.string().transform((val) => new Date(val)),
    notes: z.string().optional().default(""),
    preferredRoomType: z.enum(["single", "shared", "1bhk", "2bhk", "other"]).nullable().optional().or(z.literal("")),
    preferredFurnishing: z.enum(["furnished", "semi-furnished", "unfurnished"]).nullable().optional().or(z.literal("")),
    parkingRequired: z.preprocess((val) => (val === "true" || val === true ? true : val === "false" || val === false ? false : undefined), z.boolean().optional()),
    petsAllowed: z.preprocess((val) => (val === "true" || val === true ? true : val === "false" || val === false ? false : undefined), z.boolean().optional()),
    smokingAllowed: z.preprocess((val) => (val === "true" || val === true ? true : val === "false" || val === false ? false : undefined), z.boolean().optional()),
    genderPreference: z.enum(["any", "male", "female", "other"]).default("any"),
    bio: z.string().optional().default(""),
    occupation: z.string().optional().default(""),
    languages: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    avatarUrl: z.string().optional().default(""),
    phoneVerified: z.preprocess((val) => (val === "true" || val === true ? true : val === "false" || val === false ? false : undefined), z.boolean().optional()),
    identityVerified: z.preprocess((val) => (val === "true" || val === true ? true : val === "false" || val === false ? false : undefined), z.boolean().optional()),
  }).refine((data) => data.budgetMin <= data.budgetMax, {
    message: "Minimum budget cannot be greater than maximum budget",
    path: ["budgetMin"],
  }),
});

// Interest schemas
const createInterestSchema = z.object({
  body: z.object({
    listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Listing ID format"),
  }),
});

const updateInterestSchema = z.object({
  body: z.object({
    status: z.enum(["accepted", "rejected"]),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Interest ID format"),
  }),
});

const searchListingsQuerySchema = z.object({
  query: z.object({
    location: z.string().trim().optional(),
    minRent: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().nonnegative("minRent must be a positive number").optional()),
    maxRent: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().nonnegative("maxRent must be a positive number").optional()),
    roomType: z.enum(["single", "shared", "1bhk", "2bhk", "other"]).optional(),
    furnishing: z.enum(["furnished", "semi-furnished", "unfurnished"]).optional(),
    page: z.preprocess((val) => (val === "" || val === undefined ? 1 : parseInt(val, 10)), z.number().int().positive().default(1)),
    limit: z.preprocess((val) => (val === "" || val === undefined ? 10 : parseInt(val, 10)), z.number().int().positive().default(10)),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  createListingSchema,
  updateListingSchema,
  upsertProfileSchema,
  createInterestSchema,
  updateInterestSchema,
  searchListingsQuerySchema,
};
