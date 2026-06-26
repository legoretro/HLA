import Phaser from 'phaser';
import chapters from '../content/chapters.json';
import palette from '../content/palette.json';

const ACTION_RANGES = {
  idle: [0, 1, 2, 3],
  walk: [4, 5, 6, 7],
  talk: [8, 9, 10, 11],
  point: [12, 13, 14, 15],
  celebrate: [16, 17, 18, 19]
};

const PRESENTER_NAMES = {
  team: 'HLA Team',
  'scientist-1': 'Scientist 1',
  'scientist-2': 'Scientist 2',
  'scientist-3': 'Scientist 3',
  'scientist-4': 'Scientist 4'
};

const AUDIO_NOTES = [
  'Voiceover file map. Use these exact names.',
  'Upload inside: public/assets/audio/',
  '',
  '2  Scientist 1  General HLA',
  '   scientist-1/scene-02-general-hla.mp3',
  '3  Scientist 1  Class I vs Class II',
  '   scientist-1/scene-03-class-i-class-ii.mp3',
  '4  Scientist 2  Alleles and inheritance',
  '   scientist-2/scene-04-alleles-inheritance.mp3',
  '5  Scientist 2  Six-allele teaching model',
  '   scientist-2/scene-05-six-allele-model.mp3',
  '6  Scientist 3  Samples, DNA, PCR',
  '   scientist-3/scene-06-dna-pcr.mp3',
  '7A Scientist 3  PCR-SSP',
  '   scientist-3/scene-07-pcr-ssp.mp3',
  '7B Scientist 3  Other Methods popup',
  '   scientist-3/scene-07-other-methods.mp3',
  '8  Scientist 4  Final report',
  '   scientist-4/scene-08-final-report.mp3',
  '',
  'The chapters.json audio path must match the file exactly.',
  'Uploading to main needs a gh-pages rebuild before it is live.'
].join('\n');

const toColor = value => Phaser.Display.Color.HexStringToColor(value).color;

export default class LessonScene extends Phaser.Scene {
  constructor() {
    super('LessonScene');
    this.currentIndex = 0;
    this.maxUnlocked = Math.min(
      Number(localStorage.getItem('hlaQuestMaxUnlocked') || 0),
      chapters.length - 1
    );
    this.dynamicObjects = [];
    this.dynamicDomObjects = [];
    this.modalObjects = [];
    this.modalDomObjects = [];
    this.interactionDone = false;
    this.activeAudio = null;
  }

  create() {
    this.createAnimations();
    this.renderChapter(this.currentIndex);
  }

  createAnimations() {
    for (let n = 1; n <= 4; n += 1) {
      Object.entries(ACTION_RANGES).forEach(([name, frames]) => {
        const key = `scientist-${n}-${name}`;
        if (!this.anims.exists(key)) {
          this.anims.create({
            key,
            frames: frames.map(frame => ({ key: `scientist-${n}-sheet`, frame })),
            frameRate: name === 'walk' ? 8 : 4,
            repeat: -1
          });
        }
      });
    }
  }

  clearDynamic() {
    this.dynamicObjects.forEach(obj => obj?.destroy?.());
    this.dynamicObjects = [];
    this.dynamicDomObjects.forEach(obj => obj?.destroy?.());
    this.dynamicDomObjects = [];
    this.closeModal(false);
  }

  addDynamic(obj) {
    this.dynamicObjects.push(obj);
    return obj;
  }

  addSharpText(x, y, text, style = {}) {
    const sharpStyle = {
      fontFamily: 'Arial, Helvetica, sans-serif',
      ...style
    };
    const object = this.add.text(x, y, text, sharpStyle);
    object.setPadding?.(2, 1, 2, 1);
    return object;
  }

  renderChapter(index) {
    this.stopAudio();
    this.clearDynamic();
    this.currentIndex = Phaser.Math.Clamp(index, 0, chapters.length - 1);
    this.maxUnlocked = Phaser.Math.Clamp(this.maxUnlocked, 0, chapters.length - 1);
    const chapter = chapters[this.currentIndex];
    this.interactionDone = false;

    this.drawBackground(chapter.background);
    this.drawHeader(chapter);
    this.drawCards(chapter.cards || []);
    this.drawProps(chapter.props || []);
    this.drawMedia(chapter.media || []);
    this.drawCharacters(chapter.characters || [], chapter.presenter);
    this.drawDialogue(chapter);
    this.drawInfoIcons(chapter.infoPopups || []);
    this.drawInteraction(chapter.interaction);
    this.drawQuestPath();
    this.drawBackButton();
    this.drawNextButton();
  }

  drawBackground(key) {
    if (this.textures.exists(key)) {
      this.addDynamic(this.add.image(640, 360, key).setDisplaySize(1280, 720).setDepth(0));
    } else {
      this.addDynamic(this.add.rectangle(640, 360, 1280, 720, 0x0F1732).setDepth(0));
      this.addDynamic(this.addSharpText(640, 320, `Missing background: ${key}`, {
        fontFamily: 'Courier New',
        fontSize: '28px',
        color: palette.white
      }).setOrigin(0.5).setDepth(1));
    }

    this.addDynamic(this.add.rectangle(640, 294, 1280, 420, 0x0F1732, 0.05).setDepth(1));
  }

  drawHeader(chapter) {
    const g = this.addDynamic(this.add.graphics().setDepth(20));
    g.fillStyle(toColor(palette.navy), 0.98).fillRect(0, 0, 1280, 84);
    g.lineStyle(4, toColor(palette.purple)).strokeRect(4, 4, 1272, 76);

    this.addDynamic(this.add.rectangle(140, 42, 210, 72, 0x080D21, 1)
      .setStrokeStyle(2, 0x685680).setDepth(21));
    this.addDynamic(this.addSharpText(68, 10, 'HLA', {
      fontFamily: 'Courier New',
      fontSize: '42px',
      fontStyle: 'bold',
      color: palette.pink
    }).setDepth(22));
    this.addDynamic(this.addSharpText(69, 43, 'QUEST', {
      fontFamily: 'Courier New',
      fontSize: '30px',
      fontStyle: 'bold',
      color: palette.gold
    }).setDepth(22));
    this.addDynamic(this.addSharpText(66, 69, 'LEARN. MATCH. SAVE LIVES.', {
      fontFamily: 'Courier New',
      fontSize: '8px',
      fontStyle: 'bold',
      color: palette.white
    }).setDepth(22));
    this.addDynamic(this.addSharpText(188, 15, 'X', {
      fontFamily: 'Courier New',
      fontSize: '42px',
      color: palette.cyan
    }).setDepth(22));
    this.addDynamic(this.addSharpText(198, 15, 'X', {
      fontFamily: 'Courier New',
      fontSize: '42px',
      color: palette.pink
    }).setDepth(22));
    this.addDynamic(this.addSharpText(330, 18, `SCENE ${chapter.number} OF ${chapters.length}`, {
      fontFamily: 'Courier New',
      fontSize: '18px',
      fontStyle: 'bold',
      color: palette.gold
    }).setDepth(21));
    this.addDynamic(this.addSharpText(330, 43, chapter.title.toUpperCase(), {
      fontFamily: 'Courier New',
      fontSize: this.fitFont(chapter.title.toUpperCase(), 290, 26, 15),
      fontStyle: 'bold',
      color: palette.white
    }).setDepth(21));

    const presenterName = PRESENTER_NAMES[chapter.presenter] || chapter.dialogue?.speaker || 'Presenter';
    this.addDynamic(this.add.rectangle(760, 42, 245, 50, 0x222647)
      .setStrokeStyle(2, toColor(palette.lavender)).setDepth(21));
    if (this.textures.exists(chapter.presenter)) {
      this.addDynamic(this.add.image(650, 46, chapter.presenter).setDisplaySize(42, 58).setDepth(22));
    } else {
      this.addDynamic(this.addSharpText(650, 46, '4', {
        fontFamily: 'Courier New',
        fontSize: '28px',
        fontStyle: 'bold',
        color: palette.gold
      }).setOrigin(0.5).setDepth(22));
    }
    this.addDynamic(this.addSharpText(684, 30, 'PRESENTER', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: palette.cream
    }).setDepth(22));
    this.addDynamic(this.addSharpText(684, 47, presenterName.toUpperCase(), {
      fontFamily: 'Courier New',
      fontSize: '17px',
      fontStyle: 'bold',
      color: palette.white
    }).setDepth(22));

    ['GLOSSARY', 'NOTES', 'RESET'].forEach((label, i) => {
      const x = 960 + i * 102;
      const box = this.addDynamic(this.add.rectangle(x, 42, 92, 50, 0x222647, 1)
        .setStrokeStyle(2, 0x685680).setInteractive({ useHandCursor: true }).setDepth(21));
      this.addDynamic(this.addSharpText(x, 42, label, {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: palette.white
      }).setOrigin(0.5).setDepth(22));
      box.on('pointerdown', () => this.openUtilityModal(label));
    });
  }

  drawCards(cards) {
    cards.forEach(card => {
      const width = card.width || 320;
      const height = card.height || 110;
      const x = card.x || 640;
      const y = card.y || 240;
      const depth = card.depth ?? 4;
      if (card.panel) {
        const panel = this.addDynamic(this.add.rectangle(x, y, width, height, 0x111735, 0.78)
          .setStrokeStyle(2, toColor(palette.lavender)).setDepth(depth));
        panel.setOrigin(0.5);
      }

      const titleY = card.text ? y - 18 : y;
      this.addDynamic(this.addSharpText(x, titleY, card.title || '', {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.fitFont(card.title || '', width - 18, 30, 18),
        fontStyle: 'bold',
        color: palette.white,
        align: 'center',
        stroke: '#080D21',
        strokeThickness: 5,
        shadow: { offsetX: 2, offsetY: 3, color: '#080D21', blur: 4, fill: true },
        wordWrap: { width: width - 18 }
      }).setOrigin(0.5).setDepth(depth + 1));

      if (card.text) {
        this.addDynamic(this.addSharpText(x, y + 21, card.text, {
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: this.fitFont(card.text, width - 20, 19, 14),
          color: palette.cream,
          align: 'center',
          stroke: '#080D21',
          strokeThickness: 4,
          shadow: { offsetX: 2, offsetY: 2, color: '#080D21', blur: 3, fill: true },
          lineSpacing: 4,
          wordWrap: { width: width - 20 }
        }).setOrigin(0.5, 0).setDepth(depth + 1));
      }
    });
  }

  drawProps(props) {
    props.forEach(prop => {
      if (this.textures.exists(prop.asset)) {
        this.addDynamic(this.add.image(prop.x, prop.y, prop.asset)
          .setScale(prop.scale ?? 1)
          .setDepth(prop.depth ?? 3));
        return;
      }

      this.addDynamic(this.add.rectangle(prop.x, prop.y, 170, 55, 0x222647, 0.92)
        .setStrokeStyle(2, toColor(palette.pink)).setDepth(prop.depth ?? 3));
      this.addDynamic(this.addSharpText(prop.x, prop.y, `Missing: ${prop.asset}`, {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: palette.white,
        align: 'center',
        wordWrap: { width: 150 }
      }).setOrigin(0.5).setDepth((prop.depth ?? 3) + 1));
    });
  }

  drawMedia(mediaItems) {
    mediaItems.forEach(media => {
      const element = this.createMediaElement(media);
      if (!element) return;
      const width = media.width || 420;
      const height = media.height || 240;
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
      element.style.pointerEvents = media.type === 'youtube' ? 'auto' : 'none';
      const dom = this.add.dom(media.x || 640, media.y || 270, element)
        .setOrigin(0.5)
        .setDepth(media.depth ?? 12);
      this.dynamicDomObjects.push(dom);
    });
  }

  createMediaElement(media = {}) {
    const src = this.resolvePublicPath(media.src || media.image || media.youtube || '');
    const frame = document.createElement('div');
    frame.className = 'hla-media-frame';

    if (media.type === 'youtube') {
      const embed = this.resolveYoutubeEmbedUrl(media.youtube || media.src || '');
      if (!embed) {
        const placeholder = document.createElement('div');
        placeholder.style.display = 'grid';
        placeholder.style.placeItems = 'center';
        placeholder.style.width = '100%';
        placeholder.style.height = '100%';
        placeholder.style.padding = '18px';
        placeholder.style.textAlign = 'center';
        placeholder.style.font = 'bold 20px Arial, Helvetica, sans-serif';
        placeholder.style.color = '#241B32';
        placeholder.textContent = 'Add YouTube URL in Author Mode';
        frame.appendChild(placeholder);
        return frame;
      }
      const iframe = document.createElement('iframe');
      iframe.src = embed;
      iframe.title = media.title || 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      frame.appendChild(iframe);
      return frame;
    }

    if (!src) return null;
    const image = document.createElement('img');
    image.src = src;
    image.alt = media.title || 'Uploaded HLA image';
    frame.appendChild(image);
    return frame;
  }

  drawCharacters(characters, presenter) {
    characters.forEach((character, i) => {
      const active = presenter !== 'team' && character.asset === presenter;
      const texture = this.textures.get(character.asset);
      const source = texture?.getSourceImage?.();
      const displayHeight = character.displayHeight ?? (character.scale ?? (active ? 0.9 : 0.8)) * 270;
      const displayWidth = source?.height ? (source.width / source.height) * displayHeight : displayHeight * 0.45;
      const startHeight = active ? Math.round(displayHeight * 0.84) : displayHeight;
      const startWidth = source?.height ? (source.width / source.height) * startHeight : startHeight * 0.45;
      const sprite = this.addDynamic(this.add.image(character.x - 48, character.y, character.asset)
        .setOrigin(0.5, 1)
        .setDisplaySize(startWidth, startHeight)
        .setDepth(character.depth ?? (active ? 7 : 5)));
      this.tweens.add({ targets: sprite, x: character.x, duration: 360 + i * 80, ease: 'Sine.Out' });
      if (active) {
        this.tweens.add({
          targets: sprite,
          displayWidth,
          displayHeight,
          duration: 430,
          ease: 'Back.Out'
        });
      }

      if (active) {
        this.addDynamic(this.add.ellipse(character.x, character.y + 4, 96, 20, 0xF250AA, 0.38).setDepth(4));
      }

      this.applyCharacterAction(sprite, character.action || 'idle', active);
    });
  }

  applyCharacterAction(sprite, action, active) {
    if (action === 'talk') {
      this.tweens.add({ targets: sprite, y: sprite.y - 4, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    } else if (action === 'point') {
      this.tweens.add({ targets: sprite, angle: active ? 1.5 : 0.8, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    } else if (action === 'celebrate') {
      this.tweens.add({ targets: sprite, y: sprite.y - 8, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    } else if (action === 'walk') {
      this.tweens.add({ targets: sprite, x: sprite.x + 8, duration: 540, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    } else if (active) {
      this.tweens.add({ targets: sprite, y: sprite.y - 2, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
  }

  drawDialogue(chapter) {
    const g = this.addDynamic(this.add.graphics().setDepth(30));
    g.fillStyle(0xFFF6FF, 0.94).fillRoundedRect(92, 492, 820, 114, 14);
    g.lineStyle(4, 0x685680, 1).strokeRoundedRect(92, 492, 820, 114, 14);
    if (this.textures.exists(chapter.presenter)) {
      this.addDynamic(this.add.image(170, 600, chapter.presenter).setOrigin(0.5, 1).setDisplaySize(78, 108).setDepth(31));
    } else {
      ['scientist-1', 'scientist-2', 'scientist-3', 'scientist-4'].forEach((asset, index) => {
        this.addDynamic(this.add.image(124 + index * 35, 596, asset).setOrigin(0.5, 1).setDisplaySize(36, 50).setDepth(31));
      });
    }
    this.addDynamic(this.add.rectangle(345, 510, 225, 30, 0x685680).setDepth(31));
    this.addDynamic(this.addSharpText(345, 510, (chapter.dialogue?.speaker || 'Presenter').toUpperCase(), {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: this.fitFont((chapter.dialogue?.speaker || 'Presenter').toUpperCase(), 205, 17, 12),
      fontStyle: 'bold',
      color: palette.white
    }).setOrigin(0.5).setDepth(32));
    this.addDynamic(this.addSharpText(250, 533, chapter.dialogue?.text || '', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '18px',
      color: palette.ink,
      wordWrap: { width: 610 },
      lineSpacing: 4
    }).setDepth(32));
  }

  drawInfoIcons(infoPopups) {
    infoPopups.forEach((info, index) => {
      const x = info.x ?? (990 + index * 72);
      const y = info.y ?? 245;
      const ring = this.addDynamic(this.add.circle(x, y, 27, 0xF8C646, 0.9)
        .setStrokeStyle(4, 0xF250AA).setDepth(15));
      const icon = this.addDynamic(this.add.image(x, y, 'info-icon').setScale(0.38).setDepth(16)
        .setInteractive({ useHandCursor: true }));
      ring.setInteractive({ useHandCursor: true });
      if (infoPopups.length > 1) {
        this.addDynamic(this.addSharpText(x + 20, y - 24, String(index + 1), {
          fontFamily: 'Courier New',
          fontSize: '13px',
          fontStyle: 'bold',
          color: palette.ink
        }).setOrigin(0.5).setDepth(17));
      }
      this.tweens.add({ targets: ring, scale: 1.08, duration: 700, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: icon, scale: 0.44, duration: 700, yoyo: true, repeat: -1 });
      const open = () => this.openInfoModal(info);
      icon.on('pointerdown', open);
      ring.on('pointerdown', open);
    });
  }

  drawQuestPath() {
    const g = this.addDynamic(this.add.graphics().setDepth(40));
    g.fillStyle(0x0F1732, 0.99).fillRoundedRect(4, 618, 1272, 98, 18);
    g.lineStyle(3, 0x685680).strokeRoundedRect(4, 618, 1272, 98, 18);

    const startX = 92;
    const gap = chapters.length > 1 ? 1096 / (chapters.length - 1) : 0;
    chapters.forEach((chapter, i) => {
      const x = startX + i * gap;
      const unlocked = i <= this.maxUnlocked || i <= this.currentIndex;
      const completed = i < this.currentIndex || i < this.maxUnlocked;

      if (i < chapters.length - 1) {
        const nextX = startX + (i + 1) * gap;
        for (let dotX = x + 38; dotX < nextX - 34; dotX += 16) {
          g.fillStyle(unlocked ? 0xC9968F : 0x444760, 1).fillCircle(dotX, 654, 3);
        }
      }

      const fill = i === this.currentIndex ? 0x685680 : 0x222647;
      const stroke = i === this.currentIndex ? 0xF250AA : unlocked ? 0x887E94 : 0x444760;
      const circle = this.addDynamic(this.add.circle(x, 654, i === this.currentIndex ? 31 : 27, fill, unlocked ? 1 : 0.6)
        .setStrokeStyle(i === this.currentIndex ? 5 : 3, stroke).setDepth(42));
      const icon = this.addDynamic(this.add.image(x, 654, chapter.timelineIcon).setDisplaySize(43, 43).setDepth(43));

      if (unlocked) {
        circle.setInteractive({ useHandCursor: true });
        icon.setInteractive({ useHandCursor: true });
        const go = () => this.renderChapter(i);
        circle.on('pointerdown', go);
        icon.on('pointerdown', go);
      } else {
        circle.setAlpha(0.45);
        icon.setAlpha(0.32);
      }

      this.addDynamic(this.addSharpText(x, 686, chapter.shortLabel, {
        fontFamily: 'Courier New',
        fontSize: '12px',
        fontStyle: i === this.currentIndex ? 'bold' : '',
        align: 'center',
        color: i === this.currentIndex ? palette.pink : palette.white,
        wordWrap: { width: 118 }
      }).setOrigin(0.5, 0).setDepth(43));

      if (completed) {
        this.addDynamic(this.add.circle(x + 21, 633, 9, 0x58D36D).setDepth(44));
        this.addDynamic(this.addSharpText(x + 21, 633, '✓', {
          fontFamily: 'Courier New',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#ffffff'
        }).setOrigin(0.5).setDepth(45));
      }
    });
  }

  drawBackButton() {
    const disabled = this.currentIndex === 0;
    const button = this.addDynamic(this.add.rectangle(1024, 557, 118, 70, disabled ? 0x444760 : 0x222647)
      .setStrokeStyle(4, disabled ? 0x685680 : 0x55D6F5).setDepth(50));
    this.addDynamic(this.addSharpText(1024, 557, 'BACK', {
      fontFamily: 'Courier New',
      fontSize: '22px',
      fontStyle: 'bold',
      color: disabled ? '#A8A8B8' : palette.white
    }).setOrigin(0.5).setDepth(51));

    if (!disabled) {
      button.setInteractive({ useHandCursor: true });
      button.on('pointerover', () => button.setScale(1.03));
      button.on('pointerout', () => button.setScale(1));
      button.on('pointerdown', () => this.renderChapter(this.currentIndex - 1));
    }
  }

  drawNextButton() {
    const label = this.currentIndex === chapters.length - 1 ? 'RESTART' : 'NEXT >';
    const button = this.addDynamic(this.add.rectangle(1184, 557, 150, 78, 0xF8C646)
      .setStrokeStyle(5, 0xA45E00).setInteractive({ useHandCursor: true }).setDepth(50));
    this.addDynamic(this.addSharpText(1184, 557, label, {
      fontFamily: 'Courier New',
      fontSize: label === 'RESTART' ? '21px' : '25px',
      fontStyle: 'bold',
      color: palette.ink
    }).setOrigin(0.5).setDepth(51));
    button.on('pointerover', () => button.setScale(1.03));
    button.on('pointerout', () => button.setScale(1));
    button.on('pointerdown', () => {
      if (this.currentIndex === chapters.length - 1) {
        this.maxUnlocked = 0;
        localStorage.setItem('hlaQuestMaxUnlocked', '0');
        this.renderChapter(0);
        return;
      }
      this.maxUnlocked = Math.max(this.maxUnlocked, this.currentIndex + 1);
      localStorage.setItem('hlaQuestMaxUnlocked', String(this.maxUnlocked));
      this.renderChapter(this.currentIndex + 1);
    });
  }

  drawInteraction(interaction) {
    if (!interaction) return;
    const button = this.addDynamic(this.add.rectangle(1062, 455, 250, 52, 0x58D36D)
      .setStrokeStyle(3, 0x286F3C).setInteractive({ useHandCursor: true }).setDepth(18));
    const text = this.addDynamic(this.addSharpText(1062, 455, interaction.button || 'RUN', {
      fontFamily: 'Courier New',
      fontSize: this.fitFont(interaction.button || 'RUN', 220, 17, 12),
      fontStyle: 'bold',
      color: '#102218'
    }).setOrigin(0.5).setDepth(19));

    button.on('pointerdown', () => {
      if (this.interactionDone) return;
      this.interactionDone = true;
      button.disableInteractive().setFillStyle(0x444760);
      text.setText(interaction.type === 'compare' ? 'COMPARING...' : 'RUNNING...');
      const bar = this.addDynamic(this.add.rectangle(937, 488, 0, 12, 0x55D6F5).setOrigin(0, 0.5).setDepth(19));
      this.addDynamic(this.add.rectangle(1062, 488, 250, 16, 0x222647).setDepth(18));
      this.tweens.add({
        targets: bar,
        width: 250,
        duration: 950,
        onComplete: () => {
          text.setText(interaction.type === 'final' ? 'SENT' : 'COMPLETE');
          this.addDynamic(this.addSharpText(1062, 512, interaction.result || '', {
            fontFamily: 'Courier New',
            fontSize: '13px',
            color: palette.white,
            align: 'center',
            wordWrap: { width: 275 }
          }).setOrigin(0.5).setDepth(19));
        }
      });
    });
  }

  openInfoModal(info) {
    this.stopAudio();
    this.closeModal(false);
    this.setSceneMediaVisible(false);

    const shade = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.58).setOrigin(0).setDepth(100).setInteractive();
    const hasMedia = Boolean(info.image || info.src || info.youtube);
    const panel = this.add.rectangle(640, 360, 1040, 520, 0xFFF6FF).setStrokeStyle(6, 0x685680).setDepth(101);
    const portraitKey = info.speaker || `scientist-${Math.floor(this.currentIndex / 2) + 1}`;
    const portrait = this.add.image(225, 300, portraitKey).setDisplaySize(90, 124).setDepth(102);
    const title = this.addSharpText(640, 132, info.title || 'Info', {
      fontFamily: 'Courier New',
      fontSize: this.fitFont(info.title || 'Info', 860, 30, 18),
      fontStyle: 'bold',
      color: palette.ink,
      align: 'center',
      wordWrap: { width: 860 }
    }).setOrigin(0.5).setDepth(102);

    if (hasMedia) {
      const media = this.createMediaElement({
        type: info.youtube ? 'youtube' : 'image',
        src: info.image || info.src,
        youtube: info.youtube,
        title: info.title
      });
      if (media) {
        media.style.width = '450px';
        media.style.height = '254px';
        media.style.pointerEvents = info.youtube ? 'auto' : 'none';
        const mediaDom = this.add.dom(800, 315, media).setOrigin(0.5).setDepth(103);
        this.modalDomObjects.push(mediaDom);
      }
    }

    const caption = this.addSharpText(hasMedia ? 330 : 640, 286, info.text || 'Add a short caption here.', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: hasMedia ? '19px' : '23px',
      color: palette.ink,
      align: 'left',
      lineSpacing: 6,
      wordWrap: { width: hasMedia ? 220 : 660 }
    }).setOrigin(hasMedia ? 0 : 0.5, 0.5).setDepth(102);

    const status = this.addSharpText(640, 460, this.audioStatus(info.audio), {
      fontFamily: 'Courier New',
      fontSize: '13px',
      color: palette.purple,
      align: 'center',
      wordWrap: { width: 810 }
    }).setOrigin(0.5).setDepth(102);

    this.modalObjects = [shade, panel, portrait, title, caption, status];
    const audio = this.makeAudio(info.audio, status);
    const buttons = [
      ['PLAY', 410, () => this.playAudio(audio, status)],
      ['PAUSE', 520, () => this.pauseAudio(audio, status)],
      ['REPLAY', 640, () => this.replayAudio(audio, status)],
      ['MUTE', 760, (_button, label) => this.toggleMute(audio, status, label)]
    ];

    buttons.forEach(([label, x, handler]) => this.addModalButton(x, 505, label, handler));

    const close = this.addSharpText(640, 590, '[ CLOSE ]', {
      fontFamily: 'Courier New',
      fontSize: '21px',
      fontStyle: 'bold',
      color: palette.purple
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);
    this.modalObjects.push(close);

    shade.on('pointerdown', () => this.closeModal(true));
    close.on('pointerdown', () => this.closeModal(true));
  }

  addModalButton(x, y, label, handler) {
    const button = this.add.rectangle(x, y, 92, 42, 0x222647).setStrokeStyle(2, 0x685680)
      .setInteractive({ useHandCursor: true }).setDepth(102);
    const text = this.addSharpText(x, y, label, {
      fontFamily: 'Courier New',
      fontSize: '15px',
      fontStyle: 'bold',
      color: palette.white
    }).setOrigin(0.5).setDepth(103);
    button.on('pointerover', () => button.setFillStyle(0x383B65));
    button.on('pointerout', () => button.setFillStyle(0x222647));
    button.on('pointerdown', () => handler(button, text));
    this.modalObjects.push(button, text);
  }

  makeAudio(path, status) {
    const src = this.resolveAudioPath(path);
    if (!src) return null;
    try {
      const audio = new Audio(src);
      audio.preload = 'metadata';
      audio.addEventListener('ended', () => status.setText('Audio ended. Captions remain visible.'));
      audio.addEventListener('error', () => status.setText('Audio file not found yet. Captions remain visible.'));
      this.activeAudio = audio;
      return audio;
    } catch {
      status.setText('Audio could not be prepared. Captions remain visible.');
      return null;
    }
  }

  resolveAudioPath(path) {
    return this.resolvePublicPath(path);
  }

  resolvePublicPath(path) {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    const base = import.meta.env.BASE_URL || './';
    if (path.startsWith('/assets/')) return `${base}${path.slice(1)}`;
    if (path.startsWith('assets/')) return `${base}${path}`;
    return path;
  }

  resolveYoutubeEmbedUrl(url) {
    if (!url) return '';
    if (/youtube\.com\/embed\//.test(url)) return url;
    const idMatch = String(url).match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/);
    if (!idMatch) return '';
    return `https://www.youtube-nocookie.com/embed/${idMatch[1]}?rel=0&modestbranding=1`;
  }

  audioStatus(path) {
    return path ? `Audio: ${path}` : 'No audio path set. Captions remain visible.';
  }

  playAudio(audio, status) {
    if (!audio) {
      status.setText('No audio file is attached yet. Captions remain visible.');
      return;
    }
    audio.play()
      .then(() => status.setText('Playing audio. Captions remain visible.'))
      .catch(() => status.setText('Audio file not available yet. Captions remain visible.'));
  }

  pauseAudio(audio, status) {
    if (!audio) {
      status.setText('No audio file is attached yet. Captions remain visible.');
      return;
    }
    audio.pause();
    status.setText('Paused. Captions remain visible.');
  }

  replayAudio(audio, status) {
    if (!audio) {
      status.setText('No audio file is attached yet. Captions remain visible.');
      return;
    }
    audio.currentTime = 0;
    this.playAudio(audio, status);
  }

  toggleMute(audio, status, label) {
    if (!audio) {
      status.setText('No audio file is attached yet. Captions remain visible.');
      return;
    }
    audio.muted = !audio.muted;
    label.setText(audio.muted ? 'UNMUTE' : 'MUTE');
    status.setText(audio.muted ? 'Muted. Captions remain visible.' : 'Unmuted. Captions remain visible.');
  }

  stopAudio() {
    if (!this.activeAudio) return;
    this.activeAudio.pause();
    this.activeAudio.currentTime = 0;
    this.activeAudio = null;
  }

  openUtilityModal(label) {
    if (label === 'RESET') {
      localStorage.removeItem('hlaQuestMaxUnlocked');
      this.maxUnlocked = 0;
      this.renderChapter(0);
      return;
    }

    const content = {
      GLOSSARY: 'HLA: human leukocyte antigen\nMHC: major histocompatibility complex\nAllele: a gene version\nHaplotype: linked HLA alleles inherited from one parent\nCrossmatch: donor-recipient immune reactivity test',
      NOTES: AUDIO_NOTES
    }[label] || '';

    this.stopAudio();
    this.closeModal(false);
    this.setSceneMediaVisible(false);
    const shade = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.55).setOrigin(0).setDepth(100).setInteractive();
    const isNotes = label === 'NOTES';
    const panel = this.add.rectangle(640, 360, isNotes ? 980 : 760, isNotes ? 520 : 335, 0xFFF6FF).setStrokeStyle(6, 0x685680).setDepth(101);
    const title = this.addSharpText(640, isNotes ? 130 : 245, label, {
      fontFamily: 'Courier New',
      fontSize: '30px',
      fontStyle: 'bold',
      color: palette.ink
    }).setOrigin(0.5).setDepth(102);
    const body = this.addSharpText(isNotes ? 185 : 640, isNotes ? 185 : 350, content, {
      fontFamily: 'Courier New',
      fontSize: isNotes ? '16px' : '21px',
      color: palette.ink,
      align: isNotes ? 'left' : 'center',
      lineSpacing: isNotes ? 2 : 0,
      wordWrap: { width: isNotes ? 900 : 650 }
    }).setOrigin(isNotes ? 0 : 0.5, isNotes ? 0 : 0.5).setDepth(102);
    const close = this.addSharpText(640, isNotes ? 585 : 475, '[ CLOSE ]', {
      fontFamily: 'Courier New',
      fontSize: '21px',
      fontStyle: 'bold',
      color: palette.purple
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

    this.modalObjects = [shade, panel, title, body, close];
    shade.on('pointerdown', () => this.closeModal(true));
    close.on('pointerdown', () => this.closeModal(true));
  }

  closeModal(shouldStopAudio = true) {
    if (shouldStopAudio) this.stopAudio();
    this.modalDomObjects.forEach(obj => obj?.destroy?.());
    this.modalDomObjects = [];
    this.modalObjects.forEach(obj => obj?.destroy?.());
    this.modalObjects = [];
    this.setSceneMediaVisible(true);
  }

  setSceneMediaVisible(visible) {
    this.dynamicDomObjects.forEach(obj => {
      obj?.setVisible?.(visible);
      if (obj?.node?.style) {
        obj.node.style.display = visible ? '' : 'none';
        obj.node.style.visibility = visible ? 'visible' : 'hidden';
      }
    });
  }

  fitFont(text, width, maxSize, minSize) {
    const value = String(text || '');
    const longestWord = value.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), '');
    const longestLine = value.split('\n').reduce((a, b) => (b.length > a.length ? b : a), '');
    const measure = Math.max(longestWord.length, Math.min(longestLine.length, 28));
    if (!measure) return `${maxSize}px`;
    const estimate = measure * maxSize * 0.62;
    if (estimate <= width) return `${maxSize}px`;
    return `${Math.max(minSize, Math.floor(width / (measure * 0.62)))}px`;
  }
}
