import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a interface para todos os dados do formulário
interface SetupData {
  setupTitle: string; controlType: string; car: string; track: string; condition: string; notes: string; frontWing: number; rearWing: number; differentialOnThrottle: number; differentialOffThrottle: number; engineBraking: number; frontCamber: number; rearCamber: number; frontToe: number; rearToe: number; frontSuspension: number; rearSuspension: number; frontAntiRollBar: number; rearAntiRollBar: number; frontRideHeight: number; rearRideHeight: number; brakePressure: number; brakeBalance: number; frontRightTirePressure: number; frontLeftTirePressure: number; rearRightTirePressure: number; rearLeftTirePressure: number;
}

// Valores iniciais para um novo setup
const initialState: SetupData = {
  setupTitle: '', controlType: '', car: '', track: '', condition: '', notes: '', frontWing: 25, rearWing: 25, differentialOnThrottle: 55, differentialOffThrottle: 55, engineBraking: 50, frontCamber: -3.0, rearCamber: -1.5, frontToe: 0.25, rearToe: 0.25, frontSuspension: 21, rearSuspension: 21, frontAntiRollBar: 11, rearAntiRollBar: 11, frontRideHeight: 25, rearRideHeight: 70, brakePressure: 90, brakeBalance: 60, frontRightTirePressure: 26.0, frontLeftTirePressure: 26.0, rearRightTirePressure: 23.5, rearLeftTirePressure: 23.5,
};

// Define a interface do store, incluindo os dados e as ações
interface SetupState {
  data: SetupData;
  updateField: (field: keyof SetupData, value: string | number) => void;
  loadExistingSetup: (setupId: string) => Promise<void>;
  reset: () => void;
}

// Cria o hook do store
export const useSetupStore = create<SetupState>((set) => ({
  data: initialState,
  
  // Ação para atualizar qualquer campo do formulário
  updateField: (field, value) => set((state) => ({
    data: { ...state.data, [field]: value }
  })),

  // Ação para carregar um setup existente do AsyncStorage
  loadExistingSetup: async (setupId) => {
    try {
      const storedSetups = await AsyncStorage.getItem('setups');
      if (storedSetups) {
        const setups = JSON.parse(storedSetups);
        const setupToEdit = setups.find((s: any) => s.id === setupId);
        if (setupToEdit) {
          set({ data: setupToEdit });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar setup no store:', error);
    }
  },

  // Ação para resetar o formulário para o estado inicial
  reset: () => set({ data: initialState }),
}));