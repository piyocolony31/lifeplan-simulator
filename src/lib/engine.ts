import { SimulationParams, YearlyResult } from './types';
import { MORTGAGE_DEDUCTION_CONFIG, TAX_CONFIG } from './constants';

/**
 * 元利均等返済の毎月返済額を計算
 */
export function calculateMonthlyMortgage(principal: number, annualRate: number, years: number): number {
    if (annualRate === 0) return (principal / (years * 12));
    const r = annualRate / 100 / 12;
    const n = years * 12;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calculateInitialFees(params: SimulationParams): number {
    if (params.planType === 'RENT') {
        // 敷金(2) + 礼金(1) + 仲介(1) + 火災保険・鍵交換(0.5) 程度と仮定
        return params.monthlyRent * 4.5;
    }

    if (params.planType === 'NEW_CONDO' || params.planType === 'USED_CONDO' || params.planType === 'NEW_HOUSE' || params.planType === 'USED_HOUSE') {
        // 全ての住宅購入（新築・中古問わず）のデフォルトを一律10%とする
        return params.propertyPrice * 0.10;
    }
    return 0;
}

/**
 * 住宅ローン控除額の計算
 */
export function calculateMortgageDeduction(
    balance: number,
    yearIdx: number,
    params: SimulationParams,
    paidTax: number
): number {
    const isUsed = params.planType === 'USED_HOUSE' || params.planType === 'USED_CONDO';
    const period = isUsed ? MORTGAGE_DEDUCTION_CONFIG.PERIOD_USED : MORTGAGE_DEDUCTION_CONFIG.PERIOD_NEW;

    if (yearIdx >= period || balance <= 0) return 0;

    // 限度額の取得
    let limit = 0;
    if (isUsed) {
        limit = params.propertyCategory === 'STANDARD'
            ? MORTGAGE_DEDUCTION_CONFIG.LIMITS.USED.ALL.STANDARD
            : MORTGAGE_DEDUCTION_CONFIG.LIMITS.USED.ALL.ZEH; // 長期・ZEH・省エネは一律3000万
    } else {
        const categoryLimits = params.householdType === 'CHILD_REARING_OR_YOUNG'
            ? MORTGAGE_DEDUCTION_CONFIG.LIMITS.NEW.CHILD_REARING_OR_YOUNG
            : MORTGAGE_DEDUCTION_CONFIG.LIMITS.NEW.STANDARD;
        limit = (categoryLimits as any)[params.propertyCategory] || 0;
    }

    const baseAmount = Math.min(balance, limit);
    const deduction = baseAmount * MORTGAGE_DEDUCTION_CONFIG.RATE;

    // 所得税＋住民税（上限あり）を考慮
    // 住民税からの控除は「所得税の課税総所得金額等の5%（最高9.75万円）」などの制限があるが、
    // 簡易的に「支払った税額」を上限とする
    return Math.min(deduction, paidTax);
}

/**
 * メインシミュレーション実行
 */
export function runSimulation(params: SimulationParams): YearlyResult[] {
    const results: YearlyResult[] = [];
    let currentAssets = params.initialAssets - params.downPayment;
    let mortgageBalance = params.loanAmount;
    const monthlyMortgage = calculateMonthlyMortgage(params.loanAmount, params.loanInterestRate, params.loanPeriod);

    const startYear = new Date().getFullYear();
    const totalYears = params.deathAge - params.currentAge;

    if (totalYears < 0) return [];

    for (let i = 0; i <= totalYears; i++) {
        const year = startYear + i;
        const age = params.currentAge + i;
        const isRetired = age >= params.retireAge;

        // 1. 収入と税金
        // 定年後は200万（年金）と仮定。現役時代は給与上昇率を考慮
        const income = isRetired ? 200 : (params.personalIncome + (params.hasSpouse ? params.spouseIncome : 0)) * Math.pow(1 + params.salaryGrowthRate / 100, i);
        const incomeTax = income * TAX_CONFIG.INCOME_TAX_RATE;
        const residentTax = income * TAX_CONFIG.RESIDENT_TAX_RATE;
        const socialInsurance = income * TAX_CONFIG.SOCIAL_INSURANCE_RATE;
        const disposableIncome = income - (incomeTax + residentTax + socialInsurance);

        // 2. 支出
        // 基本生活費（ユーザー入力）＋ インフレ率
        const yearlyBaseLivingExpenses = (params.baseLivingExpenses * 12) * Math.pow(1 + params.inflationRate / 100, i);

        let housingExpenses = 0;
        const currentMaintenanceFee = params.managementFee;
        let currentRepairReserve = params.repairReserve;

        if (params.planType === 'RENT') {
            housingExpenses = params.monthlyRent * 12;
            if (i > 0 && i % 2 === 0) {
                housingExpenses += params.monthlyRent * params.renewalFeeRate;
            }
        } else {
            // 修繕積立金の段階的上昇（5年ごとに stepUpRate 分上昇と仮定）
            const stepPeriods = Math.floor(i / 5);
            currentRepairReserve = params.repairReserve * Math.pow(1 + params.repairReserveStepUpRate / 100, stepPeriods);

            const yearlyMortgage = i < params.loanPeriod ? monthlyMortgage * 12 : 0;
            const maintenance = (currentMaintenanceFee + currentRepairReserve + params.fixedAssetTax + params.insuranceFee);
            housingExpenses = yearlyMortgage + maintenance;
        }

        // ライフイベント支出（一時支出）
        const eventCost = params.events
            .filter(e => e.year === year || (e.year === age && e.year < 200)) // 年指定か年齢指定か（簡易的に100以下なら年齢とみなす）
            .reduce((sum, e) => sum + e.cost, 0);

        const totalExpenses = yearlyBaseLivingExpenses + housingExpenses + eventCost;

        // 3. ローン控除
        const mortgageDeduction = calculateMortgageDeduction(mortgageBalance, i, params, incomeTax + residentTax);

        // 4. 運用益
        const investmentReturn = currentAssets > 0 ? currentAssets * (params.investmentReturnRate / 100) : 0;

        // 5. 資産価値（時価評価）
        // 建物は耐用年数で直線減価、土地は維持（インフレ考慮せず保守的評価）
        const buildingValue = Math.max(0, params.buildingValue * (1 - i / params.buildingDepreciationYears));
        const propertyValue = params.landValue + buildingValue;

        // 6. 資産残高更新
        const netCashFlow = (disposableIncome - totalExpenses) + mortgageDeduction + investmentReturn;
        currentAssets += netCashFlow;

        // 純資産 = 金融資産 + 物件価値 - ローン残高
        const netWorth = currentAssets + propertyValue - mortgageBalance;

        // ローン残高更新
        if (mortgageBalance > 0) {
            const yearlyPrincipalRepayment = (monthlyMortgage * 12) - (mortgageBalance * (params.loanInterestRate / 100));
            mortgageBalance -= Math.max(0, yearlyPrincipalRepayment);
            if (mortgageBalance < 0) mortgageBalance = 0;
        }

        results.push({
            year,
            age,
            income,
            tax: incomeTax + residentTax,
            socialInsurance,
            disposableIncome,
            livingExpenses: yearlyBaseLivingExpenses,
            housingExpenses,

            // 内訳
            mortgagePayment: params.planType !== 'RENT' ? (i < params.loanPeriod ? monthlyMortgage * 12 : 0) : 0,
            maintenanceFee: params.planType !== 'RENT' ? currentMaintenanceFee : 0,
            repairReserve: params.planType !== 'RENT' ? currentRepairReserve : 0,
            fixedAssetTax: params.planType !== 'RENT' ? params.fixedAssetTax : 0,
            insuranceFee: params.planType !== 'RENT' ? params.insuranceFee : 0,
            rent: params.planType === 'RENT' ? params.monthlyRent * 12 : 0,
            renewalFee: params.planType === 'RENT' && i > 0 && i % 2 === 0 ? params.monthlyRent * params.renewalFeeRate : 0,

            educationExpenses: 0,
            otherExpenses: eventCost,
            mortgageBalance,
            mortgageDeduction,
            investmentReturn,
            netCashFlow,
            totalAssets: currentAssets,
            propertyValue,
            netWorth,
        });
    }

    return results;
}
