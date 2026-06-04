import {
    Body,
    Controller,
    Post,
    Path,
    Route,
    Tags,
    SuccessResponse,
    Middlewares,
    Request,
} from "tsoa";
import { StatusCodes } from "http-status-codes";
import { challengeMission } from "../services/memberMission.service.js";
import { ApiResponse, success } from "../../../common/responses/response.js";
import { authorizeUser } from "../../../common/middlewares/auth.middleware.js";
import { Request as ExpressRequest } from "express";
import {
    MissionChallengeRequest,
    MissionChallengeResponse,
    responseFromMemberMission,
} from "../dtos/memberMission.dto.js";

@Route("missions")
@Tags("MemberMission")
export class MemberMissionController extends Controller {
    /**
     * 사용자가 특정 미션에 도전합니다.
     * @summary 사용자 미션 도전하기 API (인증 필요)
     * @param missionId 도전할 미션 ID (Path Parameter)
     * @param body 도전을 요청하는 회원 정보 (토큰 인증 기반이므로 빈 Body 상태)
     */
    @SuccessResponse(StatusCodes.CREATED, "Created")
    @Post("{missionId}/challenges")
    @Middlewares(authorizeUser())
    public async handleMissionChallenge(
        @Path() missionId: number,
        @Body() body: MissionChallengeRequest,
        @Request() req: ExpressRequest,
    ): Promise<ApiResponse<MissionChallengeResponse>> {
        // 🔥 토큰이 없거나 파싱에 실패하여 req.user가 undefined인 경우 가드 처리
        if (!req.user || !req.user.id) {
            this.setStatus(StatusCodes.UNAUTHORIZED);
            throw new Error("인증 정보가 유효하지 않거나 로그인이 필요합니다.");
        }

        const memberId = req.user.id;

        // 1. 서비스 호출 (진짜 유저 ID와 미션 ID 전달)
        const result = await challengeMission(memberId, missionId);

        // 2. null 체크 (Type Guard)
        if (!result) {
            throw new Error(
                "미션 도전에 실패했습니다. 이미 도전 중이거나 존재하지 않는 미션일 수 있습니다.",
            );
        }

        // 3. 타입 변환 및 응답
        this.setStatus(StatusCodes.CREATED);
        return success(responseFromMemberMission(result));
    }
}
