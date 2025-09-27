import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a interface para todos os dados do formulário
export interface SetupData {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  setupTitle: string; 
  controlType: string; 
  car: string; 
  track: string; 
  condition: string; 
  notes: string; 
  frontWing: number; 
  rearWing: number; 
  differentialOnThrottle: number; 
  differentialOffThrottle: number; 
  engineBraking: number; 
  frontCamber: number; 
  rearCamber: number; 
  frontToe: number; 
  rearToe: number; 
  frontSuspension: number; 
  rearSuspension: number; 
  frontAntiRollBar: number; 
  rearAntiRollBar: number; 
  frontRideHeight: number; 
  rearRideHeight: number; 
  brakePressure: number; 
  brakeBalance: number; 
  frontRightTirePressure: number; 
  frontLeftTirePressure: number; 
  rearRightTirePressure: number; 
  rearLeftTirePressure: number;
}

// Valores iniciais para um novo setup
const formInitialState: SetupData = {
  setupTitle: '', controlType: '', car: '', track: '', condition: '', notes: '', frontWing: 25, rearWing: 25, differentialOnThrottle: 55, differentialOffThrottle: 55, engineBraking: 50, frontCamber: -3.0, rearCamber: -1.5, frontToe: 0.25, rearToe: 0.25, frontSuspension: 21, rearSuspension: 21, frontAntiRollBar: 11, rearAntiRollBar: 11, frontRideHeight: 25, rearRideHeight: 70, brakePressure: 90, brakeBalance: 60, frontRightTirePressure: 26.0, frontLeftTirePressure: 26.0, rearRightTirePressure: 23.5, rearLeftTirePressure: 23.5,
};

// Define a interface do store, incluindo os dados e as ações
interface SetupState {
  formData: SetupData;
  updateField: (field: keyof SetupData, value: string | number) => void;
  loadExistingSetup: (setupId: string) => Promise<void>;
  resetForm: () => void;
  allSetups: SetupData[];
  loading: boolean;
  activeFilters: { car: string; track: string; condition: string; };
  loadAllSetups: () => Promise<void>;
  deleteSetupById: (setupId: string) => Promise<void>;
  setActiveFilters: (filters: { car: string; track: string; condition: string; }) => void;
  addNewSetup: (newSetup: SetupData) => void;
  updateExistingSetup: (updatedSetup: SetupData) => void;
}

// Cria o hook do store
export const useSetupStore = create<SetupState>((set, get) => ({
  formData: formInitialState,
  updateField: (field, value) => set((state) => ({ formData: { ...state.formData, [field]: value } })),
  loadExistingSetup: async (setupId) => {
    const { allSetups } = get();
    const setupToEdit = allSetups.find((s) => s.id === setupId);
    if (setupToEdit) {
      set({ formData: setupToEdit });
    }
  },
  resetForm: () => set({ formData: formInitialState }),

  allSetups: [],
  loading: true,
  activeFilters: { car: '', track: '', condition: '' },

  loadAllSetups: async () => {
    try {
      set({ loading: true });
      const storedSetups = await AsyncStorage.getItem('setups');
      const setups = storedSetups ? JSON.parse(storedSetups) : [];
      set({ allSetups: setups });
    } catch (error) {
      console.error('Erro ao carregar setups no store:', error);
    } finally {
      set({ loading: false });
    }
  },

  deleteSetupById: async (setupId) => {
    try {
      const currentSetups = get().allSetups.filter((s) => s.id !== setupId);
      await AsyncStorage.setItem('setups', JSON.stringify(currentSetups));
      set({ allSetups: currentSetups });
    } catch (error) {
      console.error('Erro ao deletar setup no store:', error);
    }
  },

  addNewSetup: (newSetup) => {
    set((state) => ({
      allSetups: [...state.allSetups, newSetup],
    }));
  },

  updateExistingSetup: (updatedSetup) => {
    set((state) => ({
      allSetups: state.allSetups.map((setup) =>
        setup.id === updatedSetup.id ? updatedSetup : setup
      ),
    }));
  },
  
  setActiveFilters: (filters) => set({ activeFilters: filters }),
}));