import { create } from 'zustand';
import { db, auth, storage } from '../services/firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, getDocs, getDoc, writeBatch, documentId, setDoc, limit, orderBy, runTransaction, increment,
  type DocumentSnapshot, startAfter
 } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

export interface UserProfile {
  uid: string;
  email: string;
  username: string; 
  profilePictureUrl?: string; 
  gamertagPSN?: string; 
  gamertagXbox?: string; 
  gamertagPC?: string;   
  followersCount?: number;
  followingCount?: number;
  setupsCount?: number;
  averageRating?: number;
}

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
  authorName?: string;      
  authorPhotoUrl?: string;  
  rating: number;           
  ratingCount: number;      
  totalDownloads: number;   
  originalSetupId?: string | null;
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
  [key: string]: any;
}

export interface Folder {
  id: string;
  name: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FolderEntry {
  id: string;
  folderId: string;
  setupId: string;
  ownerId: string;
  addedAt: Timestamp;
}

export interface PlannedStint {
  tyreCompound: "soft" | "medium" | "hard" | "intermediate" | "wet";
  pitStopLap: number;
}

export interface StrategyPlan {
  planLabel: string;
  plannedStints: PlannedStint[];
  fuelLoad: number; 
  totalTime: string;
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

  totalRaceLaps?: number; 
  initialAvailableTyres: { 
    soft: number; 
    medium: number; 
    hard: number; 
    intermediate: number; 
    wet: number; 
  };
  strategyPlans: StrategyPlan[];

  lapTimes: Array<{ lapNumber: number; timeInMillis: number; }>; 
}

const formInitialState: SetupData = {
  setupTitle: '', 
  controlType: '', 
  car: '', 
  team: '', 
  track: '', 
  condition: '', 
  notes: '',
  isPublic: false, 
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

interface SetupState {
  userProfile: UserProfile | null;
  loadingProfile: boolean;
  listenToUserProfile: (uid: string) => (() => void);
  uploadProfilePicture: (imageUri: string) => Promise<void>;
  viewedUserProfile: UserProfile | null; 
  loadingViewedProfile: boolean;
  isFollowing: boolean;
  fetchUserProfile: (uid: string) => Promise<void>;
  checkIfFollowing: (targetUserId: string) => Promise<void>;
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  userList: UserProfile[];
  loadingUserList: boolean;
  fetchUserList: (userId: string, type: 'followers' | 'following') => Promise<void>;
  fetchUserStats: (userId: string) => Promise<void>;
  
  formData: SetupData;
  updateField: (field: keyof SetupData, value: string | number | boolean) => void;
  loadFormWithExistingSetup: (setupId: string) => void;
  resetForm: () => void;

  allSetups: SetupData[];
  loadingSetups: boolean;
  listenToUserSetups: () => (() => void);
  saveSetup: (setupData: SetupData) => Promise<void>;
  deleteSetup: (setupId: string) => Promise<void>;

  gameData: GameData | null;
  loadingGameData: boolean;
  fetchGameData: (gameId: string) => Promise<void>;

  folders: Folder[];
  loadingFolders: boolean;
  listenToUserFolders: () => (() => void);
  createFolder: (name: string, isPublic: boolean) => Promise<void>;
  updateFolder: (folderId: string, data: { name?: string, isPublic?: boolean }) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;

  folderSetups: SetupData[];
  loadingFolderSetups: boolean;
  getSetupsForFolder: (folderId: string) => Promise<void>;
  setupFolderIds: string[];
  loadingSetupFolders: boolean;
  getFoldersForSetup: (setupId: string) => Promise<void>;
  updateSetupFolders: (setupId: string, newFolderIds: string[]) => Promise<void>;

  strategies: Strategy[];
  loadingStrategies: boolean;
  listenToUserStrategies: () => (() => void);
  createStrategy: (strategyData: Partial<Strategy>) => Promise<void>; 
  updateStrategy: (strategyId: string, strategyData: Partial<Strategy>) => Promise<void>; 
  deleteStrategy: (strategyId: string) => Promise<void>;
  updateLapTimes: (strategyId: string, lapTimes: Strategy['lapTimes']) => Promise<void>;

  publicSetups: SetupData[];
  loadingPublicSetups: boolean;      
  loadingMoreSetups: boolean;        
  lastSetupDoc: DocumentSnapshot | null; 
  hasMoreSetups: boolean;              
  currentSearchFilters: Record<string, string | undefined> | null;

  searchPublicSetups: (filters?: Record<string, string | undefined>) => Promise<void>;
  fetchMorePublicSetups: () => Promise<void>;
  cloneSetup: (setup: SetupData) => Promise<void>;
  rateSetup: (setupId: string, ratingValue: number) => Promise<void>;
  myRatings: { [setupId: string]: number | null }; 
  fetchMyRating: (setupId: string) => Promise<void>;

  topRatedSetups: SetupData[];
  loadingTopRated: boolean;
  fetchTopRatedSetups: () => Promise<void>;

  deepLinkSetup: SetupData | null;
  fetchSetupById: (setupId: string) => Promise<boolean>;
}

let unsubscribeFromProfile: (() => void) | null = null;
let unsubscribeFromSetups: (() => void) | null = null;
let unsubscribeFromFolders: (() => void) | null = null;
let unsubscribeFromStrategies: (() => void) | null = null;

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
  topRatedSetups: [],
  loadingTopRated: false,
  viewedUserProfile: null,
  loadingViewedProfile: false,
  isFollowing: false,
  userList: [],
  loadingUserList: false,
  deepLinkSetup: null,

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
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const storageRef = ref(storage, `profilePictures/${user.uid}/profile.${fileExtension}`);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      await uploadTask;

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        profilePictureUrl: downloadURL
      });
      
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

  searchPublicSetups: async (filters) => {
    set({ 
      loadingPublicSetups: true, 
      publicSetups: [], 
      lastSetupDoc: null, 
      hasMoreSetups: true,
      currentSearchFilters: filters 
    });
    
    try {
      const setupsRef = collection(db, "setups");
      let q = query(setupsRef, where("isPublic", "==", true));

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
      if (filters?.authorName) {
        q = query(q, where("authorName", "==", filters.authorName));
      }

      q = query(q, orderBy("createdAt", "desc"), limit(10));

      const snapshot = await getDocs(q);
      const setups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SetupData));
      
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      
      set({ 
        publicSetups: setups, 
        lastSetupDoc: lastDoc || null,
        hasMoreSetups: snapshot.docs.length === 10, 
        loadingPublicSetups: false 
      });

    } catch (error) {
      console.error("Erro ao buscar setups públicos:", error);
      set({ loadingPublicSetups: false });
    }
  },

  fetchMorePublicSetups: async () => {
    const { 
      currentSearchFilters: filters, 
      lastSetupDoc, 
      loadingMoreSetups, 
      hasMoreSetups 
    } = get();

    if (loadingMoreSetups || !hasMoreSetups || !lastSetupDoc) return;

    set({ loadingMoreSetups: true });

    try {
      const setupsRef = collection(db, "setups");
      let q = query(setupsRef, where("isPublic", "==", true));

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
      if (filters?.authorName) {
        q = query(q, where("authorName", "==", filters.authorName));
      }

      q = query(q, 
        orderBy("createdAt", "desc"), 
        startAfter(lastSetupDoc), 
        limit(10)
      );

      const snapshot = await getDocs(q);
      const newSetups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SetupData));
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1];

      set(state => ({
        publicSetups: [...state.publicSetups, ...newSetups], 
        lastSetupDoc: newLastDoc || null,
        hasMoreSetups: snapshot.docs.length === 10,
        loadingMoreSetups: false
      }));

    } catch (error) {
      console.error("Erro ao carregar mais setups:", error);
      set({ loadingMoreSetups: false });
    }
  },

  cloneSetup: async (originalSetup) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado para clonar.");

    const currentProfile = get().userProfile;
    
    const { id, ...data } = originalSetup; 

    const setupCopy = {
      ...data,
      userId: user.uid,
      isPublic: false,  
      originalSetupId: id, 
      setupTitle: `${data.setupTitle} (Cópia)`, 

      rating: 0,
      ratingCount: 0,
      totalDownloads: 0,
      
      authorName: currentProfile?.username || "Piloto Desconhecido",
      authorPhotoUrl: currentProfile?.profilePictureUrl || null,

      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await addDoc(collection(db, "setups"), setupCopy);
  },

  fetchMyRating: async (setupId) => {
    const user = auth.currentUser;
    if (!user) return; 

    if (get().myRatings[setupId] !== undefined) {
      return;
    }

    try {
      const ratingDocId = `${setupId}_${user.uid}`;
      const ratingRef = doc(db, "ratings", ratingDocId);
      const ratingDoc = await getDoc(ratingRef);

      if (ratingDoc.exists()) {
        const myVote = ratingDoc.data() as RatingDoc;
        set((state) => ({
          myRatings: { ...state.myRatings, [setupId]: myVote.rating },
        }));
      } else {
        set((state) => ({
          myRatings: { ...state.myRatings, [setupId]: null },
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar minha avaliação:", error);
    }
  },

  rateSetup: async (setupId, ratingValue) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado.");
    const setupRef = doc(db, "setups", setupId);
    const ratingDocId = `${setupId}_${user.uid}`;
    const ratingRef = doc(db, "ratings", ratingDocId);

    let newAverageRating: number = 0;
    let newRatingCount: number = 0;

    try {
      await runTransaction(db, async (transaction) => {
        const setupDoc = await transaction.get(setupRef);
        const myRatingDoc = await transaction.get(ratingRef);

        if (!setupDoc.exists()) {
          throw new Error("Este setup não existe mais!");
        }

        const setupData = setupDoc.data();
        const oldRatingSum = setupData.rating * setupData.ratingCount;

        const isNewVote = !myRatingDoc.exists();
        const oldVoteValue = isNewVote ? 0 : (myRatingDoc.data() as RatingDoc).rating;

        if (isNewVote) {
          newRatingCount = setupData.ratingCount + 1;
          const newRatingSum = oldRatingSum + ratingValue;
          newAverageRating = newRatingSum / newRatingCount;
        } else {
          newRatingCount = setupData.ratingCount;
          const newRatingSum = (oldRatingSum - oldVoteValue) + ratingValue;
          newAverageRating = newRatingSum / newRatingCount;
        }

        transaction.update(setupRef, {
          rating: newAverageRating,
          ratingCount: newRatingCount,
        });
        
        transaction.set(ratingRef, { 
          setupId: setupId,
          userId: user.uid,
          rating: ratingValue,
        });
      });

      // console.log("Avaliação (re)calculada e registrada!");

      set((state) => {
        const updateSetupInList = (list: SetupData[]) => 
          list.map(s => 
            s.id === setupId 
              ? { ...s, rating: newAverageRating, ratingCount: newRatingCount } 
              : s
          );
        
        return {
          myRatings: { ...state.myRatings, [setupId]: ratingValue }, 
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

  saveSetup: async (setupData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Utilizador não autenticado para salvar o setup.");
    
    const currentProfile = get().userProfile;
    
    const { id, ...data } = setupData;

    const dataToSave = {
      ...data,
      userId: user.uid,
      updatedAt: Timestamp.now(),
      isPublic: Boolean(data.isPublic),
      authorName: currentProfile?.username || "Piloto Desconhecido",
      authorPhotoUrl: currentProfile?.profilePictureUrl || null,
    };

    if (id) {
      const docRef = doc(db, "setups", id);
      await updateDoc(docRef, dataToSave);
    } else {
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
    
    await deleteDoc(doc(db, "setups", setupId));

    const q = query(collection(db, "folderEntries"), where("setupId", "==", setupId));
    const entriesSnapshot = await getDocs(q);
    const batch = writeBatch(db);
    entriesSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  },

  fetchGameData: async (gameId) => {
    if (get().gameData) return; 
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

    const folderRef = doc(db, "folders", folderId);
    batch.delete(folderRef);

    const entriesQuery = query(collection(db, "folderEntries"), where("folderId", "==", folderId));
    const entriesSnapshot = await getDocs(entriesQuery);
    entriesSnapshot.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
  },

  getSetupsForFolder: async (folderId) => {
    set({ loadingFolderSetups: true, folderSetups: [] });
    try {
      const entriesQuery = query(collection(db, "folderEntries"), where("folderId", "==", folderId));
      const entriesSnapshot = await getDocs(entriesQuery);
      
      const setupIds = entriesSnapshot.docs.map(doc => doc.data().setupId);

      if (setupIds.length === 0) {
        set({ folderSetups: [], loadingFolderSetups: false });
        return;
      }

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

    foldersToAdd.forEach(folderId => {
      const newEntryRef = doc(collection(db, "folderEntries"));
      batch.set(newEntryRef, {
        setupId,
        folderId,
        ownerId: user.uid,
        addedAt: Timestamp.now(),
      });
    });

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
      updatedAt: Timestamp.now(),
    });
  },

  fetchTopRatedSetups: async () => {
    if (get().topRatedSetups.length > 0) return; 
    if (get().topRatedSetups.length > 0) return; 
    
    set({ loadingTopRated: true });
    try {
      const setupsRef = collection(db, "setups");
      const q = query(
        setupsRef, 
        where("isPublic", "==", true), 
        orderBy("rating", "desc"), 
        limit(5)
      );

      const snapshot = await getDocs(q);
      const setups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SetupData));
      
      set({ topRatedSetups: setups, loadingTopRated: false });
    } catch (error) {
      console.error("Erro ao buscar top setups:", error);
      set({ loadingTopRated: false });
    }
  },

  fetchUserProfile: async (uid) => {
    set({ loadingViewedProfile: true, viewedUserProfile: null });
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        set({ viewedUserProfile: userDoc.data() as UserProfile });
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    } finally {
      set({ loadingViewedProfile: false });
    }
  },

  checkIfFollowing: async (targetUserId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    const docRef = doc(db, "users", currentUser.uid, "following", targetUserId);
    const docSnap = await getDoc(docRef);
    set({ isFollowing: docSnap.exists() });
  },

  followUser: async (targetUserId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Usuário não logado");

    const myRef = doc(db, "users", currentUser.uid);
    const targetRef = doc(db, "users", targetUserId);
    
    const myFollowingRef = doc(db, "users", currentUser.uid, "following", targetUserId);
    const targetFollowerRef = doc(db, "users", targetUserId, "followers", currentUser.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const myDoc = await transaction.get(myRef);
        const targetDoc = await transaction.get(targetRef);

        if (!targetDoc.exists()) throw new Error("Usuário alvo não existe");

        transaction.set(myFollowingRef, { since: Timestamp.now() });
        transaction.set(targetFollowerRef, { since: Timestamp.now() });

        const newMyFollowingCount = (myDoc.data()?.followingCount || 0) + 1;
        const newTargetFollowerCount = (targetDoc.data()?.followersCount || 0) + 1;

        transaction.update(myRef, { followingCount: newMyFollowingCount });
        transaction.update(targetRef, { followersCount: newTargetFollowerCount });
      });

      set({ isFollowing: true });
      
      const viewed = get().viewedUserProfile;
      if (viewed && viewed.uid === targetUserId) {
        set({ viewedUserProfile: { ...viewed, followersCount: (viewed.followersCount || 0) + 1 } });
      }

    } catch (error) {
      console.error("Erro ao seguir:", error);
      throw error;
    }
  },

  unfollowUser: async (targetUserId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Usuário não logado");

    const myRef = doc(db, "users", currentUser.uid);
    const targetRef = doc(db, "users", targetUserId);
    const myFollowingRef = doc(db, "users", currentUser.uid, "following", targetUserId);
    const targetFollowerRef = doc(db, "users", targetUserId, "followers", currentUser.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const myDoc = await transaction.get(myRef);
        const targetDoc = await transaction.get(targetRef);

        transaction.delete(myFollowingRef);
        transaction.delete(targetFollowerRef);

        const newMyFollowingCount = Math.max(0, (myDoc.data()?.followingCount || 0) - 1);
        const newTargetFollowerCount = Math.max(0, (targetDoc.data()?.followersCount || 0) - 1);

        transaction.update(myRef, { followingCount: newMyFollowingCount });
        transaction.update(targetRef, { followersCount: newTargetFollowerCount });
      });

      set({ isFollowing: false });

      const viewed = get().viewedUserProfile;
      if (viewed && viewed.uid === targetUserId) {
        set({ viewedUserProfile: { ...viewed, followersCount: Math.max(0, (viewed.followersCount || 0) - 1) } });
      }

    } catch (error) {
      console.error("Erro ao deixar de seguir:", error);
      throw error;
    }
  },

  fetchUserList: async (userId, type) => {
    set({ loadingUserList: true, userList: [] });
    try {
      const collectionRef = collection(db, "users", userId, type);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty) {
        set({ userList: [], loadingUserList: false });
        return;
      }

      const userIds = snapshot.docs.map(doc => doc.id);
      
      const userPromises = userIds.map(id => getDoc(doc(db, "users", id)));
      const userDocs = await Promise.all(userPromises);

      const usersData = userDocs
        .filter(doc => doc.exists())
        .map(doc => doc.data() as UserProfile);

      set({ userList: usersData, loadingUserList: false });

    } catch (error) {
      console.error("Erro ao buscar lista de usuários:", error);
      set({ loadingUserList: false });
    }
  },

  fetchSetupById: async (setupId: string) => {
    const { allSetups, folderSetups, publicSetups, topRatedSetups } = get();
    const cached = 
      allSetups.find(s => s.id === setupId) || 
      folderSetups.find(s => s.id === setupId) ||
      publicSetups.find(s => s.id === setupId) ||
      topRatedSetups.find(s => s.id === setupId);

    if (cached) {
      set({ deepLinkSetup: cached });
      return true;
    }

    try {
      const docRef = doc(db, "setups", setupId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const setupData = { id: docSnap.id, ...docSnap.data() } as SetupData;
        set({ deepLinkSetup: setupData });
        return true;
      } else {
        return false; 
      }
    } catch (error) {
      console.error("Erro ao buscar setup pelo ID:", error);
      return false;
    }
  },
  fetchUserStats: async (userId: string) => {
    try {
      const q = query(
        collection(db, "setups"), 
        where("userId", "==", userId),
        where("isPublic", "==", true)
      );
      
      const snapshot = await getDocs(q);
      
      let totalRating = 0;
      const count = snapshot.size;

      snapshot.forEach(doc => {
        const data = doc.data();
        totalRating += (data.rating || 0);
      });

      const avg = count > 0 ? totalRating / count : 0;

      const { userProfile, viewedUserProfile } = get();

      if (userProfile && userProfile.uid === userId) {
        set({ userProfile: { ...userProfile, setupsCount: count, averageRating: avg } });
      } else if (viewedUserProfile && viewedUserProfile.uid === userId) {
        set({ viewedUserProfile: { ...viewedUserProfile, setupsCount: count, averageRating: avg } });
      }

    } catch (error) {
      console.error("Erro ao calcular estatísticas:", error);
    }
  },
}));
