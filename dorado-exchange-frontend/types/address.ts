import * as z from "zod";

export const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];

const phoneRegex = /^\(\d{3}\)\s\d{3}\s-\s\d{4}$/;

const blockedCities = ["Test", "Fake City", "Unknown", "N/A"];

export const addressSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  line_1: z
    .string()
    .min(1, "Address Line 1 is required")
    .max(100, "Address Line 1 is too long")
    .trim()
    .regex(/^[a-zA-Z0-9\s.,'-]+$/, "Invalid characters in Address Line 1")
    .regex(/^(?!.*\b[P|p](OST|ost)?\.?\s*[O|o](FFICE|ffice)?\.?\s*[B|b](OX|ox)\b).*$/, "PO Boxes are not allowed"),
  line_2: z.string().optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City name is too long")
    .trim()
    .refine((val) => !blockedCities.includes(val), {
      message: "Invalid city name",
    }),
  state: z
    .enum(states as [string, ...string[]], {
      errorMap: () => ({ message: "Invalid US state abbreviation" }),
    }),
  country: z.literal("United States", {
    errorMap: () => ({ message: "Country must be United States" }),
  }),
  zip: z
    .string()
    .min(5, "Zip Code must be at least 5 digits")
    .max(10, "Zip Code cannot be longer than 10 characters")
    .regex(/^\d{5}(-\d{4})?$/, "Invalid Zip Code format (e.g., 12345 or 12345-6789)")
    .refine((val) => !isNaN(Number(val.replace("-", ""))), {
      message: "Zip Code must only contain numbers",
    }),
  name: z
    .string()
    .min(1, "Name is required")
    .trim(),
  is_default: z
    .boolean()
    .optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  phone_number: z.string().regex(phoneRegex, 'Invalid Phone Number'),
});

export type Address = z.infer<typeof addressSchema>;