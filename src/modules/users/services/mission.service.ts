import { MissionRequest } from "../dtos/mission.dto.js";
import { addMission, getMission } from "../repositories/mission.repository.js";

export const createMission = async (
 restaurantId: number,
 data: MissionRequest,
) => {
 // 리포지토리를 통해 DB에 미션 추가
 const missionId = await addMission(restaurantId, data);

 // 추가된 미션 정보 조회 및 반환
 const mission = await getMission(missionId);
 return mission;
};
