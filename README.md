# IMPERIVM

Jogo de cartas e decisões ambientado em Roma, para Android. Você escolhe uma origem (nômade, agricultor, soldado, herdeiro ou nobre), arrasta cartas para decidir, sobe de escravo a imperador, conquista províncias e passa o poder por três gerações. Você nunca morre: quando uma força zera ou estoura, você cai na hierarquia e a história continua.

Feito com Expo SDK 58 (React Native 0.88), Reanimated 4 e Gesture Handler 3. As animações rodam na thread nativa.

---

## Como instalar no celular

Você precisa do **Node.js 20 ou mais novo** no computador. Descompacte o projeto, abra um terminal na pasta e rode:

```bash
npm install
```

### Opção 1: APK instalável (recomendado)

Gera um `.apk` na nuvem da Expo, sem precisar do Android Studio. Conta gratuita.

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

Na primeira vez ele pergunta se pode criar o projeto na sua conta e gerar a chave de assinatura: responda **sim** para tudo. Ao terminar (uns 10 a 15 minutos), aparece um link e um QR code. Abra no celular, baixe o APK e instale (o Android vai pedir para permitir "instalar apps desconhecidos" do navegador).

### Opção 2: testar na hora com o Expo Go

1. Instale o app **Expo Go** pela Play Store.
2. No computador: `npx expo start`
3. Com o celular na mesma rede Wi-Fi, abra o Expo Go e escaneie o QR code.

Bom para testar e editar ao vivo. O jogo roda dentro do Expo Go, não como app separado.

### Opção 3: build local (Android Studio instalado)

```bash
npx expo run:android --variant release
```

---

## Como jogar

- **Arraste a carta** para a esquerda ou direita, ou toque nos nomes das escolhas abaixo dela.
- **Quatro forças**: Senado, Plebe, Legiões e Tesouro. Os pontos acima dos ícones mostram o que a escolha vai mexer (ponto grande, efeito forte).
- **Quedas**: se uma força chega a 0 ou 100, vem uma crise e você desce um degrau (cônsul vira senador, cidadão vira peregrino...). Também ganha uma cicatriz e perde legado.
- **Ascensão**: Escravo → Liberto → Peregrino → Cidadão → Équite → Senador → Cônsul → Imperador. As cartas de promoção aparecem quando você tem ouro, legado ou províncias suficientes.
- **Mapa**: marche contra províncias vizinhas. Cidades muradas (quadrado no mapa) pedem máquinas de cerco.
- **Legiões**: recrute tropas e adote reformas (Pilum, Testudo, Reforma de Mário, Águia de ouro...).
- **Dinastia**: aos 62 anos o herdeiro assume. Depois da 3ª geração a crônica termina.
- **Ranking**: do Bronze (Plebeu) ao Imperador Grão-Mestre (Imperator). Origens difíceis multiplicam o legado.

O jogo salva sozinho a cada carta. O ranking fica salvo no aparelho.

---

## Estrutura do projeto

```
App.tsx                    navegação entre telas, fontes, salvamento
src/game/types.ts          tipos (cartas, efeitos, estado)
src/game/cards.ts          TODAS as cartas (só dados, fácil de editar)
src/game/world.ts          origens, status, províncias, tropas, reformas, elos
src/game/engine.ts         regras: sorteio de cartas, quedas, batalhas, pontuação, ranking
src/game/storage.ts        salvamento local (AsyncStorage)
src/components/            carta com swipe, barras, medalhas, artes em SVG, efeitos
src/screens/               título, origem, jogo, mapa, legiões, crônica, ranking, fim
```

### Criar novas cartas

Adicione um objeto em `src/game/cards.ts`:

```ts
{
  id: 'minha_carta',
  minStatus: 3,              // só aparece para cidadãos ou acima
  eras: ['republica'],       // opcional
  who: 'Senador Túlio', role: 'orador', art: 'senate',
  text: 'Texto da situação...',
  left:  { label: 'Recusar', effect: { senado: -10, plebe: 5 } },
  right: { label: 'Aceitar', effect: { denarios: 80, trait: 'corrupto' } },
}
```

Efeitos possíveis: `senado`, `plebe`, `legioes`, `tesouro`, `denarios`, `legado`, `status` (+1 sobe, -1 cai), `trait`, `flag`/`unflag` (para encadear cartas), `monument`, `units`, `chronicle`, `next` (força a próxima carta).

Condições: `origins`, `eras`, `minStatus`, `maxStatus`, `requires`, `excludes`, `minTurn`, `minDenarios`, `minLegado`, `minProvinces`, `minStat`, `once`.

Artes disponíveis (`art`): laurel, senate, temple, sword, shield, helmet, coins, wheat, eagle, scroll, ship, fire, dagger, mask, wheel, arena, amphora, chains, crown, column, omen, family, road, fasces.

### Ajustar a dificuldade

Em `src/game/engine.ts`:
- `provinceDefense`: força dos inimigos (cresce com o tempo e com o tamanho do império).
- `income`: denários por carta.
- `armyCap`: limite de tropas.
- `expectedScore` e `prDelta`: quanto se ganha ou perde de PR por crônica.

---

## Próximos passos sugeridos

- Ranking online (backend que recebe as escolhas e recalcula a pontuação, para evitar trapaça).
- Trilha sonora e efeitos sonoros (`expo-audio`).
- Ilustrações pintadas para as cartas no lugar das artes vetoriais.
- Mais cartas por origem e eventos de cada era.
