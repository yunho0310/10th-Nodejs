import { RowDataPacket } from "mysql2";
import { pool } from "../../../db.config.js";

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
