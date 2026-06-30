import { GlobalSearchResponse } from './search.response';

export interface AiChatResponse {
  aiMessage: string;
  suggestedRooms: GlobalSearchResponse[];
}
