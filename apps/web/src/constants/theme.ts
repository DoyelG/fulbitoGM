// Theme tokens for Fulbito Gala Awards (and scalable future votations)
export const GalaColors = {
  background: '#1b1b22',
  gold: '#d6b36a',
  goldLight: '#f1dba4',
  goldDark: '#8c6d33',
  silver: '#c9ccd3',
  silverDark: '#6f737c',
  shadow: '#111116',
  accent: '#7c3aed',
}

export const GalaFonts = {
  display: 'Bodoni Moda, serif',
  sans: 'Inter, Arial, Helvetica, sans-serif',
}

// For awards-votation flow, generalize to edition/category/ballot
export type AwardEdition = {
  year: number;
  categories: AwardCategory[];
  status: 'open' | 'closed' | 'nominations' | 'gala';
  closesAt: string;
}

export type AwardCategory = {
  key: string;
  tone: 'honor' | 'humor';
  order: number;
  title: string;
  description: string;
  nomineeIds: string[];
}

export type AwardBallot = {
  edition: number;
  votes: { [categoryKey: string]: string | null };
  submittedAt?: string;
}
