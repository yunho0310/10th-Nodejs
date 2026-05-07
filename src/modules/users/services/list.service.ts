import { getStoreReviewList } from "../repositories/list.repository.js";
import { responseFromList } from "../dtos/list.dto.js";

export const getReviewList = async (
  storeId: number,
  cursorId: number | null,
) => {
  const limit = 10; // 한 페이지에 보여줄 개수

  const reviews = await getStoreReviewList(storeId, cursorId, limit);

  return responseFromList(reviews, limit);
};
