import { create } from 'zustand';
import { SimulationParams, YearlyResult, HousingPlanType, PropertyCategory, HouseholdType, LifeEvent, UserBaseParams } from '../lib/types';
import { runSimulation } from '../lib/engine';

interface PlanState {
    id: string;
    name: string;
    params: SimulationParams;
    results: YearlyResult[];
    isVisible: boolean;
}

interface PlanStore {
    userParams: UserBaseParams;
    plans: PlanState[];

    // Actions
    updateUserParams: (params: Partial<UserBaseParams>) => void;
    updatePlanParams: (planId: string, params: Partial<SimulationParams>) => void;
    togglePlanVisibility: (planId: string) => void;
    addPlan: (type: HousingPlanType, name: string) => void;
    removePlan: (planId: string) => void;
    recalculateResults: () => void;
    renamePlan: (planId: string, name: string) => void;
    addLifeEvent: (planId: string, event: Omit<LifeEvent, 'id'>) => void;
    removeLifeEvent: (planId: string, eventId: string) => void;
}

const DEFAULT_USER_PARAMS: UserBaseParams = {
    currentAge: 35,
    retireAge: 65,
    deathAge: 90,
    personalIncome: 600,
    hasSpouse: true,
    spouseIncome: 300,
    salaryGrowthRate: 1.0,
    inflationRate: 1.5,
    investmentReturnRate: 3.0,
    initialAssets: 500,
    baseLivingExpenses: 15, // 月額15万（年間180万）
};

const createDefaultPlanParams = (type: HousingPlanType, userParams: UserBaseParams): SimulationParams => ({
    ...userParams,
    planType: type,
    propertyPrice: 4000,
    downPayment: 500,
    loanAmount: 3500,
    loanInterestRate: 0.7,
    loanPeriod: 35,
    propertyCategory: 'ZEH',
    householdType: 'CHILD_REARING_OR_YOUNG',
    managementFee: 2,
    repairReserve: 2,
    repairReserveStepUpRate: 15, // 5年ごとに15%上昇など
    fixedAssetTax: 15,
    insuranceFee: 2,
    landValue: 1600, // 4000万の40%と仮定
    buildingValue: 2400, // 4000万の60%と仮定
    buildingDepreciationYears: 22, // 木造標準
    monthlyRent: 12,
    renewalFeeRate: 1,
    events: [],
});

export const usePlanStore = create<PlanStore>((set, get) => ({
    userParams: DEFAULT_USER_PARAMS,
    plans: [
        {
            id: 'plan-1',
            name: '新築戸建',
            params: createDefaultPlanParams('NEW_HOUSE', DEFAULT_USER_PARAMS),
            results: runSimulation(createDefaultPlanParams('NEW_HOUSE', DEFAULT_USER_PARAMS)),
            isVisible: true,
        },
        {
            id: 'plan-2',
            name: '賃貸住まい',
            params: createDefaultPlanParams('RENT', DEFAULT_USER_PARAMS),
            results: runSimulation(createDefaultPlanParams('RENT', DEFAULT_USER_PARAMS)),
            isVisible: true,
        }
    ],

    updateUserParams: (newParams) => {
        set((state) => ({
            userParams: { ...state.userParams, ...newParams },
        }));
        get().recalculateResults();
    },

    updatePlanParams: (planId, newParams) => {
        set((state) => ({
            plans: state.plans.map((p) =>
                p.id === planId ? { ...p, params: { ...p.params, ...newParams } } : p
            ),
        }));
        get().recalculateResults();
    },

    togglePlanVisibility: (planId) => {
        set((state) => ({
            plans: state.plans.map((p) =>
                p.id === planId ? { ...p, isVisible: !p.isVisible } : p
            ),
        }));
    },

    addPlan: (type, name) => {
        const { userParams } = get();
        const newParams = createDefaultPlanParams(type, userParams);
        const newPlan: PlanState = {
            id: `plan-${Date.now()}`,
            name,
            params: newParams,
            results: runSimulation(newParams),
            isVisible: true,
        };
        set((state) => ({ plans: [...state.plans, newPlan] }));
    },

    removePlan: (planId) => {
        set((state) => ({ plans: state.plans.filter((p) => p.id !== planId) }));
    },

    recalculateResults: () => {
        const { userParams, plans } = get();
        set({
            plans: plans.map((p) => {
                // ユーザー共通パラメータを各プランのパラメータにマージ
                const updatedParams: SimulationParams = {
                    ...p.params,
                    ...userParams,
                };
                return {
                    ...p,
                    params: updatedParams,
                    results: runSimulation(updatedParams),
                };
            }),
        });
    },
    renamePlan: (planId, name) => {
        set((state) => ({
            plans: state.plans.map((p) => (p.id === planId ? { ...p, name } : p)),
        }));
    },

    addLifeEvent: (planId, event) => {
        set((state) => ({
            plans: state.plans.map((p) => {
                if (p.id !== planId) return p;
                const newEvent: LifeEvent = { ...event, id: `event-${Date.now()}` };
                return {
                    ...p,
                    params: { ...p.params, events: [...p.params.events, newEvent] },
                };
            }),
        }));
        get().recalculateResults();
    },

    removeLifeEvent: (planId, eventId) => {
        set((state) => ({
            plans: state.plans.map((p) => {
                if (p.id !== planId) return p;
                return {
                    ...p,
                    params: { ...p.params, events: p.params.events.filter((e) => e.id !== eventId) },
                };
            }),
        }));
        get().recalculateResults();
    },
}));
