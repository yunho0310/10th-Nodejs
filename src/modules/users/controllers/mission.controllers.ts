// mission.controllers.ts
import {
    Body,
    Controller,
    Post,
    Path,
    Route,
    Tags,
    SuccessResponse,
    Middlewares, // 추가
} from "tsoa";
import { StatusCodes } from "http-status-codes";
import { createMission } from "../services/mission.service.js";
import { ApiResponse, success } from "../../../common/responses/response.js";
import { authorizeUser } from "../../../common/middlewares/auth.middleware.js"; // 추가
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
    @Middlewares(authorizeUser()) // 미션 생성 권한 보호
    public async handleMissionCreate(
        @Path() restaurantId: number,
        @Body() body: MissionRequest,
    ): Promise<ApiResponse<MissionResponse>> {
        console.log(
            `식당 ID ${restaurantId}에 새로운 미션 등록을 요청했습니다.`,
        );

        const result = await createMission(restaurantId, body);
        this.setStatus(StatusCodes.CREATED);
        return success(result);
    }
}
