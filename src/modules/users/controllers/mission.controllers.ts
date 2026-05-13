import {
 Body,
 Controller,
 Post,
 Path,
 Route,
 Tags,
 SuccessResponse,
} from "tsoa";
import { StatusCodes } from "http-status-codes";
import { createMission } from "../services/mission.service.js";
import { ApiResponse, success } from "../../../common/responses/response.js";
import { MissionRequest, MissionResponse } from "../dtos/mission.dto.js";

@Route("restaurants")
@Tags("Mission")
export class MissionController extends Controller {
 /**
  * 특정 식당에 새로운 미션을 등록합니다.
  * @param restaurantId 식당 ID
  * @param body 미션 정보 (내용, 점수, 마감일 등)
  */
 @SuccessResponse(StatusCodes.CREATED, "Created")
 @Post("{restaurantId}/missions")
 public async handleMissionCreate(
  @Path() restaurantId: number,
  @Body() body: MissionRequest,
 ): Promise<ApiResponse<MissionResponse>> {
  console.log(`식당 ID ${restaurantId}에 새로운 미션 등록을 요청했습니다.`);

  // 서비스 로직 호출
  const result = await createMission(restaurantId, body);

  // HTTP 상태 코드를 201로 설정
  this.setStatus(StatusCodes.CREATED);

  // 통일된 규격으로 성공 응답 반환
  return success(result);
 }
}
