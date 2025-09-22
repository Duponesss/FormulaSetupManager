# Padrão de Commits do Projeto

Este documento estabelece o padrão para todas as mensagens de commit neste projeto. Seguir este guia garante um histórico de commits mais legível, organizado e fácil de navegar.

## Estrutura do Commit

Cada mensagem de commit deve seguir o seguinte formato:

```
:emoji: type(scope): subject
```

1.  **emoji**: Um emoji que representa visualmente a alteração.
2.  **type**: O tipo de alteração que o commit introduz (veja a tabela abaixo).
3.  **scope** (opcional): O escopo da alteração (ex: `auth`, `ui`, `home-screen`, `firebase`).
4.  **subject**: Uma descrição curta e imperativa da alteração, com a primeira letra maiúscula.

---

## Tabela de Tipos de Commit

Utilize a tabela abaixo para escolher o `emoji` e o `type` apropriados para sua alteração.

| Emoji | Type         | Descrição                                                                                               | Exemplo de Commit                                           |
| :---- | :----------- | :------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------- |
| ✨    | `feat`       | Adiciona uma nova funcionalidade (`feature`).                                                           | `✨ feat(auth): Adiciona login com Google`                   |
| 🐛    | `fix`        | Corrige um bug em produção ou desenvolvimento.                                                          | `🐛 fix(ui): Corrige quebra de layout no modal de perfil`    |
| 📚    | `docs`       | Adiciona ou atualiza a documentação do projeto.                                                         | `📚 docs: Adiciona o guia de padronização de commits`        |
| 💅    | `style`      | Altera a formatação do código, sem mudanças lógicas (linting, prettier, etc.).                          | `💅 style: Formata todos os arquivos com Prettier`          |
| ♻️    | `refactor`   | Refatora o código, sem adicionar funcionalidades ou corrigir bugs.                                       | `♻️ refactor(services): Simplifica a lógica do serviço de setups` |
| ⚡️    | `perf`       | Melhora o desempenho da aplicação.                                                                      | `⚡️ perf(list): Otimiza a renderização da lista de setups`    |
| ✅    | `test`       | Adiciona ou modifica testes (unitários, integração, e2e).                                               | `✅ test(auth): Adiciona testes para o fluxo de login`         |
| 📦    | `build`      | Altera arquivos de build, configuração ou dependências (npm, expo, etc.).                               | `📦 build: Atualiza a versão do Expo SDK para 55`           |
| 🔧    | `ci`         | Altera arquivos de configuração de CI/CD (GitHub Actions, etc.).                                        | `🔧 ci: Adiciona etapa de lint no workflow de build`         |
| 🧰    | `chore`      | Outras alterações que não modificam o código-fonte ou testes (configuração de ferramentas, etc.).       | `🧰 chore: Adiciona configuração do EditorConfig`            |
| ⏪    | `revert`     | Reverte um commit anterior.                                                                             | `⏪ revert: Reverte o commit "adiciona login com Google"`   |
| 🎉    | `initial`    | O primeiro commit do projeto. Usado apenas uma vez.                                                     | `🎉 initial: Adiciona a estrutura inicial do projeto`       |

---


## Corpo e Rodapé do Commit (Opcional)

Para commits mais complexos, você pode adicionar um corpo e um rodapé:

```
:emoji: type(scope): Subject curto aqui

Corpo opcional para explicar o "porquê" e o "como" da alteração,
com mais detalhes.

Rodapé opcional para referenciar issues ou breaking changes.
BREAKING CHANGE: O schema do usuário foi alterado.
Closes: #42
```

---