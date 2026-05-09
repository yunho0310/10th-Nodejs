import { PrismaClient } from "../../../generated/prisma/index.js";
const prisma = new PrismaClient();

// 1. 가게별 리뷰 목록 조회 (커서 기반 페이지네이션)
export const getStoreReviewList = async (
  storeId: number,
  cursorId: number | null,
  limit: number,
) => {
  const reviews = await prisma.review.findMany({
    where: {
      storeId: storeId,
    },
    // 커서가 있을 경우 해당 ID를 기준으로 잡고, 그 다음 데이터(skip: 1)부터 가져옵니다.
    cursor: cursorId ? { id: cursorId } : undefined,
    skip: cursorId ? 1 : 0,
    take: limit, // 다음 페이지 존재 여부 확인을 위해 보통 limit + 1을 하기도 합니다.
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      score: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          nickname: true,
        },
      },
    },
  });

  return reviews;
};

// 2. 가게별 미션 목록 조회
export const getMissionsByStoreId = async (storeId: number) => {
  return await prisma.mission.findMany({
    where: { storeId: storeId },
    orderBy: { id: "desc" },
  });
};

// 3. 내 진행 중인 미션 목록 조회
export const getMyOngoingMissions = async (memberId: number) => {
  return await prisma.memberMission.findMany({
    where: {
      memberId: memberId,
      status: "CHALLENGING",
    },
    include: {
      mission: {
        include: {
          store: true,
        },
      },
    },
  });
};

// 4. 미션 완료 처리
export const updateMissionToComplete = async (memberMissionId: number) => {
  return await prisma.memberMission.update({
    where: { id: memberMissionId },
    data: { status: "COMPLETE" },
  });
};
