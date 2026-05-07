import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { getReviewList } from "../services/list.service.js";
import * as listService from "../services/list.service.js";

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

// 특정 가게 미션 목록 조회
export const handleStoreMissions = async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId as string);
  const result = await listService.getStoreMissionList(storeId);
  res.status(StatusCodes.OK).json({ isSuccess: true, result });
};

// 내 진행 중인 미션 목록 조회
export const handleMyMissions = async (req: Request, res: Response) => {
  const memberId = 1; // 임시 ID
  const result = await listService.getMyOngoingMissionList(memberId);
  res.status(StatusCodes.OK).json({ isSuccess: true, result });
};

// 미션 완료 상태 변경
export const handleCompleteMission = async (req: Request, res: Response) => {
  const { memberMissionId } = req.params;

  // memberMissionId 뒤에 'as string'을 붙여줍니다.
  const result = await listService.completeMyMission(
    parseInt(memberMissionId as string),
  );

  res.status(StatusCodes.OK).json({
    isSuccess: true,
    message: "미션 상태가 완료되었습니다.",
    result,
  });
};
