import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { getReviewList } from "../services/list.service.js";

export const handleGetReviewList = async (
  req: Request<{ storeId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = parseInt(req.params.storeId);
    // 쿼리 스트링으로 cursorId를 받음 (없으면 null)
    const cursorId = req.query.cursorId
      ? parseInt(req.query.cursorId as string)
      : null;

    const result = await getReviewList(storeId, cursorId);

    res.status(StatusCodes.OK).json({
      isSuccess: true,
      message: "리뷰 목록 조회에 성공했습니다.",
      result,
    });
  } catch (err: any) {
    res.status(StatusCodes.BAD_REQUEST).json({
      isSuccess: false,
      message: err.message,
    });
  }
};
