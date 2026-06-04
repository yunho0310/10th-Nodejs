export interface MissionRequest {
 content: string;
 reward: number;
 deadline: string; // 또는 Date
}

// mission.dto.ts
export type MissionResponse = {
 id: number;
 reward: number;
 deadline: Date;
 missionSpec: string;
 storeId: number;
 store?: {
  id: number;
  name: string;
  address: string;
 };
} | null; // null 허용 추가
