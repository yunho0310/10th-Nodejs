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
import { challengeMission } from "../services/memberMission.service.js";
import { ApiResponse, success } from "../../../common/responses/response.js";
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
  * @param missionId 도전할 미션 ID
  * @param body 도전을 요청하는 회원 정보 (memberId 등)
  */
 @SuccessResponse(StatusCodes.CREATED, "Created")
 @Post("{missionId}/challenges")
 public async handleMissionChallenge(
  @Path() missionId: number,
  @Body() body: MissionChallengeRequest,
 ): Promise<ApiResponse<MissionChallengeResponse>> {
  // 1. 서비스 호출
  const result = await challengeMission(body.memberId, missionId);

  // 2. null 체크 (Type Guard)
  // 결과가 null이면 더 이상 진행하지 않고 에러를 던집니다.
  if (!result) {
   throw new Error(
    "미션 도전에 실패했습니다. 이미 도전 중이거나 존재하지 않는 미션일 수 있습니다.",
   );
  }

  // 3. 타입 변환 및 응답
  // responseFromMemberMission 함수를 통해 { id, ... } 형식을
  // MissionChallengeResponse 규격인 { memberMissionId, ... }로 변환합니다.
  this.setStatus(StatusCodes.CREATED);
  return success(responseFromMemberMission(result));
 }
}
