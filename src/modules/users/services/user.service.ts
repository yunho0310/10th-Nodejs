import bcrypt from "bcrypt";
import {
    UserSignUpRequest,
    UserSignUpResponse,
    SocialAdditionalInfoRequest,
    SocialAdditionalInfoResponse,
} from "../dtos/user.dto.js";
import {
    addUser,
    getUser,
    getUserPreferencesByUserId,
    setPreference,
} from "../repositories/user.repository.js";
import {
    DuplicateUserEmailError,
    HashingPassword,
} from "../../../common/errors/error.js";
import { prisma } from "../../../db.config.js"; // Prisma 객체 직접 제어

/**
 * 일반 이메일 회원가입 비즈니스 로직 (기존 코드 유지)
 */
export const userSignUp = async (
    data: UserSignUpRequest,
): Promise<UserSignUpResponse> => {
    const hn = 10;

    const h_password = await bcrypt.hash(data.password, hn);
    if (h_password == null) {
        throw new HashingPassword(
            "비밀번호 암호화 중 오류가 발생하였습니다.",
            data,
        );
    }

    // 1. 유저 정보 저장 (addUser 내부의 findFirst 로직 실행)
    const joinUserId = await addUser({
        ...data,
        password: h_password,
        birth: new Date(data.birth),
    });

    // 여기서 null이 반환되면 바로 에러를 던져서 아래 로직을 실행하지 못하게 함
    if (joinUserId === null) {
        throw new DuplicateUserEmailError("이미 존재하는 이메일입니다.", data);
    }

    // 2. 선호 카테고리 매핑
    const uniquePreferences = [...new Set(data.preferences)];
    for (const preferenceId of uniquePreferences) {
        await setPreference(joinUserId, preferenceId);
    }

    // 3. 결과 반환을 위한 데이터 조회
    const userId = joinUserId;
    const preferences = (await getUserPreferencesByUserId(joinUserId)).map(
        (p) => p.foodCategory?.name,
    );

    return <UserSignUpResponse>{ userId, preferences };
};

// ===================================================
// 🔥 구글 소셜 회원 가입자 추가 정보 등록 (요청사항 반영)
// ===================================================
/**
 * 구글 소셜 로그인을 통해 1차 생성된 유저의 필수 프로필(이름, 닉네임, 메일, 전화번호, 생일) 및 선호 카테고리를 저장합니다.
 */
export const socialAdditionalInfo = async (
    data: SocialAdditionalInfoRequest,
): Promise<SocialAdditionalInfoResponse> => {
    // 1. 레포지토리의 getUser 메서드를 통해 대상 유저 확인 (없으면 404 에러 격발)
    const user = await getUser(data.userId);

    // 2. 요청값에 이름, 닉네임, 메일 정보가 새로 들어왔다면 업데이트 객체에 포함시킴
    const updateData: any = {
        gender: data.gender,
        birth: new Date(data.birth),
        address: data.address ?? null,
        detailAddress: data.detailAddress ?? null,
        phoneNumber: data.phoneNumber,
    };

    if (data.name) updateData.name = data.name;
    if (data.nickname) updateData.nickname = data.nickname;
    if (data.email) updateData.email = data.email;

    // 3. 데이터베이스 정보 최종 업데이트 수행
    const updatedUser = await prisma.user.update({
        where: { id: data.userId },
        data: updateData,
    });

    // 4. 음식 선호 카테고리 매핑 (중복 제거 후 순회 저장)
    const uniquePreferences = [...new Set(data.preferences)];
    for (const preferenceId of uniquePreferences) {
        await setPreference(data.userId, preferenceId);
    }

    // 5. 조인(JOIN) 결과 테이블을 조회하여 등록 완료된 카테고리명(배열) 추출
    const userPrefRows = await getUserPreferencesByUserId(data.userId);
    const preferenceNames = userPrefRows
        .map((p) => p.foodCategory?.name)
        .filter(Boolean) as string[];

    // 6. 원본 코드와 일관성을 맞춘 타입 캐스팅 변환 형식으로 최종 반환
    return <SocialAdditionalInfoResponse>{
        userId: updatedUser.id,
        name: updatedUser.name,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        preferences: preferenceNames,
        message:
            "소셜 연동 사용자의 필수 추가 회원정보 등록 처리가 정상 완료되었습니다.",
    };
};
