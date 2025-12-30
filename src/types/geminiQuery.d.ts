export interface ChatMessage {
    role: 'user' | 'model';
    content: string
}

export interface GeminiQuery {
    query: string;
    history: ChatMessage[];
    localTime: string;
    model: string
}