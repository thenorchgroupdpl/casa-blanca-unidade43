# ImageUploader Changes Needed

## Problema 1: Qualidade de imagem
- `getCroppedCanvas` usa `maxSize = 1200` para todos os contextos
- Para background/hero, precisa ser 1920px
- A qualidade do webp não é controlada aqui (é no backend via sharp)
- O `compressImage` usa `MAX_DIMENSION = 2000` e exporta como PNG (ok)

## Problema 2: Preview do background
- `BackgroundPreview` mostra uma caixinha pequena (aspect-video com max-w-xs)
- Para backgrounds, deveria simular tela cheia com object-cover
- Precisa expandir o preview para ocupar mais espaço

## Mudanças:
1. `getCroppedCanvas`: se context === 'background', maxSize = 1920
2. `BackgroundPreview`: simular tela cheia com proporção maior
3. Layout do cropper para background: preview mais largo, simulando tela
