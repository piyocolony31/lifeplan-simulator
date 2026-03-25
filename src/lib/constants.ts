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
                STANDARD: 0, 
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
                LONG_LIFE: 3000,
                ZEH: 3000,
                ENERGY_SAVE: 3000,
                STANDARD: 2000,
            }
        }
    },
    // 住民税からの控除上限（所得税の課税総所得金額等の5% または 9.75万円）
    RESIDENT_TAX_DEDUCTION_LIMIT: 9.75
};

/**
 * 諸費用の概算
 */
export const FEE_CONFIG = {
    BROKERAGE_FEE_RATE: 0.03, // 3%
    BROKERAGE_FEE_FIXED: 60000, // 6万円
    REGISTRATION_FEE_RATE: 0.007,
    LOAN_FEE_RATE: 0.022,
};

/**
 * 税・社会保険の簡易計算用パラメータ（概算）
 */
export const TAX_CONFIG = {
    INCOME_TAX_RATE: 0.08, // 社会保険料控除後の課税所得に対する実効税率（年収600-1000万を想定して調整）
    RESIDENT_TAX_RATE: 0.1, // 住民税 10%
    SOCIAL_INSURANCE_RATE: 0.14, // 厚生年金・健康保険・雇用保険の合計（会社負担除く本人負担分）
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
