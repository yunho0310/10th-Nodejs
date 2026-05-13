import {
 isMissionChallenging,
 addMemberMission,
 getMemberMission,
} from "../repositories/memberMission.repository.js";
import { AlreadyChallenging } from "../../../common/errors/error.js";

export const challengeMission = async (memberId: number, missionId: number) => {
 // 1. 중복 도전 여부 확인
 const alreadyChallenging = await isMissionChallenging(memberId, missionId);

 if (alreadyChallenging) {
  throw new AlreadyChallenging("이미 도전중인 미션입니다.");
 }

 // 2. 미션 도전 데이터 추가
 const memberMissionId = await addMemberMission(memberId, missionId);

 return await getMemberMission(memberMissionId);
};
