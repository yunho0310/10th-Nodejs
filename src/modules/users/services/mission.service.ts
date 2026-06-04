import { MissionRequest, MissionResponse } from "../dtos/mission.dto.js";
import { addMission, getMission } from "../repositories/mission.repository.js";

export const createMission = async (
    restaurantId: number,
    data: MissionRequest,
): Promise<MissionResponse> => {
    // 👈 반환 타입을 명시적으로 지정합니다.

    // 1. 리포지토리를 통해 DB에 미션 추가 (getMission이 number를 받으므로 Number로 변환하거나, repository 스펙에 맞춤)
    const missionId = await addMission(restaurantId, data);

    // 2. 추가된 미션 정보 조회 (여기서 반환되는 mission은 { id: bigint, price: ... } 형태임)
    const mission = await getMission(Number(missionId));

    // 3. 만약 데이터가 없다면 null 반환 (MissionResponse가 null을 허용하므로 안전함)
    if (!mission) {
        return null;
    }

    // 4. 🔥 핵심: 원본 데이터를 MissionResponse 형식으로 완벽하게 변환(Mapping)하여 반환
    return {
        id: Number(mission.id), // bigint -> number 변환
        reward: mission.price ?? mission.point ?? 0, // price나 point를 reward로 매핑

        // ⚠️ 아래 두 필드는 DB 원본 객체(mission)에서 실제 해당하는 컬럼명으로 매칭해 주셔야 합니다.
        deadline: new Date(), // 예시: 실제로는 mission.deadline 또는 mission.createdAt 등
        missionSpec: "미션 상세 내용", // 예시: 실제로는 mission.content 또는 mission.spec 등

        storeId: Number(mission.restaurantId), // restaurantId(bigint) -> storeId(number) 변환

        // store 정보가 있다면 포함, 없다면 생략 가능 (Optional)
        // store: mission.store ? { id: Number(mission.store.id), name: mission.store.name, address: mission.store.address } : undefined
    };
};
