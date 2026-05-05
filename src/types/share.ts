export type CardType = 'daily' | 'roast' | 'compatibility' | 'vibe';
export type TemplateName = 'cosmic' | 'minimal' | 'brutal' | 'aura';

export interface ShareCard {
  id: string;
  cardType: CardType;
  content: Record<string, unknown>;
  template: TemplateName;
  publicSlug: string;
  createdAt: string;
}
