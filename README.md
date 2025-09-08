# F1 Setup Manager 🏎️
📄 Sobre o Projeto
O F1 Setup Manager é um aplicativo mobile desenvolvido para entusiastas de jogos de corrida de Fórmula 1. Ele permite que os usuários salvem, gerenciem e consultem seus setups de carro (configurações) para diferentes circuitos e condições climáticas, otimizando a performance nas pistas virtuais.

Este projeto foi criado para centralizar as informações de setup que, muitas vezes, ficam espalhadas em planilhas, blocos de notas ou fotos.

✨ Funcionalidades Principais
👤 Autenticação de Usuários: Sistema seguro de Login e Cadastro para proteger os setups de cada usuário.

📝 CRUD de Setups: Crie, visualize, edite e delete setups completos.

🔍 Busca e Filtragem: Encontre facilmente um setup específico filtrando por jogo, carro, circuito ou condição climática.

📄 Detalhes do Setup: Tela dedicada para visualizar todos os detalhes de uma configuração, incluindo aerodinâmica, transmissão, suspensão, freios e pneus.

📱 Interface Moderna: Componentes de UI construídos com HeroUI para uma experiência de usuário limpa e atraente.

🛠️ Tecnologias Utilizadas
Este projeto foi construído utilizando as seguintes tecnologias:

Frontend: React Native e HeroUI

Estilização: Tailwind CSS com NativeWind

Backend & Banco de Dados: Google Firebase

Authentication: Para gerenciamento de usuários.

Cloud Firestore: Como banco de dados NoSQL para armazenar os setups.

Linguagem: TypeScript

🚀 Como Executar o Projeto
Siga os passos abaixo para configurar e rodar o projeto em seu ambiente local.

Pré-requisitos
Antes de começar, você precisa ter todo o ambiente de desenvolvimento React Native (CLI) configurado. Caso não tenha, siga o guia oficial:

Guia de Configuração do Ambiente React Native

Instalação
Clone o repositório:

git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)

Acesse a pasta do projeto:

cd F1-Setup-Manager

Instale as dependências:

npm install

Configuração do Firebase
Para que o aplicativo se conecte ao Firebase, você precisa adicionar os arquivos de configuração do seu próprio projeto Firebase.

Acesse o Console do Firebase e crie um novo projeto (ou use um existente).

Para Android:

Adicione um app Android ao seu projeto Firebase.

Faça o download do arquivo google-services.json.

Mova o arquivo para a pasta android/app/ do seu projeto.

Para iOS:

Adicione um app iOS ao seu projeto Firebase.

Faça o download do arquivo GoogleService-Info.plist.

Abra a pasta ios no Xcode e arraste o arquivo .plist para a raiz do projeto.

Executando o Aplicativo
Para Android:
Certifique-se de que um emulador está em execução ou um dispositivo físico está conectado.

npx react-native run-android

Para iOS (apenas em macOS):

cd ios && pod install && cd ..
npx react-native run-ios

📂 Estrutura de Pastas
F1-Setup-Manager/
├── android/
├── ios/
├── src/
│   ├── assets/         # Imagens, fontes, etc.
│   ├── components/     # Componentes reutilizáveis (Button, Input, Card)
│   ├── navigation/     # Configuração de rotas e navegação
│   ├── screens/        # Telas do aplicativo (Login, Home, SetupDetails)
│   ├── services/       # Lógica de negócio e comunicação com Firebase
│   └── @types/         # Definições de tipos TypeScript
├── App.tsx             # Arquivo de entrada principal
└── ...                 # Outros arquivos de configuração

👨‍💻 Autor
[Seu Nome]

GitHub: https://github.com/seu-usuario