import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { Box } from '../../components/ui/box';
import { Heading } from '../../components/ui/heading';
import { Text } from '../../components/ui/text';
import { Spinner } from '../../components/ui/spinner';
import { Fab, FabIcon, FabLabel } from '../../components/ui/fab';
import { AddIcon } from '../../components/ui/icon';

import { useSetupStore } from '../../src/stores/setupStore';
import FolderCard from '../../src/components/cards/FolderCard';
import CreateEditFolderModal from '../../src/components/dialogs/CreateEditFolderModal';
import { FolderPlus } from 'lucide-react-native';

export default function FoldersScreen() {
    // 1. Pega os estados e ações relevantes da nossa store
    const folders = useSetupStore(state => state.folders);
    const loadingFolders = useSetupStore(state => state.loadingFolders);
    const listenToUserFolders = useSetupStore(state => state.listenToUserFolders);

    // 2. Adiciona o estado para controlar a visibilidade do modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. Configura o ouvinte em tempo real quando a tela é montada
    useEffect(() => {
        // Inicia o listener para as pastas do usuário
        const unsubscribe = listenToUserFolders();

        // Função de limpeza: para o listener quando a tela é desmontada
        return () => unsubscribe();
    }, [listenToUserFolders]); // O hook re-executa se a função listenToUserFolders mudar

    // 3. Renderiza um spinner enquanto os dados estão sendo carregados
    if (loadingFolders) {
        return (
            <Box className="flex-1 justify-center items-center">
                <Spinner size="large" />
            </Box>
        );
    }

    return (
        <Box className="flex-1 bg-gray-100">
            <Heading className="p-4 text-2xl font-bold">Minhas Pastas</Heading>

            {/* 4. Renderiza a lista de pastas ou uma mensagem de "lista vazia" */}
            {folders.length === 0 ? (
                <Box className="flex-1 justify-center items-center px-8">
                    <Text className="text-lg text-center text-gray-500">
                        Você ainda não criou nenhuma pasta.
                    </Text>
                    <Text className="text-center text-gray-500 mt-2">
                        Toque no botão <FolderPlus size={17} /> para organizar seus setups!
                    </Text>
                </Box>
            ) : (
                <FlatList
                    data={folders}
                    renderItem={({ item }) => <FolderCard folder={item} />}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                />
            )}

            {/* 5. Botão de Ação Flutuante (FAB) para criar uma nova pasta */}
            <Fab
                size="lg"
                placement="bottom right"
                className="bg-red-500 mb-20"
                onPress={() => setIsModalOpen(true)}
            >
                <FolderPlus color="white" />
            </Fab>

            {/* 6. Modal de criação de pasta */}
            <CreateEditFolderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </Box>
    );
}