/**
 * 住宅プランの種類
 */
export type HousingPlanType = 'RENT' | 'NEW_HOUSE' | 'USED_HOUSE' | 'NEW_CONDO' | 'USED_CONDO';

/**
 * 物件の省エネ・品質区分（住宅ローン控除に影響）
 */
export type PropertyCategory =
  | 'LONG_LIFE'   // 長期優良住宅・低炭素住宅
  | 'ZEH'         // ZEH水準省エネ住宅
  | 'ENERGY_SAVE' // 省エネ基準適合住宅
  | 'STANDARD';    // その他（一般住宅）

/**
 * 世帯属性（住宅ローン控除の上限上乗せに影響）
 */
export type HouseholdType = 'CHILD_REARING_OR_YOUNG' | 'STANDARD';

/**
 * ライフイベント
 */
export interface LifeEvent {
  id: string;
  year: number;
  label: string;
  cost: number; // 一時的な支出
  recurringCost?: number; // 該当年以降の継続的な収支変動（例：転職による年収増）
}

/**
 * シミュレーション入力パラメータの基本情報
 */
export interface UserBaseParams {
  currentAge: number;
  retireAge: number;
  deathAge: number;
  personalIncome: number;
  hasSpouse: boolean;
  spouseIncome: number;
  salaryGrowthRate: number;
  inflationRate: number;
  investmentReturnRate: number;
  initialAssets: number;
  baseLivingExpenses: number; // 月額
}

/**
 * シミュレーション入力パラメータ
 */
export interface SimulationParams extends UserBaseParams {
  // 住宅プラン共通
  planType: HousingPlanType;
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  loanInterestRate: number; // %
  loanPeriod: number;
  propertyCategory: PropertyCategory;
  householdType: HouseholdType;

  // 維持費等
  managementFee: number; // 年額
  repairReserve: number; // 年額
  repairReserveStepUpRate: number; // %（5年ごとの上昇率など）
  fixedAssetTax: number; // 年額
  insuranceFee: number; // 年額

  // 資産価値（出口戦略）
  landValue: number; // 土地価格（非償却）
  buildingValue: number; // 建物価格（償却対象）
  buildingDepreciationYears: number; // 耐用年数

  // 賃貸用
  monthlyRent: number;
  renewalFeeRate: number; // 更新料（1ヶ月分など）

  // ライフイベント
  events: LifeEvent[];
}

/**
 * 年次キャッシュフロー結果
 */
export interface YearlyResult {
  year: number;
  age: number;
  income: number;
  tax: number;
  socialInsurance: number;
  disposableIncome: number;
  livingExpenses: number;
  housingExpenses: number; // 合計住居費

  // 住居費内訳
  mortgagePayment: number;
  maintenanceFee: number;
  repairReserve: number;
  fixedAssetTax: number;
  insuranceFee: number;
  rent: number;
  renewalFee: number;

  educationExpenses: number;
  otherExpenses: number;
  mortgageBalance: number;
  mortgageDeduction: number; // ローン控除額
  investmentReturn: number;
  netCashFlow: number;
  totalAssets: number; // 金融資産
  propertyValue: number; // 物件時価
  netWorth: number; // 純資産 (金融資産 + 物件時価 - ローン残高)
}
