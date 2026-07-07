/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PageId =
  | 'dashboard'
  | 'shipments'
  | 'fleet-drivers'
  | 'calendar'
  | 'clients'
  | 'documents'
  | 'finance'
  | 'quotations'
  | 'ai-assistant'
  | 'todo'
  | 'settings';

export interface NavItem {
  id: PageId;
  label: string;
  icon: string; // We'll map string names to Lucide icons dynamically or in a component map
  description: string;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
}

export interface BreadcrumbStep {
  label: string;
  href?: string;
}
