import { Controller, Get, Query, Path, Route, Tags, Patch } from "tsoa";
import { StatusCodes } from "http-status-codes";
import * as listService from "../services/list.service.js";
import { ApiResponse, success } from "../../../common/responses/response.js";
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
  */
 @Get("stores/{storeId}/reviews")
 public async handleGetReviewList(
  @Path() storeId: number,
  @Query() cursorId?: number, // 쿼리 스트링 (?cursorId=10)
 ): Promise<ApiResponse<ReviewListResponse>> {
  const result = await listService.getReviewList(storeId, cursorId ?? null);

  // DTO 변환 함수를 거쳐서 응답
  return success(result);
 }

 /**
  * 특정 가게의 미션 목록을 조회합니다.
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
  */
 @Get("members/me/missions/ongoing")
 public async handleMyMissions(): Promise<ApiResponse<MyMissionResponse[]>> {
  const memberId = 1; // 실무에서는 인증 미들웨어에서 가져옵니다.
  const result = await listService.getMyOngoingMissionList(memberId);
  return success(responseFromMyMissions(result));
 }

 /**
  * 미션 수행을 완료 상태로 변경합니다.
  */
 @Patch("members/me/missions/{memberMissionId}/complete")
 public async handleCompleteMission(
  @Path() memberMissionId: number,
 ): Promise<ApiResponse<{ memberMissionId: number }>> {
  const result = await listService.completeMyMission(memberMissionId);

  return success({
   memberMissionId: result.id,
  });
 }
}
