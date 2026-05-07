import { getStoreReviewList } from "../repositories/list.repository.js";
import { responseFromList } from "../dtos/list.dto.js";
import * as listRepo from "../repositories/list.repository.js";
import * as listDto from "../dtos/list.dto.js";

export const getReviewList = async (
  storeId: number,
  cursorId: number | null,
) => {
  const limit = 10; // 한 페이지에 보여줄 개수

  const reviews = await getStoreReviewList(storeId, cursorId, limit);

  return responseFromList(reviews, limit);
};

export const getStoreMissionList = async (storeId: number) => {
  const missions = await listRepo.getMissionsByStoreId(storeId);
  return listDto.responseFromStoreMissions(missions);
};

export const getMyOngoingMissionList = async (memberId: number) => {
  const myMissions = await listRepo.getMyOngoingMissions(memberId);
  return listDto.responseFromMyMissions(myMissions);
};

export const completeMyMission = async (memberMissionId: number) => {
  const result = await listRepo.updateMissionToComplete(memberMissionId);
  return { id: result.id, status: result.status };
};
