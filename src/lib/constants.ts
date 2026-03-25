/**
 * 2025年入居時の住宅ローン控除ルール
 * 控除率: 0.7%
 */
export const MORTGAGE_DEDUCTION_CONFIG = {
    RATE: 0.007,
    PERIOD_NEW: 13,
    PERIOD_USED: 10,

    // 借入限度額（2025年入居）
    LIMITS: {
        NEW: {
            CHILD_REARING_OR_YOUNG: {
                LONG_LIFE: 5000,
                ZEH: 4500,
                ENERGY_SAVE: 4000,
                STANDARD: 0, // 2024年以降建築確認の一般住宅は原則対象外
            },
            STANDARD: {
                LONG_LIFE: 4500,
                ZEH: 3500,
                ENERGY_SAVE: 3000,
                STANDARD: 0,
            }
        },
        USED: {
            ALL: {
                LONG_LIFE: 3000, // ZEH、省エネ含む
                ZEH: 3000,
                ENERGY_SAVE: 3000,
                STANDARD: 2000,
            }
        }
    }
};

/**
 * 諸費用の概算
 */
export const FEE_CONFIG = {
    BROKERAGE_FEE_RATE: 0.03, // 3%
    BROKERAGE_FEE_FIXED: 60000, // 6万円
    REGISTRATION_FEE_RATE: 0.007, // 登記費用目安（登録免許税含め0.5-1%程度）
    LOAN_FEE_RATE: 0.022, // 融資手数料（定率2.2%）
};

/**
 * 税・社会保険の簡易計算用パラメータ（概算）
 */
export const TAX_CONFIG = {
    INCOME_TAX_RATE: 0.1, // 簡易的な実効税率（所得によるが10%程度と仮定）
    RESIDENT_TAX_RATE: 0.1, // 住民税 10%
    SOCIAL_INSURANCE_RATE: 0.15, // 社会保険料 15%
};

/**
 * 住宅プランの名称ラベル
 */
export const HOUSING_PLAN_LABELS: Record<string, string> = {
    'NEW_CONDO': '新築マンション',
    'USED_CONDO': '中古マンション',
    'NEW_HOUSE': '新築戸建て',
    'USED_HOUSE': '中古戸建て',
    'RENT': '賃貸住まい'
};
