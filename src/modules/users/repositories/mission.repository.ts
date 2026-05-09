import { PrismaClient } from "../../../generated/prisma/index.js";

const prisma = new PrismaClient();

/**
 * 새로운 미션 추가
 */
export const addMission = async (restaurantId: number, data: any) => {
  // 스키마 모델에 정의된 필드명이 'storeId'이므로 이에 맞춰 수정했습니다.
  const result = await prisma.mission.create({
    data: {
      storeId: restaurantId,
      reward: data.reward,
      deadline: new Date(data.deadline),
      missionSpec: data.missionSpec,
    },
  });

  return result.id;
};

/**
 * 특정 미션 상세 조회
 */
export const getMission = async (missionId: number) => {
  return await prisma.mission.findUnique({
    where: {
      id: missionId,
    },
    // 미션과 연결된 가게(Store) 정보도 함께 가져오고 싶을 때 사용합니다.
    include: {
      store: true,
    },
  });
};

/**
 * 특정 가게의 모든 미션 목록 조회
 */
export const getMissionsByStore = async (storeId: number) => {
  return await prisma.mission.findMany({
    where: {
      storeId: storeId,
    },
    orderBy: {
      deadline: "asc", // 마감일 순으로 정렬
    },
  });
};

/**
 * 미션 존재 여부 확인
 */
export const existMission = async (missionId: number) => {
  const count = await prisma.mission.count({
    where: { id: missionId },
  });
  return count > 0;
};
