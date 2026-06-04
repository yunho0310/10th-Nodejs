import {
    Controller,
    Get,
    Query,
    Path,
    Route,
    Tags,
    Patch,
    Middlewares,
    Request,
} from "tsoa";
import { StatusCodes } from "http-status-codes";
import * as listService from "../services/list.service.js";
import { ApiResponse, success } from "../../../common/responses/response.js";
import { authorizeUser } from "../../../common/middlewares/auth.middleware.js";
import { Request as ExpressRequest } from "express";
import {
    ReviewListResponse,
    StoreMissionResponse,
    MyMissionResponse,
    responseFromStoreMissions,
    responseFromMyMissions,
} from "../dtos/list.dto.js";

@Route("list")
@Tags("List & Missions")
export class ListController extends Controller {
    /**
     * 특정 가게의 리뷰 목록을 조회합니다. (커서 기반 페이지네이션)
     * @summary 가게별 리뷰 목록 조회 API
     */
    @Get("stores/{storeId}/reviews")
    public async handleGetReviewList(
        @Path() storeId: number,
        @Query() cursorId?: number,
    ): Promise<ApiResponse<ReviewListResponse>> {
        const result = await listService.getReviewList(
            storeId,
            cursorId ?? null,
        );
        return success(result);
    }

    /**
     * 특정 가게의 미션 목록을 조회합니다.
     * @summary 가게별 미션 목록 조회 API
     */
    @Get("stores/{storeId}/missions")
    public async handleStoreMissions(
        @Path() storeId: number,
    ): Promise<ApiResponse<StoreMissionResponse[]>> {
        const result = await listService.getStoreMissionList(storeId);
        return success(responseFromStoreMissions(result));
    }

    /**
     * 현재 내가 진행 중인 미션 목록을 조회합니다.
     * @summary 내가 진행 중인 미션 목록 조회 API (인증 필요)
     */
    @Get("members/me/missions/ongoing")
    @Middlewares(authorizeUser())
    public async handleMyMissions(
        @Request() req: ExpressRequest,
    ): Promise<ApiResponse<MyMissionResponse[]>> {
        // 🔥 서버가 터지지 않도록 req.user 존재 여부 가드 추가
        if (!req.user || !req.user.id) {
            this.setStatus(StatusCodes.UNAUTHORIZED);
            throw new Error("인증 정보가 유효하지 않거나 로그인이 필요합니다.");
        }

        const memberId = req.user.id;
        const result = await listService.getMyOngoingMissionList(memberId);
        return success(responseFromMyMissions(result));
    }

    /**
     * 미션 수행을 완료 상태로 변경합니다.
     * @summary 미션 수행 완료 처리 API (인증 필요)
     */
    @Patch("members/me/missions/{memberMissionId}/complete")
    @Middlewares(authorizeUser())
    public async handleCompleteMission(
        @Path() memberMissionId: number,
        @Request() req: ExpressRequest,
    ): Promise<ApiResponse<{ memberMissionId: number }>> {
        // 🔥 서버가 터지지 않도록 req.user 존재 여부 가드 추가
        if (!req.user || !req.user.id) {
            this.setStatus(StatusCodes.UNAUTHORIZED);
            throw new Error("인증 정보가 유효하지 않거나 로그인이 필요합니다.");
        }

        const result = await listService.completeMyMission(memberMissionId);
        return success({
            memberMissionId: result.id,
        });
    }
}
