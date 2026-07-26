# Traçado — plataforma de estudo de ECG

Beta de uma plataforma web gamificada para ensino de eletrocardiograma, com:

- aulas progressivas do básico ao avançado;
- exercícios com traçados esquemáticos autorais;
- pontuação e progressão por módulos;
- análise por habilidade;
- caderno de erros;
- recomendações adaptativas;
- revisão espaçada;
- progresso salvo no próprio navegador.

## Aviso

Esta plataforma possui finalidade exclusivamente educacional. Não deve ser
utilizada isoladamente para diagnóstico, tratamento ou tomada de decisão
clínica.

O projeto não contém gravações, slides, imagens, casos identificáveis ou
materiais copiados do curso utilizado como eixo pedagógico.

## Desenvolvimento

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

Para gerar a versão estática:

```bash
npm run build
```

O resultado é criado em `dist/` e pode ser publicado no GitHub Pages.

## Dados

O beta funciona sem servidor e salva o progresso no `localStorage` do
dispositivo. Por isso, o progresso do computador e do celular é independente.
