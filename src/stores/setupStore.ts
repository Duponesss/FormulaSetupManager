import { create } from 'zustand';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, getDocs, getDoc } from 'firebase/firestore';

// Define a interface para todos os dados do formulário
export interface SetupData {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  setupTitle: string;
  controlType: string;
  car: string;
  team: string;
  track: string;
  condition: string;
  notes: string;
  frontWing: number;
  rearWing: number;
  diffAdjustmentOn: number;
  diffAdjustmentOff: number;
  engineBraking: number;
  frontCamber: number;
  rearCamber: number;
  frontToeOut: number;
  rearToeIn: number;
  frontSuspension: number;
  rearSuspension: number;
  frontAntiRollBar: number;
  rearAntiRollBar: number;
  frontRideHeight: number;
  rearRideHeight: number;
  brakePressure: number;
  frontBrakeBias: number;
  frontRightTyrePressure: number;
  frontLeftTyrePressure: number;
  rearRightTyrePressure: number;
  rearLeftTyrePressure: number;
}
// Valores iniciais para um novo setup
const formInitialState: SetupData = {
  setupTitle: '', controlType: '', car: '', team: '', track: '', condition: '', notes: '', 
  frontWing: 25, rearWing: 25, 
  diffAdjustmentOn: 55, diffAdjustmentOff: 55, engineBraking: 50, 
  frontCamber: -3.0, rearCamber: -1.5, frontToeOut: 0.25, rearToeIn: 0.25, 
  frontSuspension: 21, rearSuspension: 21, frontAntiRollBar: 11, rearAntiRollBar: 11, 
  frontRideHeight: 25, rearRideHeight: 70, 
  brakePressure: 90, frontBrakeBias: 60, 
  frontRightTyrePressure: 26.0, frontLeftTyrePressure: 26.0, rearRightTyrePressure: 23.5, rearLeftTyrePressure: 23.5,
};

export interface GameData {
  name: string;
  releaseYear: number;
  teams: { carName: string; teamName: string }[];
  tracks: string[];
  validationRules: any;
}

// Define a interface do store, incluindo os dados e as ações
interface SetupState {
  formData: SetupData;
  updateField: (field: keyof SetupData, value: string | number) => void;
  loadFormWithExistingSetup: (setupId: string) => void;
  resetForm: () => void;

  allSetups: SetupData[];
  loadingSetups: boolean;

  // NOVO: estado para a gameData
  gameData: GameData | null;
  loadingGameData: boolean;

  listenToUserSetups: () => (() => void);
  fetchGameData: (gameId: string) => Promise<void>;
  saveSetup: (setupData: SetupData) => Promise<void>;
  deleteSetup: (setupId: string) => Promise<void>;
}

let unsubscribeFromSetups: (() => void) | null = null;

// Cria o hook do store
export const useSetupStore = create<SetupState>((set, get) => ({
  formData: formInitialState,
  allSetups: [],
  gameData: null,
  loadingSetups: true,
  loadingGameData: true,

  updateField: (field, value) => set(state => ({ formData: { ...state.formData, [field]: value } })),
  loadFormWithExistingSetup: (setupId) => {
    const setupToEdit = get().allSetups.find(s => s.id === setupId);
    if (setupToEdit) set({ formData: setupToEdit });
  },
  resetForm: () => set({ formData: formInitialState }),
  listenToUserSetups: () => {
    // Cancela qualquer "ouvinte" anterior para evitar duplicados
    if (unsubscribeFromSetups) {
      unsubscribeFromSetups();
    }

    const user = auth.currentUser;
    // Se não houver utilizador logado, limpa a lista de setups e para a execução.
    if (!user) {
      set({ allSetups: [], loadingSetups: false });
      return () => { }; // Retorna uma função de limpeza vazia
    }

    // Cria a consulta: busca na coleção 'setups' onde o campo 'userId' 
    // é igual ao ID do utilizador atualmente logado.
    const q = query(collection(db, "setups"), where("userId", "==", user.uid));

    // Inicia o "ouvinte" em tempo real do Firestore.
    // Esta função será chamada imediatamente com os dados atuais e depois
    // sempre que os dados no servidor mudarem.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const setups: SetupData[] = [];
      querySnapshot.forEach((doc) => {
        // Adiciona o ID do documento da coleção ao objeto de dados do setup
        setups.push({ id: doc.id, ...doc.data() } as SetupData);
      });
      // Atualiza o estado no store com a nova lista de setups
      set({ allSetups: setups, loadingSetups: false });
    }, (error) => {
      console.error("Erro ao ouvir setups em tempo real:", error);
      set({ loadingSetups: false });
    });

    // Guarda a função de unsubscribe para poder ser chamada mais tarde (ex: no logout)
    unsubscribeFromSetups = unsubscribe;
    return unsubscribe; // Retorna a função de limpeza
  },

  fetchGameData: async (gameId) => {
    if (get().gameData) return; // Não busca se já tiver os dados
    try {
      set({ loadingGameData: true });
      const docRef = doc(db, "gamedata", gameId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        set({ gameData: docSnap.data() as GameData });
      } else {
        console.warn(`GameData para ${gameId} não encontrado.`);
      }
    } catch (error) {
      console.error("Erro ao buscar gamedata:", error);
    } finally {
      set({ loadingGameData: false });
    }
  },

  saveSetup: async (setupData) => {const user = auth.currentUser;
    if (!user) throw new Error("Utilizador não autenticado para salvar o setup.");
    
    // Remove o ID do objeto principal para não o salvar como um campo no documento
    const { id, ...data } = setupData;

    if (id) {
      // ATUALIZAR SETUP EXISTENTE
      const docRef = doc(db, "setups", id);
      await updateDoc(docRef, {
        ...data,
        userId: user.uid, // Garante que o userId está sempre correto
        updatedAt: Timestamp.now(),
      });
    } else {
      // CRIAR NOVO SETUP
      await addDoc(collection(db, "setups"), {
        ...data,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  },
  deleteSetup: async (setupId) => {
    if (!setupId) throw new Error("ID do setup é necessário para a exclusão.");
    
    const docRef = doc(db, "setups", setupId);
    await deleteDoc(docRef);
  },
}));
