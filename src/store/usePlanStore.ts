import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SimulationParams, YearlyResult, HousingPlanType, UserBaseParams, LifeEvent } from '../lib/types';
import { runSimulation, calculateInitialFees } from '../lib/engine';
import { HOUSING_PLAN_LABELS } from '../lib/constants';

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
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;

    // Actions
    updateUserParams: (params: Partial<UserBaseParams>) => void;
    updatePlanParams: (planId: string, params: Partial<SimulationParams>) => void;
    togglePlanVisibility: (planId: string) => void;
    addPlan: (type: HousingPlanType, name: string) => void;
    removePlan: (planId: string) => void;
    recalculateResults: () => void;
    renamePlan: (planId: string, name: string) => void;

    // Plan-specific events
    addLifeEvent: (planId: string, event: Omit<LifeEvent, 'id'>) => void;
    removeLifeEvent: (planId: string, eventId: string) => void;
    updateLifeEvent: (planId: string, eventId: string, event: Partial<LifeEvent>) => void;

    // Common events (Shared)
    addCommonEvent: (event: Omit<LifeEvent, 'id'>) => void;
    removeCommonEvent: (eventId: string) => void;
    updateCommonEvent: (eventId: string, event: Partial<LifeEvent>) => void;

    // Import
    importData: (data: { userParams: UserBaseParams, plans: { name: string, params: SimulationParams }[] }) => void;
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
    baseLivingExpenses: 15,
    commonEvents: [],
};

const createDefaultPlanParams = (type: HousingPlanType, userParams: UserBaseParams): SimulationParams => {
    const params: SimulationParams = {
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
        repairReserveStepUpRate: 15,
        fixedAssetTax: 15,
        insuranceFee: 2,
        landValue: 1600,
        buildingValue: 2400,
        buildingDepreciationYears: 22,
        monthlyRent: 12,
        renewalFeeRate: 1,
        events: [],
    };

    // 初期費用をライフイベントとして追加
    const initialFee = calculateInitialFees(params);
    if (initialFee > 0) {
        params.events.push({
            id: 'initial-purchase-fee',
            year: userParams.currentAge,
            label: type === 'RENT' ? '賃貸初期費用' : '購入時諸費用',
            cost: Math.round(initialFee),
        });
    }

    return params;
};

export const usePlanStore = create<PlanStore>()(
    persist(
        (set, get) => ({
            userParams: DEFAULT_USER_PARAMS,
            plans: [
                (() => {
                    const params = createDefaultPlanParams('NEW_HOUSE', DEFAULT_USER_PARAMS);
                    return {
                        id: 'plan-1',
                        name: HOUSING_PLAN_LABELS['NEW_HOUSE'],
                        params: params,
                        results: runSimulation(params, 2024),
                        isVisible: true,
                    };
                })(),
                (() => {
                    const params = createDefaultPlanParams('RENT', DEFAULT_USER_PARAMS);
                    return {
                        id: 'plan-2',
                        name: HOUSING_PLAN_LABELS['RENT'],
                        params: params,
                        results: runSimulation(params, 2024),
                        isVisible: true,
                    };
                })()
            ],
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),

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
                const defaultName = HOUSING_PLAN_LABELS[type] || '新しいプラン';
                const newPlan: PlanState = {
                    id: `plan-${Date.now()}`,
                    name: name || defaultName,
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
                        // 1. 個別イベントのみを抽出（以前に混入した共通イベントがあれば確実に除外）
                        const individualEvents = (p.params.events || []).filter(e => !e.id.startsWith('common-event-'));

                        // 2. ストアに保存するパラメータには「個別イベントのみ」を保持させる
                        const updatedParams: SimulationParams = {
                            ...p.params,
                            ...userParams,
                            events: individualEvents,
                            commonEvents: userParams.commonEvents || [],
                        };

                        return {
                            ...p,
                            params: updatedParams,
                            // エンジン側で commonEvents を個別に扱うようにしたので、そのまま渡す
                            results: runSimulation(updatedParams, 2024),
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
                            params: { ...p.params, events: [...(p.params.events || []), newEvent] },
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
                            params: { ...p.params, events: (p.params.events || []).filter((e) => e.id !== eventId) },
                        };
                    }),
                }));
                get().recalculateResults();
            },

            updateLifeEvent: (planId, eventId, updatedEvent) => {
                set((state) => ({
                    plans: state.plans.map((p) => {
                        if (p.id !== planId) return p;
                        return {
                            ...p,
                            params: {
                                ...p.params,
                                events: (p.params.events || []).map((e) =>
                                    e.id === eventId ? { ...e, ...updatedEvent } : e
                                ),
                            },
                        };
                    }),
                }));
                get().recalculateResults();
            },

            // Common events
            addCommonEvent: (event) => {
                const newEvent: LifeEvent = { ...event, id: `common-event-${Date.now()}` };
                set((state) => ({
                    userParams: {
                        ...state.userParams,
                        commonEvents: [...(state.userParams.commonEvents || []), newEvent]
                    }
                }));
                get().recalculateResults();
            },

            removeCommonEvent: (eventId) => {
                set((state) => ({
                    userParams: {
                        ...state.userParams,
                        commonEvents: (state.userParams.commonEvents || []).filter(e => e.id !== eventId)
                    }
                }));
                get().recalculateResults();
            },

            updateCommonEvent: (eventId, updatedEvent) => {
                set((state) => ({
                    userParams: {
                        ...state.userParams,
                        commonEvents: (state.userParams.commonEvents || []).map(e =>
                            e.id === eventId ? { ...e, ...updatedEvent } : e
                        )
                    }
                }));
                get().recalculateResults();
            },

            importData: (data) => {
                const newPlans: PlanState[] = data.plans.map((p, idx) => ({
                    id: `imported-${Date.now()}-${idx}`,
                    name: p.name,
                    params: p.params,
                    results: runSimulation(p.params, 2024),
                    isVisible: true,
                }));

                set({
                    userParams: data.userParams,
                    plans: newPlans
                });
            },
        }),
        {
            name: 'lifeplan-simulator-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.recalculateResults();
                    state.setHasHydrated(true);
                }
            }
        }
    )
);
