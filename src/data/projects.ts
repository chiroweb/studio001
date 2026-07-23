export type ProjectCategory = "film" | "drama" | "advertising" | "other";

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  year: number;
  role: string;
  description: string;
  featured: boolean;
  featuredOrder: number;
  cover: string;
  focalPosition: string;
}

export const projects: Project[] = [
  {
    id: "project-01",
    slug: "after-the-rain",
    title: "AFTER THE RAIN",
    category: "film",
    year: 2026,
    role: "Key Still Photography",
    description: "A quiet crossing at the edge of a sleepless city.",
    featured: true,
    featuredOrder: 1,
    cover: "/projects/project-01/cover.jpg",
    focalPosition: "center 68%",
  },
  {
    id: "project-02",
    slug: "the-last-table",
    title: "THE LAST TABLE",
    category: "drama",
    year: 2026,
    role: "Still Photography",
    description: "The smallest gestures remain after midnight.",
    featured: true,
    featuredOrder: 2,
    cover: "/projects/project-02/cover.jpg",
    focalPosition: "center 56%",
  },
  {
    id: "project-03",
    slug: "silver-field",
    title: "SILVER FIELD",
    category: "film",
    year: 2025,
    role: "Unit & Promotional Stills",
    description: "Morning arrives slowly over a field in motion.",
    featured: true,
    featuredOrder: 3,
    cover: "/projects/project-03/cover.jpg",
    focalPosition: "center 61%",
  },
  {
    id: "project-04",
    slug: "red-form",
    title: "RED FORM",
    category: "advertising",
    year: 2026,
    role: "Campaign Visual Production",
    description: "A study in movement, light, and architectural restraint.",
    featured: true,
    featuredOrder: 4,
    cover: "/projects/project-04/cover.jpg",
    focalPosition: "center 57%",
  },
  {
    id: "project-05",
    slug: "the-coast-road",
    title: "THE COAST ROAD",
    category: "film",
    year: 2025,
    role: "Key Art & Still Photography",
    description: "One road disappears into a sea of unfinished answers.",
    featured: true,
    featuredOrder: 5,
    cover: "/projects/project-05/cover.jpg",
    focalPosition: "center 60%",
  },
  {
    id: "project-06",
    slug: "unopened",
    title: "UNOPENED",
    category: "drama",
    year: 2025,
    role: "Still Photography",
    description: "A letter holds the weight of everything left unsaid.",
    featured: true,
    featuredOrder: 6,
    cover: "/projects/project-06/cover.jpg",
    focalPosition: "center 46%",
  },
  {
    id: "project-07",
    slug: "breath",
    title: "BREATH",
    category: "other",
    year: 2026,
    role: "Performance Film Stills",
    description: "A body finds its own measure inside the dark.",
    featured: true,
    featuredOrder: 7,
    cover: "/projects/project-07/cover.jpg",
    focalPosition: "center 60%",
  },
  {
    id: "project-08",
    slug: "between-platforms",
    title: "BETWEEN PLATFORMS",
    category: "drama",
    year: 2026,
    role: "Still & Promotional Photography",
    description: "Distance becomes a language of its own.",
    featured: true,
    featuredOrder: 8,
    cover: "/projects/project-08/cover.jpg",
    focalPosition: "center 64%",
  },
];

export const categoryLabel: Record<ProjectCategory, string> = {
  film: "FILM",
  drama: "DRAMA",
  advertising: "ADVERTISING",
  other: "PERFORMANCE",
};
