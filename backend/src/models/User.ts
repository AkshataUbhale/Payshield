import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  publicKey: string;
  role: "freelancer" | "client" | "admin";
  username?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  emailVerified?: boolean;
  phone?: {
    countryCode?: string;
    number?: string;
    verified?: boolean;
  };
  avatarUrl?: string;
  bio?: string;
  languages?: Array<{ language: string; level: string }>;
  occupation?: string;
  occupationStartYear?: string;
  occupationEndYear?: string;
  occupationSkills?: string[];
  skills?: string[];
  skillsDetail?: Array<{ name: string; level: string }>;
  education?: Array<{
    country: string;
    university: string;
    title: string;
    major: string;
    year: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  personalWebsite?: string;
  portfolioLinks?: string[];
  portfolioCaseStudies?: string[];
  resumeUrl?: string;
  resumeName?: string;
  linkedAccounts?: {
    google?: boolean;
    linkedin?: boolean;
    twitter?: boolean;
    showPublic?: boolean;
  };
  clientType?: "client_only" | "dual_role";
  buyingCategory?: string;
  companyName?: string;
  companySize?: string;
  industry?: string;
  availabilityWindow?: {
    timeZone?: string;
    dailyHours?: string;
  };
  hourlyRate?: number;
  nonce?: string;
  availability?: string;
  experienceLevel?: string;
  typicalBudget?: string;
  preferredDuration?: string;
  preferredProjectTypes?: string[];
  preferredPaymentMethods?: string[];
  notificationPreferences?: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
  completenessScore?: number;
  onboardingComplete: boolean;
  rating?: number;
  reviewCount?: number;
  completedJobs?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    publicKey: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: ["freelancer", "client", "admin"],
      default: "freelancer",
    },
    username: { type: String },
    fullName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    displayName: { type: String },
    email: { type: String },
    emailVerified: { type: Boolean, default: false },
    phone: {
      countryCode: { type: String, default: "+1" },
      number: { type: String, default: "" },
      verified: { type: Boolean, default: false },
    },
    avatarUrl: { type: String },
    bio: { type: String, default: "" },
    languages: {
      type: [
        {
          language: { type: String },
          level: { type: String },
        },
      ],
      default: [],
    },
    occupation: { type: String, default: "" },
    occupationStartYear: { type: String, default: "" },
    occupationEndYear: { type: String, default: "" },
    occupationSkills: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    skillsDetail: {
      type: [
        {
          name: { type: String },
          level: { type: String },
        },
      ],
      default: [],
    },
    education: {
      type: [
        {
          country: { type: String },
          university: { type: String },
          title: { type: String },
          major: { type: String },
          year: { type: String },
        },
      ],
      default: [],
    },
    certifications: {
      type: [
        {
          name: { type: String },
          issuer: { type: String },
          year: { type: String },
        },
      ],
      default: [],
    },
    personalWebsite: { type: String, default: "" },
    portfolioLinks: { type: [String], default: [] },
    portfolioCaseStudies: { type: [String], default: [] },
    resumeUrl: { type: String, default: "" },
    resumeName: { type: String, default: "" },
    linkedAccounts: {
      google: { type: Boolean, default: false },
      linkedin: { type: Boolean, default: false },
      twitter: { type: Boolean, default: false },
      showPublic: { type: Boolean, default: false },
    },
    clientType: { type: String, enum: ["client_only", "dual_role"], default: "client_only" },
    buyingCategory: { type: String, default: "" },
    companyName: { type: String, default: "" },
    companySize: { type: String, default: "" },
    industry: { type: String, default: "" },
    availabilityWindow: {
      timeZone: { type: String, default: "UTC" },
      dailyHours: { type: String, default: "9:00 AM - 5:00 PM" },
    },
    hourlyRate: { type: Number, default: 50 },
    nonce: { type: String },
    availability: { type: String, default: "full-time" },
    experienceLevel: { type: String, default: "intermediate" },
    typicalBudget: { type: String, default: "" },
    preferredDuration: { type: String, default: "" },
    preferredProjectTypes: { type: [String], default: [] },
    preferredPaymentMethods: { type: [String], default: [] },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    completenessScore: { type: Number, default: 0 },
    onboardingComplete: { type: Boolean, default: false, index: true },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
