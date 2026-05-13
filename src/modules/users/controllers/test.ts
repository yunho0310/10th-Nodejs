import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { challengeMission } from "../services/memberMission.service.js";
import { MissionChallengeRequest } from "../dtos/memberMission.dto.js";

export const handleMissionChallenge = async (
 req: Request,
 res: Response,
 next: NextFunction,
) => {
 try {
  // 실제로는 인증 미들웨어에서 가져오겠지만, 일단 body나 토큰에서 온다고 가정
  const data: MissionChallengeRequest = req.body;
  const missionId = parseInt(req.params.missionId as string);

  const result = await challengeMission(data.memberId, missionId);

  res.status(StatusCodes.CREATED).json({
   isSuccess: true,
   message: "미션 도전을 시작했습니다.",
   result,
  });
 } catch (err: any) {
  res.status(StatusCodes.BAD_REQUEST).json({
   isSuccess: false,
   message: err.message,
  });
 }
};
