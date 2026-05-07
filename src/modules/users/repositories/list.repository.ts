import { RowDataPacket } from "mysql2";
import { pool } from "../../../db.config.js";
import { PrismaClient } from "../../../generated/prisma/index.js";
const prisma = new PrismaClient();

export const getStoreReviewList = async (
  storeId: number,
  cursorId: number | null,
  limit: number,
) => {
  const conn = await pool.getConnection();
  try {
    // 커서가 있으면 해당 ID보다 작은(이전 데이터) 데이터를 조회
    const query = `
      SELECT r.id, u.nickname, r.score, r.content, r.created_at 
      FROM review r
      JOIN user u ON r.user_id = u.id
      WHERE r.store_id = ? ${cursorId ? "AND r.id < ?" : ""}
      ORDER BY r.id DESC
      LIMIT ?;
    `;

    const params = cursorId
      ? [storeId, cursorId, limit + 1]
      : [storeId, limit + 1];
    const [reviews] = await conn.query<RowDataPacket[]>(query, params);

    return reviews;
  } finally {
    conn.release();
  }
};
// 1. 가게별 미션 목록
export const getMissionsByStoreId = async (storeId: number) => {
  return await prisma.mission.findMany({
    // 모델명 Mission -> mission
    where: { storeId: storeId },
    orderBy: { id: "desc" },
  });
};

// 2. 내 진행 중인 미션 목록
export const getMyOngoingMissions = async (memberId: number) => {
  return await prisma.memberMission.findMany({
    // 모델명 MemberMission -> memberMission
    where: {
      memberId: memberId,
      status: "CHALLENGING",
    },
    include: {
      mission: {
        include: { store: true },
      },
    },
  });
};

// 3. 미션 완료 처리
export const updateMissionToComplete = async (memberMissionId: number) => {
  return await prisma.memberMission.update({
    where: { id: memberMissionId },
    data: { status: "COMPLETE" },
  });
};
