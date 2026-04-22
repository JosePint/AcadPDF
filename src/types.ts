/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AcademicWork {
  id?: string;
  title: string;
  studentName: string;
  institution: string;
  course: string;
  professor: string;
  academicLevel: 'Ensino Médio' | 'Universidade';
  norms: 'APA' | 'ABNT' | 'MLA';
  pages: number;
  logoUrl?: string;
  content: {
    introduction: string;
    development: string;
    conclusion: string;
    references: string;
  };
  ownerId: string;
  status: 'draft' | 'generated' | 'published';
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  institution?: string;
  course?: string;
  createdAt: any;
}
