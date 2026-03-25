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
 * 住宅ローン控除額の計算（詳細版）
 */
export function calculateMortgageDeductionDetail(
    balance: number,
    yearIdx: number,
    params: SimulationParams,
    incomeTax: number,
    residentTax: number
): number {
    const isUsed = params.planType === 'USED_HOUSE' || params.planType === 'USED_CONDO';
    const period = isUsed ? MORTGAGE_DEDUCTION_CONFIG.PERIOD_USED : MORTGAGE_DEDUCTION_CONFIG.PERIOD_NEW;

    if (yearIdx >= period || balance <= 0) return 0;

    // 限度額の取得
    let limit = 0;
    if (isUsed) {
        limit = params.propertyCategory === 'STANDARD'
            ? MORTGAGE_DEDUCTION_CONFIG.LIMITS.USED.ALL.STANDARD
            : MORTGAGE_DEDUCTION_CONFIG.LIMITS.USED.ALL.ZEH; 
    } else {
        const categoryLimits = params.householdType === 'CHILD_REARING_OR_YOUNG'
            ? MORTGAGE_DEDUCTION_CONFIG.LIMITS.NEW.CHILD_REARING_OR_YOUNG
            : MORTGAGE_DEDUCTION_CONFIG.LIMITS.NEW.STANDARD;
        limit = (categoryLimits as any)[params.propertyCategory] || 0;
    }

    const baseAmount = Math.min(balance, limit);
    const deductionPossible = baseAmount * MORTGAGE_DEDUCTION_CONFIG.RATE;

    // 1. 所得税から控除
    const deductionFromIncomeTax = Math.min(deductionPossible, incomeTax);
    
    // 2. 所得税から引ききれなかった分を住民税から控除（上限 9.75万円）
    const remainingDeduction = deductionPossible - deductionFromIncomeTax;
    const deductionFromResidentTax = Math.min(
        remainingDeduction, 
        residentTax, 
        MORTGAGE_DEDUCTION_CONFIG.RESIDENT_TAX_DEDUCTION_LIMIT
    );

    return deductionFromIncomeTax + deductionFromResidentTax;
}

/**
 * メインシミュレーション実行
 */
export function runSimulation(params: SimulationParams, startYear: number = new Date().getFullYear()): YearlyResult[] {
    const results: YearlyResult[] = [];
    const isRent = params.planType === 'RENT';
    
    // 賃貸の場合は頭金やローン借入を資産から差し引かない/加えない
    let currentAssets = params.initialAssets - (isRent ? 0 : params.downPayment);
    let mortgageBalance = isRent ? 0 : params.loanAmount;
    const monthlyMortgage = isRent ? 0 : calculateMonthlyMortgage(params.loanAmount, params.loanInterestRate, params.loanPeriod);

    const totalYears = params.deathAge - params.currentAge;

    if (totalYears < 0) return [];

    for (let i = 0; i <= totalYears; i++) {
        const year = startYear + i;
        const age = params.currentAge + i;
        const isRetired = age >= params.retireAge;

        // 1. 収入と税金
        // 額面年収
        const grossIncome = isRetired ? 200 : (params.personalIncome + (params.hasSpouse ? params.spouseIncome : 0)) * Math.pow(1 + params.salaryGrowthRate / 100, i);
        
        // 社会保険料（額面にかかる）
        const socialInsurance = grossIncome * TAX_CONFIG.SOCIAL_INSURANCE_RATE;
        
        // 所得税・住民税（社会保険料控除後をベースにする）
        const taxableIncomeBase = Math.max(0, grossIncome - socialInsurance);
        const incomeTax = taxableIncomeBase * TAX_CONFIG.INCOME_TAX_RATE;
        const residentTax = taxableIncomeBase * TAX_CONFIG.RESIDENT_TAX_RATE;
        
        const disposableIncomeBeforeDeduction = grossIncome - (socialInsurance + incomeTax + residentTax);

        // 2. 支出
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
            const stepPeriods = Math.floor(i / 5);
            currentRepairReserve = params.repairReserve * Math.pow(1 + params.repairReserveStepUpRate / 100, stepPeriods);

            const yearlyMortgage = i < params.loanPeriod ? monthlyMortgage * 12 : 0;
            const maintenance = (currentMaintenanceFee + currentRepairReserve + params.fixedAssetTax + params.insuranceFee);
            housingExpenses = yearlyMortgage + maintenance;
        }

        const individualEventCost = params.events
            .filter(e => !e.id.startsWith('common-event-'))
            .filter(e => e.year === year || (e.year === age && e.year < 200))
            .reduce((sum, e) => sum + e.cost, 0);

        const commonEventCost = (params.commonEvents || [])
            .filter(e => e.year === year || (e.year === age && e.year < 200))
            .reduce((sum, e) => sum + e.cost, 0);

        const totalExpenses = yearlyBaseLivingExpenses + housingExpenses + individualEventCost + commonEventCost;

        // 3. 住宅ローン控除
        const mortgageDeduction = params.planType === 'RENT' 
            ? 0 
            : calculateMortgageDeductionDetail(mortgageBalance, i, params, incomeTax, residentTax);

        // 4. 運用益（年初残高と今年収支の平均で計算）
        const annualSurplus = disposableIncomeBeforeDeduction + mortgageDeduction - totalExpenses;
        const investmentReturn = (currentAssets + annualSurplus / 2) * (params.investmentReturnRate / 100);

        // 5. 資産価値
        const buildingValue = Math.max(0, params.buildingValue * (1 - i / params.buildingDepreciationYears));
        const propertyValue = params.planType === 'RENT' ? 0 : (params.landValue + buildingValue);

        // 6. 資産残高更新
        const netCashFlow = annualSurplus + investmentReturn;
        currentAssets += netCashFlow;

        // 純資産
        const netWorth = currentAssets + propertyValue - (params.planType === 'RENT' ? 0 : mortgageBalance);

        // ローン残高更新
        if (params.planType !== 'RENT' && mortgageBalance > 0) {
            const yearlyPrincipalRepayment = (monthlyMortgage * 12) - (mortgageBalance * (params.loanInterestRate / 100));
            mortgageBalance -= Math.max(0, yearlyPrincipalRepayment);
            if (mortgageBalance < 0) mortgageBalance = 0;
        }

        results.push({
            year,
            age,
            income: grossIncome,
            tax: incomeTax + residentTax,
            socialInsurance,
            disposableIncome: disposableIncomeBeforeDeduction + mortgageDeduction,
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
            otherExpenses: individualEventCost,
            commonEventExpenses: commonEventCost,
            mortgageBalance: params.planType === 'RENT' ? 0 : mortgageBalance,
            mortgageDeduction: params.planType === 'RENT' ? 0 : mortgageDeduction,
            investmentReturn,
            netCashFlow,
            totalAssets: currentAssets,
            propertyValue,
            netWorth,
        });
    }

    return results;
}
