
export interface Experience {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export interface GeneratedResume {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  enhancedExperience: Experience[];
  enhancedSkills: string[];
  enhancedEducation: Education[];
}

export enum Step {
  Welcome,
  Input,
  Processing,
  Preview
}
