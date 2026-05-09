import { PrismaClient } from "../../../generated/prisma/index.js";
const prisma = new PrismaClient();

// 중복 확인: 해당 멤버가 해당 미션을 'CHALLENGING' 상태로 가지고 있는지 조회
export const isMissionChallenging = async (
  memberId: number,
  missionId: number,
) => {
  // findFirst를 사용하여 조건에 맞는 첫 번째 데이터를 찾음
  const mission = await prisma.memberMission.findFirst({
    where: {
      memberId: memberId,
      missionId: missionId,
      status: "CHALLENGING",
    },
    select: { id: true }, // 데이터 존재 여부만 확인하면 되므로 id만 선택 (최적화)
  });

  return mission !== null;
};

// 미션 도전 추가
export const addMemberMission = async (memberId: number, missionId: number) => {
  // Prisma는 기본적으로 커넥션 풀을 관리하므로 별도의 getConnection이 필요 없음
  const result = await prisma.memberMission.create({
    data: {
      memberId: memberId,
      missionId: missionId,
      status: "CHALLENGING",
    },
  });

  return result.id; // 생성된 레코드의 PK 반환
};

// 결과 조회
export const getMemberMission = async (memberMissionId: number) => {
  const row = await prisma.memberMission.findUnique({
    where: {
      id: memberMissionId,
    },
  });

  return row;
};
