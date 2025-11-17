import { create } from 'zustand';
import { db, auth, storage } from '../services/firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, getDocs, getDoc, writeBatch, documentId, setDoc, limit, orderBy, runTransaction, increment,
  type DocumentSnapshot, startAfter
 } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

// Interface para o perfil do usuário
export interface UserProfile {
  uid: string;
  email: string;
  username: string; 
  profilePictureUrl?: string; 
  gamertagPSN?: string; // PlayStation Network
  gamertagXbox?: string; // Xbox Live
  gamertagPC?: string;   // (ex: Steam, EA ID)
}

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
  isPublic: boolean;
  authorName?: string;      // Para exibir sem buscar na tabela users
  authorPhotoUrl?: string;  // Para exibir avatar na lista
  rating: number;           // Média 0-5
  ratingCount: number;      // Total de votos
  totalDownloads: number;   // Quantas vezes foi copiado
  originalSetupId?: string | null; // Se for cópia, guarda o ID do pai
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
  [key: string]: any; // Permite indexação por string
}

// Interface para uma Pasta
export interface Folder {
  id: string;
  name: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Interface para a entrada na coleção de junção
export interface FolderEntry {
  id: string;
  folderId: string;
  setupId: string;
  ownerId: string;
  addedAt: Timestamp;
}

// Representa um único stint dentro de um plano (máximo 3 por plano)
export interface PlannedStint {
  tyreCompound: "soft" | "medium" | "hard" | "intermediate" | "wet";
  pitStopLap: number; // A volta em que o usuário planeja parar
}

// Representa um Plano de Estratégia completo (A, B ou C)
export interface StrategyPlan {
  planLabel: string; // "Plano A", "Plano B", "Plano C"
  plannedStints: PlannedStint[]; // Array com até 3 stints
  fuelLoad: number; // Carga de combustível em voltas (ex: 35.5)
  totalTime: string; // Tempo total de corrida "MM:SS.mls"
}

export interface Strategy {
  id: string;
  ownerId: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  track: string;
  raceDistance: "5 Laps" | "25%" | "35%" | "50%" | "100%";
  notes: string;
  setupId: string;

  // --- CAMPOS ADICIONADOS ---
  totalRaceLaps?: number; // Número total de voltas da corrida (opcional, pode ser inferido)
  initialAvailableTyres: { // Pneus disponíveis NO INÍCIO da corrida
    soft: number; 
    medium: number; 
    hard: number; 
    intermediate: number; 
    wet: number; 
  };
  strategyPlans: StrategyPlan[]; // Array com os Planos (A, B, C) - Max 3

  lapTimes: Array<{ lapNumber: number; timeInMillis: number; }>; 
}

// Valores iniciais para um novo setup
const formInitialState: SetupData = {
  setupTitle: '', 
  controlType: '', 
  car: '', 
  team: '', 
  track: '', 
  condition: '', 
  notes: '',
  isPublic: false, // Privado por padrão
  rating: 0,
  ratingCount: 0,
  totalDownloads: 0,
  originalSetupId: null, 
  frontWing: 25, 
  rearWing: 25, 
  diffAdjustmentOn: 55, 
  diffAdjustmentOff: 55, 
  engineBraking: 50, 
  frontCamber: -3.0, 
  rearCamber: -1.5, 
  frontToeOut: 0.25, 
  rearToeIn: 0.25, 
  frontSuspension: 21, 
  rearSuspension: 21, 
  frontAntiRollBar: 11, 
  rearAntiRollBar: 11, 
  frontRideHeight: 25, 
  rearRideHeight: 70, 
  brakePressure: 90, 
  frontBrakeBias: 60, 
  frontRightTyrePressure: 26.0, 
  frontLeftTyrePressure: 26.0, 
  rearRightTyrePressure: 23.5, 
  rearLeftTyrePressure: 23.5,
};

export interface GameData {
  name: string;
  releaseYear: number;
  teams: { carName: string; teamName: string }[];
  tracks: string[];
  validationRules: any;
}

export interface RatingDoc {
  setupId: string;
  userId: string;
  rating: number;
}

// Define a interface do store, incluindo os dados e as ações
interface SetupState {
  userProfile: UserProfile | null;
  loadingProfile: boolean;
  listenToUserProfile: (uid: string) => (() => void);
  uploadProfilePicture: (imageUri: string) => Promise<void>;
  
  formData: SetupData;
  updateField: (field: keyof SetupData, value: string | number | boolean) => void;
  loadFormWithExistingSetup: (setupId: string) => void;
  resetForm: () => void;

  allSetups: SetupData[];
  loadingSetups: boolean;
  listenToUserSetups: () => (() => void);
  saveSetup: (setupData: SetupData) => Promise<void>;
  deleteSetup: (setupId: string) => Promise<void>;

  // Estado para a gameData
  gameData: GameData | null;
  loadingGameData: boolean;
  fetchGameData: (gameId: string) => Promise<void>;

  // Estado das Pastas
  folders: Folder[];
  loadingFolders: boolean;
  listenToUserFolders: () => (() => void); // Ouvinte em tempo real para pastas
  createFolder: (name: string, isPublic: boolean) => Promise<void>;
  updateFolder: (folderId: string, data: { name?: string, isPublic?: boolean }) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;

  // Estado para Setups dentro de uma Pasta
  folderSetups: SetupData[];
  loadingFolderSetups: boolean;
  getSetupsForFolder: (folderId: string) => Promise<void>;
  setupFolderIds: string[]; // Armazena os IDs das pastas em que um setup está
  loadingSetupFolders: boolean;
  getFoldersForSetup: (setupId: string) => Promise<void>;
  updateSetupFolders: (setupId: string, newFolderIds: string[]) => Promise<void>;

  // --- NOVOS ESTADOS E AÇÕES PARA STRATEGIES ---
  strategies: Strategy[];
  loadingStrategies: boolean;
  listenToUserStrategies: () => (() => void);
  createStrategy: (strategyData: Partial<Strategy>) => Promise<void>; 
  updateStrategy: (strategyId: string, strategyData: Partial<Strategy>) => Promise<void>; 
  deleteStrategy: (strategyId: string) => Promise<void>;
  updateLapTimes: (strategyId: string, lapTimes: Strategy['lapTimes']) => Promise<void>;

  publicSetups: SetupData[];
  loadingPublicSetups: boolean;      // Loading inicial
  loadingMoreSetups: boolean;        // Loading do "Carregar Mais"
  lastSetupDoc: DocumentSnapshot | null; // Referência para paginação
  hasMoreSetups: boolean;              // Para saber se desativa o botão
  currentSearchFilters: Record<string, string | undefined> | null; // Para lembrar os filtros

  searchPublicSetups: (filters?: Record<string, string | undefined>) => Promise<void>;
  fetchMorePublicSetups: () => Promise<void>;
  cloneSetup: (setup: SetupData) => Promise<void>;
  rateSetup: (setupId: string, ratingValue: number) => Promise<void>;
  myRatings: { [setupId: string]: number | null }; // Cache dos votos do usuário
  fetchMyRating: (setupId: string) => Promise<void>; // Ação para buscar o voto
}

let unsubscribeFromProfile: (() => void) | null = null;
let unsubscribeFromSetups: (() => void) | null = null;
let unsubscribeFromFolders: (() => void) | null = null;
let unsubscribeFromStrategies: (() => void) | null = null;


// Cria o hook do store
export const useSetupStore = create<SetupState>((set, get) => ({
  userProfile: null,
  loadingProfile: true,
  formData: formInitialState,
  allSetups: [],
  gameData: null,
  loadingSetups: true,
  loadingGameData: true,
  folders: [],
  loadingFolders: true,
  folderSetups: [],
  loadingFolderSetups: true,
  setupFolderIds: [],
  loadingSetupFolders: false,
  strategies: [],
  loadingStrategies: true,
  publicSetups: [],
  loadingPublicSetups: false,
  loadingMoreSetups: false,
  lastSetupDoc: null,
  hasMoreSetups: true,
  currentSearchFilters: null,
  myRatings: {},

  listenToUserProfile: (uid) => {
    if (unsubscribeFromProfile) unsubscribeFromProfile();
    
    const docRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        set({ userProfile: docSnap.data() as UserProfile, loadingProfile: false });
      } else {
        set({ userProfile: null, loadingProfile: false });
      }
    }, (error) => {
      console.error("Erro ao ouvir perfil de usuário:", error);
      set({ loadingProfile: false });
    });
    
    unsubscribeFromProfile = unsubscribe;
    return unsubscribe;
  },

  uploadProfilePicture: async (imageUri: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    try {
      // 1. Converte a imagem URI (file://...) em um Blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // 2. Cria uma referência no Firebase Storage
      // Ex: 'profilePictures/user_uid_123.jpg'
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const storageRef = ref(storage, `profilePictures/${user.uid}/profile.${fileExtension}`);

      // 3. Faz o upload do arquivo
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // Aguarda o upload ser concluído
      await uploadTask;

      // 4. Pega a URL de download pública
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      // 5. Atualiza o documento do usuário no Firestore com a nova URL
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        profilePictureUrl: downloadURL
      });
      
      // O listener 'listenToUserProfile' fará o set({ userProfile: ... }) automaticamente

    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      throw new Error("Não foi possível salvar a foto de perfil.");
    }
  },
  
  updateField: (field, value) => set(state => ({ formData: { ...state.formData, [field]: value } })),
  loadFormWithExistingSetup: (setupId) => {
    const setupToEdit = get().allSetups.find(s => s.id === setupId);
    if (setupToEdit) set({ formData: setupToEdit });
  },
  
  resetForm: () => set({ formData: formInitialState }),
  
  listenToUserSetups: () => {
    if (unsubscribeFromSetups) unsubscribeFromSetups();
    const user = auth.currentUser;
    if (!user) {
      set({ allSetups: [], loadingSetups: false });
      return () => {};
    }
    const q = query(collection(db, "setups"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const setups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SetupData));
      set({ allSetups: setups, loadingSetups: false });
    }, (error) => {
      console.error("Erro ao ouvir setups:", error);
      set({ loadingSetups: false });
    });
    unsubscribeFromSetups = unsubscribe;
    return unsubscribe;
  },

  // --- NOVA FUNÇÃO: BUSCA PÚBLICA ---
  searchPublicSetups: async (filters) => {
    // 1. Ativa o loading principal e reseta tudo
    set({ 
      loadingPublicSetups: true, 
      publicSetups: [], 
      lastSetupDoc: null, 
      hasMoreSetups: true,
      currentSearchFilters: filters // Salva os filtros para o "Carregar Mais"
    });
    
    try {
      const setupsRef = collection(db, "setups");
      let q = query(setupsRef, where("isPublic", "==", true));

      // Aplicando filtros
      if (filters?.car) {
        q = query(q, where("car", "==", filters.car));
      }
      if (filters?.track) {
        q = query(q, where("track", "==", filters.track));
      }
      if (filters?.controlType) {
        q = query(q, where("controlType", "==", filters.controlType));
      }
      if (filters?.condition) {
        q = query(q, where("condition", "==", filters.condition));
      }

      // 3. Aplica ordenação e limite (os 10 que você pediu)
      q = query(q, orderBy("createdAt", "desc"), limit(10));

      const snapshot = await getDocs(q);
      const setups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SetupData));
      
      // 4. Salva o último documento pego para usar no "startAfter"
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      
      set({ 
        publicSetups: setups, 
        lastSetupDoc: lastDoc || null,
        hasMoreSetups: snapshot.docs.length === 10, // Se veio menos de 10, não há mais
        loadingPublicSetups: false 
      });

    } catch (error) {
      console.error("Erro ao buscar setups públicos:", error);
      set({ loadingPublicSetups: false });
    }
  },

  // --- NOVA FUNÇÃO: CARREGAR MAIS ---
  fetchMorePublicSetups: async () => {
    const { 
      currentSearchFilters: filters, 
      lastSetupDoc, 
      loadingMoreSetups, 
      hasMoreSetups 
    } = get();

    // Se já estiver carregando, ou não tiver mais, ou não tiver um ponto de partida, não faz nada
    if (loadingMoreSetups || !hasMoreSetups || !lastSetupDoc) return;

    set({ loadingMoreSetups: true });

    try {
      const setupsRef = collection(db, "setups");
      let q = query(setupsRef, where("isPublic", "==", true));

      // REAPLICA OS MESMOS FILTROS DA BUSCA INICIAL
      if (filters?.car) {
        q = query(q, where("car", "==", filters.car));
      }
      if (filters?.track) {
        q = query(q, where("track", "==", filters.track));
      }
      if (filters?.controlType) {
        q = query(q, where("controlType", "==", filters.controlType));
      }
      if (filters?.condition) {
        q = query(q, where("condition", "==", filters.condition));
      }

      // A MÁGICA: Começa *depois* do último que pegamos e busca mais 10
      q = query(q, 
        orderBy("createdAt", "desc"), 
        startAfter(lastSetupDoc), // <-- Paginação
        limit(10)
      );

      const snapshot = await getDocs(q);
      const newSetups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SetupData));
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1];

      set(state => ({
        publicSetups: [...state.publicSetups, ...newSetups], // Adiciona os novos ao final da lista
        lastSetupDoc: newLastDoc || null,
        hasMoreSetups: snapshot.docs.length === 10,
        loadingMoreSetups: false
      }));

    } catch (error) {
      console.error("Erro ao carregar mais setups:", error);
      set({ loadingMoreSetups: false });
    }
  },

  // --- NOVA FUNÇÃO: CLONAR SETUP ---
  cloneSetup: async (originalSetup) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado para clonar.");

    const currentProfile = get().userProfile;
    
    // Remove o ID original para criar um novo
    const { id, ...data } = originalSetup; 

    const setupCopy = {
      ...data,
      userId: user.uid, // O novo dono é o usuário atual
      isPublic: false,  // A cópia é sempre privada por padrão
      originalSetupId: id, // Guarda a referência de onde veio
      setupTitle: `${data.setupTitle} (Cópia)`, // Indica que é uma cópia

      // Reseta as estatísticas da comunidade para a nova cópia
      rating: 0,
      ratingCount: 0,
      totalDownloads: 0,
      
      // Define o autor da *cópia* como o usuário atual
      authorName: currentProfile?.username || "Piloto Desconhecido",
      authorPhotoUrl: currentProfile?.profilePictureUrl || null,

      // Define novas datas de criação/atualização
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Salva o novo documento na coleção 'setups'
    await addDoc(collection(db, "setups"), setupCopy);
    
    // Opcional (Fase 4 - Polimento): 
    // Aqui poderíamos usar uma Cloud Function/Transaction para incrementar
    // o `totalDownloads` do setup *original* (originalSetup.id)
  },

  fetchMyRating: async (setupId) => {
    const user = auth.currentUser;
    if (!user) return; // Se não está logado, não há voto

    // Se já temos no cache, não busca de novo
    if (get().myRatings[setupId] !== undefined) {
      return;
    }

    try {
      const ratingDocId = `${setupId}_${user.uid}`;
      const ratingRef = doc(db, "ratings", ratingDocId);
      const ratingDoc = await getDoc(ratingRef);

      if (ratingDoc.exists()) {
        // Voto encontrado, salva no cache
        const myVote = ratingDoc.data() as RatingDoc;
        set((state) => ({
          myRatings: { ...state.myRatings, [setupId]: myVote.rating },
        }));
      } else {
        // Voto não encontrado, salva null no cache
        set((state) => ({
          myRatings: { ...state.myRatings, [setupId]: null },
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar minha avaliação:", error);
    }
  },

  // --- FUNÇÃO rateSetup (TOTALMENTE MODIFICADA) ---
  rateSetup: async (setupId, ratingValue) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    // 1. Define as duas referências de documento que vamos usar
    const setupRef = doc(db, "setups", setupId);
    const ratingDocId = `${setupId}_${user.uid}`;
    const ratingRef = doc(db, "ratings", ratingDocId);

    let newAverageRating: number = 0;
    let newRatingCount: number = 0;

    try {
      await runTransaction(db, async (transaction) => {
        // 2. Lê os dois documentos *dentro* da transação
        const setupDoc = await transaction.get(setupRef);
        const myRatingDoc = await transaction.get(ratingRef);

        if (!setupDoc.exists()) {
          throw new Error("Este setup não existe mais!");
        }

        const setupData = setupDoc.data();
        const oldRatingSum = setupData.rating * setupData.ratingCount;

        const isNewVote = !myRatingDoc.exists();
        const oldVoteValue = isNewVote ? 0 : (myRatingDoc.data() as RatingDoc).rating;

        // 3. Calcula a nova média
        if (isNewVote) {
          // Usuário está votando pela primeira vez
          newRatingCount = setupData.ratingCount + 1;
          const newRatingSum = oldRatingSum + ratingValue;
          newAverageRating = newRatingSum / newRatingCount;
        } else {
          // Usuário está *atualizando* o voto
          newRatingCount = setupData.ratingCount; // Contagem não muda
          const newRatingSum = (oldRatingSum - oldVoteValue) + ratingValue;
          newAverageRating = newRatingSum / newRatingCount;
        }

        // 4. Atualiza os dois documentos na transação
        transaction.update(setupRef, {
          rating: newAverageRating,
          ratingCount: newRatingCount,
        });
        
        transaction.set(ratingRef, { // .set() (cria ou sobrescreve)
          setupId: setupId,
          userId: user.uid,
          rating: ratingValue,
        });
      });

      console.log("Avaliação (re)calculada e registrada!");

      // 5. Atualiza o estado local (Zustand)
      set((state) => {
        const updateSetupInList = (list: SetupData[]) => 
          list.map(s => 
            s.id === setupId 
              ? { ...s, rating: newAverageRating, ratingCount: newRatingCount } 
              : s
          );
        
        return {
          myRatings: { ...state.myRatings, [setupId]: ratingValue }, // Atualiza o cache do meu voto
          allSetups: updateSetupInList(state.allSetups),
          folderSetups: updateSetupInList(state.folderSetups),
          publicSetups: updateSetupInList(state.publicSetups),
        };
      });

    } catch (error) {
      console.error("Erro na transação de avaliação: ", error);
      throw new Error("Não foi possível salvar sua avaliação.");
    }
  },

  saveSetup: async (setupData) => {const user = auth.currentUser;
    if (!user) throw new Error("Utilizador não autenticado para salvar o setup.");
    
    // Pegamos o perfil atual do estado da Store para salvar o nome/foto junto
    // Isso evita leituras extras no banco quando formos listar os setups
    const currentProfile = get().userProfile;
    
    // Remove o ID do objeto principal para não o salvar como um campo no documento
    const { id, ...data } = setupData;

    const dataToSave = {
      ...data,
      userId: user.uid,
      updatedAt: Timestamp.now(),
      // Garante que isPublic seja booleano
      isPublic: Boolean(data.isPublic),
      // Atualiza o nome/foto caso o usuário tenha mudado (opcional, mas recomendado)
      authorName: currentProfile?.username || "Piloto Desconhecido",
      authorPhotoUrl: currentProfile?.profilePictureUrl || null,
    };

    if (id) {
      // ATUALIZAR SETUP EXISTENTE
      const docRef = doc(db, "setups", id);
      await updateDoc(docRef, dataToSave);
    } else {
      // CRIAR NOVO SETUP
      // Inicializa contadores apenas na criação
      await addDoc(collection(db, "setups"), {
        ...dataToSave,
        createdAt: Timestamp.now(),
        rating: 0,
        ratingCount: 0,
        totalDownloads: 0,
        originalSetupId: null,
      });
    }
  },
  
  deleteSetup: async (setupId) => {
    if (!setupId) throw new Error("ID do setup é necessário.");
    
    // Deletar o documento do setup
    await deleteDoc(doc(db, "setups", setupId));

    // Deletar todas as entradas em 'folderEntries' para este setup
    const q = query(collection(db, "folderEntries"), where("setupId", "==", setupId));
    const entriesSnapshot = await getDocs(q);
    const batch = writeBatch(db);
    entriesSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
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

  listenToUserFolders: () => {
    if (unsubscribeFromFolders) unsubscribeFromFolders();
    const user = auth.currentUser;
    if (!user) {
      set({ folders: [], loadingFolders: false });
      return () => {};
    }
    const q = query(collection(db, "folders"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const folders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Folder));
      set({ folders, loadingFolders: false });
    }, (error) => {
      console.error("Erro ao ouvir pastas:", error);
      set({ loadingFolders: false });
    });
    unsubscribeFromFolders = unsubscribe;
    return unsubscribe;
  },

  createFolder: async (name, isPublic) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    await addDoc(collection(db, "folders"), {
      name,
      isPublic,
      ownerId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  updateFolder: async (folderId, data) => {
    const docRef = doc(db, "folders", folderId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  deleteFolder: async (folderId) => {
    const batch = writeBatch(db);

    // 1. Deletar a pasta
    const folderRef = doc(db, "folders", folderId);
    batch.delete(folderRef);

    // 2. Encontrar e deletar todas as entradas associadas a esta pasta
    const entriesQuery = query(collection(db, "folderEntries"), where("folderId", "==", folderId));
    const entriesSnapshot = await getDocs(entriesQuery);
    entriesSnapshot.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
  },

  getSetupsForFolder: async (folderId) => {
    set({ loadingFolderSetups: true, folderSetups: [] });
    try {
      // 1. Buscar todas as entradas para a pasta específica
      const entriesQuery = query(collection(db, "folderEntries"), where("folderId", "==", folderId));
      const entriesSnapshot = await getDocs(entriesQuery);
      
      const setupIds = entriesSnapshot.docs.map(doc => doc.data().setupId);

      if (setupIds.length === 0) {
        set({ folderSetups: [], loadingFolderSetups: false });
        return;
      }

      // 2. Buscar todos os setups correspondentes aos IDs encontrados usando a query 'in'
      // A query 'in' é muito performática e evita múltiplas leituras individuais.
      // O Firestore limita as queries 'in' a 30 itens por vez.
      // TODO: Implementar paginação ou múltiplas queries se uma pasta puder ter mais de 30 setups.
      const setupsQuery = query(collection(db, "setups"), where(documentId(), "in", setupIds));
      const setupsSnapshot = await getDocs(setupsQuery);
      const setups = setupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SetupData));
      
      set({ folderSetups: setups, loadingFolderSetups: false });
    } catch (error) {
      console.error("Erro ao buscar setups da pasta:", error);
      set({ loadingFolderSetups: false });
    }
  },

  getFoldersForSetup: async (setupId) => {
    const user = auth.currentUser;
    if (!user) return;
    set({ loadingSetupFolders: true, setupFolderIds: [] });
    try {
      const q = query(
        collection(db, "folderEntries"),
        where("setupId", "==", setupId),
        where("ownerId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const folderIds = snapshot.docs.map(doc => doc.data().folderId);
      set({ setupFolderIds: folderIds, loadingSetupFolders: false });
    } catch (error) {
      console.error("Erro ao buscar pastas do setup:", error);
      set({ loadingSetupFolders: false });
    }
  },

  updateSetupFolders: async (setupId, newFolderIds) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const currentFolderIds = get().setupFolderIds;
    const batch = writeBatch(db);

    const foldersToAdd = newFolderIds.filter(id => !currentFolderIds.includes(id));
    const foldersToRemove = currentFolderIds.filter(id => !newFolderIds.includes(id));

    // Adiciona as novas entradas
    foldersToAdd.forEach(folderId => {
      const newEntryRef = doc(collection(db, "folderEntries")); // Cria uma referência com ID automático
      batch.set(newEntryRef, {
        setupId,
        folderId,
        ownerId: user.uid,
        addedAt: Timestamp.now(),
      });
    });

    // Para remover, precisamos primeiro encontrar os documentos correspondentes
    if (foldersToRemove.length > 0) {
      const q = query(
        collection(db, "folderEntries"),
        where("setupId", "==", setupId),
        where("ownerId", "==", user.uid),
        where("folderId", "in", foldersToRemove)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
    }

    // Executa todas as operações de uma só vez
    await batch.commit();
  },

  listenToUserStrategies: () => {
    if (unsubscribeFromStrategies) unsubscribeFromStrategies();
    const user = auth.currentUser;
    if (!user) {
      set({ strategies: [], loadingStrategies: false });
      return () => {};
    }
    const q = query(collection(db, "strategies"), where("ownerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // O mapeamento aqui já funcionará com a nova estrutura
      const strategies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Strategy));
      set({ strategies, loadingStrategies: false });
    }, (error) => {
      console.error("Erro ao ouvir estratégias:", error);
      set({ loadingStrategies: false });
    });
    unsubscribeFromStrategies = unsubscribe;
    return unsubscribe;
  },

  createStrategy: async (strategyData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    
    await addDoc(collection(db, "strategies"), {
      ...strategyData,
      ownerId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  updateStrategy: async (strategyId, strategyData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");

    const docRef = doc(db, "strategies", strategyId);
    await updateDoc(docRef, {
      ...strategyData,
      ownerId: user.uid, 
      updatedAt: Timestamp.now(),
    });
  },

  deleteStrategy: async (strategyId) => {
    if (!strategyId) throw new Error("ID da estratégia é necessário para a exclusão.");
    
    const docRef = doc(db, "strategies", strategyId);
    await deleteDoc(docRef);
  },

  updateLapTimes: async (strategyId, lapTimes) => {
    if (!strategyId) throw new Error("ID da estratégia é necessário.");
    
    const docRef = doc(db, "strategies", strategyId);
    await updateDoc(docRef, {
      lapTimes: lapTimes,
      updatedAt: Timestamp.now(), // Atualiza a data de modificação
    });
  },
}));
