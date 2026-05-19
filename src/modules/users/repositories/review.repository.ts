import { prisma } from "../../../db.config.js";

// 1. DB에 리뷰 데이터 삽입
export const addReview = async (
    restaurantId: number,
    data: any,
): Promise<number> => {
    // prisma.review.create를 사용하여 데이터 삽입
    const result = await prisma.review.create({
        data: {
            userId: data.userId,
            restaurantId: restaurantId, // DB 컬럼명이 storeId인지 restaurantId인지 확인 필요
            body: data.body, // 기존 body 필드 매핑
            score: data.score,
        },
    });

    // 생성된 레코드의 id(PK) 반환
    return result.id;
};

// 2. 삽입된 리뷰 상세 조회
export const getReview = async (reviewId: number): Promise<any | null> => {
    // findUnique를 사용하여 단일 레코드 조회
    const review = await prisma.review.findUnique({
        where: {
            id: reviewId,
        },
    });

    // 데이터가 없으면 자동으로 null 반환
    return review;
};
