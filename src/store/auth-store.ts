"use client";
// @typescript-eslint/no-explicit-any

import { create } from "zustand";
type PingUser = {
  name?: string;
  email?: string;
  sub?: string;
  username?: string;
};

type AuthStore = {
  oidcClient: any | null;
  journeyClient: any | null;
  isAuthenticated: boolean;
  user: PingUser | null;
  renderStep: any | null;
  submissionStep: any | null;
  formError: string | null;
  isSubmitting: boolean;

  setOidcClient: (client: any) => void;
  setJourneyClient: (client: any) => void;
  setAuthenticated: (value: boolean) => void;
  setUser: (user: PingUser | null) => void;
  setRenderStep: (step: any | null) => void;
  setSubmissionStep: (step: any | null) => void;
  setFormError: (msg: string | null) => void;
  setIsSubmitting: (value: boolean) => void;
  resetJourney: () => void;
  resetAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  oidcClient: null,
  journeyClient: null,
  isAuthenticated: false,
  user: null,
  renderStep: null,
  submissionStep: null,
  formError: null,
  isSubmitting: false,

  setOidcClient: (oidcClient) => set({ oidcClient }),
  setJourneyClient: (journeyClient) => set({ journeyClient }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setUser: (user) => set({ user }),
  setRenderStep: (renderStep) => set({ renderStep }),
  setSubmissionStep: (submissionStep) => set({ submissionStep }),
  setFormError: (formError) => set({ formError }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  resetJourney: () =>
    set({
      renderStep: null,
      submissionStep: null,
      formError: null,
      isSubmitting: false,
    }),

  resetAuth: () =>
    set({
      oidcClient: null,
      journeyClient: null,
      isAuthenticated: false,
      user: null,
      renderStep: null,
      submissionStep: null,
      formError: null,
      isSubmitting: false,
    }),
}));
