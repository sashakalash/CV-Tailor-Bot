import { z } from 'zod/v4';

export const cvExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  period: z.string(),
  bullets: z.array(z.string()),
});

export const cvEducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  year: z.string(),
});

export const cvSkillCategorySchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

export const cvDataSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  summary: z.string(),
  skills: z.array(cvSkillCategorySchema),
  experience: z.array(cvExperienceSchema),
  education: z.array(cvEducationSchema),
  languages: z.array(z.string()).optional(),
});

export type CvData = z.infer<typeof cvDataSchema>;
export type CvExperience = z.infer<typeof cvExperienceSchema>;
export type CvEducation = z.infer<typeof cvEducationSchema>;
export type CvSkillCategory = z.infer<typeof cvSkillCategorySchema>;
