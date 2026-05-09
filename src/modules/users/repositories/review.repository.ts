// 사용자가 지정한 경로에서 PrismaClient 임포트
import { PrismaClient } from "../../../generated/prisma/index.js";

const prisma = new PrismaClient();

/**
 * 새로운 미션 추가
 */
export const addMission = async (restaurantId: number, data: any) => {
  // 스키마 모델 필드명 'storeId'에 맞춰 작성
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
    include: {
      store: true, // 연결된 Store(Restaurant) 정보 포함
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
      deadline: "asc",
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
