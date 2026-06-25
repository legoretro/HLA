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
  'scientist-1': 'Scientist 1',
  'scientist-2': 'Scientist 2',
  'scientist-3': 'Scientist 3',
  'scientist-4': 'Scientist 4'
};

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
    this.modalObjects = [];
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
    this.closeModal(false);
  }

  addDynamic(obj) {
    this.dynamicObjects.push(obj);
    return obj;
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
      this.addDynamic(this.add.text(640, 320, `Missing background: ${key}`, {
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
    this.addDynamic(this.add.text(68, 10, 'HLA', {
      fontFamily: 'Courier New',
      fontSize: '42px',
      fontStyle: 'bold',
      color: palette.pink
    }).setDepth(22));
    this.addDynamic(this.add.text(69, 43, 'QUEST', {
      fontFamily: 'Courier New',
      fontSize: '30px',
      fontStyle: 'bold',
      color: palette.gold
    }).setDepth(22));
    this.addDynamic(this.add.text(66, 69, 'LEARN. MATCH. SAVE LIVES.', {
      fontFamily: 'Courier New',
      fontSize: '8px',
      fontStyle: 'bold',
      color: palette.white
    }).setDepth(22));
    this.addDynamic(this.add.text(188, 15, 'X', {
      fontFamily: 'Courier New',
      fontSize: '42px',
      color: palette.cyan
    }).setDepth(22));
    this.addDynamic(this.add.text(198, 15, 'X', {
      fontFamily: 'Courier New',
      fontSize: '42px',
      color: palette.pink
    }).setDepth(22));
    this.addDynamic(this.add.text(330, 18, `SCENE ${chapter.number} OF ${chapters.length}`, {
      fontFamily: 'Courier New',
      fontSize: '18px',
      fontStyle: 'bold',
      color: palette.gold
    }).setDepth(21));
    this.addDynamic(this.add.text(330, 43, chapter.title.toUpperCase(), {
      fontFamily: 'Courier New',
      fontSize: '26px',
      fontStyle: 'bold',
      color: palette.white
    }).setDepth(21));

    const presenterName = PRESENTER_NAMES[chapter.presenter] || chapter.dialogue?.speaker || 'Presenter';
    this.addDynamic(this.add.rectangle(760, 42, 245, 50, 0x222647)
      .setStrokeStyle(2, toColor(palette.lavender)).setDepth(21));
    this.addDynamic(this.add.image(650, 46, chapter.presenter).setDisplaySize(42, 58).setDepth(22));
    this.addDynamic(this.add.text(684, 30, 'PRESENTER', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: palette.cream
    }).setDepth(22));
    this.addDynamic(this.add.text(684, 47, presenterName.toUpperCase(), {
      fontFamily: 'Courier New',
      fontSize: '17px',
      fontStyle: 'bold',
      color: palette.white
    }).setDepth(22));

    ['GLOSSARY', 'NOTES', 'RESET'].forEach((label, i) => {
      const x = 960 + i * 102;
      const box = this.addDynamic(this.add.rectangle(x, 42, 92, 50, 0x222647, 1)
        .setStrokeStyle(2, 0x685680).setInteractive({ useHandCursor: true }).setDepth(21));
      this.addDynamic(this.add.text(x, 42, label, {
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
      const panel = this.addDynamic(this.add.rectangle(x, y, width, height, 0xFFF6FF, 0.92)
        .setStrokeStyle(4, toColor(palette.purple)).setDepth(depth));
      panel.setOrigin(0.5);

      this.addDynamic(this.add.text(x, y - height / 2 + 14, card.title || '', {
        fontFamily: 'Courier New',
        fontSize: this.fitFont(card.title || '', width - 28, 20, 13),
        fontStyle: 'bold',
        color: palette.ink,
        align: 'center',
        wordWrap: { width: width - 28 }
      }).setOrigin(0.5, 0).setDepth(depth + 1));

      if (card.text) {
        this.addDynamic(this.add.text(x, y - height / 2 + 45, card.text, {
          fontFamily: 'Courier New',
          fontSize: this.fitFont(card.text, width - 32, 17, 12),
          color: palette.ink,
          align: 'center',
          lineSpacing: 4,
          wordWrap: { width: width - 32 }
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
      this.addDynamic(this.add.text(prop.x, prop.y, `Missing: ${prop.asset}`, {
        fontFamily: 'Courier New',
        fontSize: '13px',
        color: palette.white,
        align: 'center',
        wordWrap: { width: 150 }
      }).setOrigin(0.5).setDepth((prop.depth ?? 3) + 1));
    });
  }

  drawCharacters(characters, presenter) {
    characters.forEach((character, i) => {
      const active = character.asset === presenter;
      const texture = this.textures.get(character.asset);
      const source = texture?.getSourceImage?.();
      const displayHeight = character.displayHeight ?? (character.scale ?? (active ? 0.9 : 0.8)) * 270;
      const displayWidth = source?.height ? (source.width / source.height) * displayHeight : displayHeight * 0.45;
      const sprite = this.addDynamic(this.add.image(character.x - 48, character.y, character.asset)
        .setOrigin(0.5, 1)
        .setDisplaySize(displayWidth, displayHeight)
        .setDepth(character.depth ?? (active ? 7 : 5)));
      this.tweens.add({ targets: sprite, x: character.x, duration: 360 + i * 80, ease: 'Sine.Out' });

      if (active) {
        this.addDynamic(this.add.ellipse(character.x, character.y + 4, 78, 18, 0xF250AA, 0.38).setDepth(4));
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
    this.addDynamic(this.add.image(574, 552, 'dialog-panel').setDisplaySize(885, 132).setDepth(30));
    this.addDynamic(this.add.image(170, 552, chapter.presenter).setDisplaySize(102, 142).setDepth(31));
    this.addDynamic(this.add.rectangle(325, 501, 210, 34, 0x685680).setDepth(31));
    this.addDynamic(this.add.text(325, 501, (chapter.dialogue?.speaker || 'Presenter').toUpperCase(), {
      fontFamily: 'Courier New',
      fontSize: '18px',
      fontStyle: 'bold',
      color: palette.white
    }).setOrigin(0.5).setDepth(32));
    this.addDynamic(this.add.text(245, 526, chapter.dialogue?.text || '', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: palette.ink,
      wordWrap: { width: 690 },
      lineSpacing: 5
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
        this.addDynamic(this.add.text(x + 20, y - 24, String(index + 1), {
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

      this.addDynamic(this.add.text(x, 686, chapter.shortLabel, {
        fontFamily: 'Courier New',
        fontSize: '12px',
        fontStyle: i === this.currentIndex ? 'bold' : '',
        align: 'center',
        color: i === this.currentIndex ? palette.pink : palette.white,
        wordWrap: { width: 118 }
      }).setOrigin(0.5, 0).setDepth(43));

      if (completed) {
        this.addDynamic(this.add.circle(x + 21, 633, 9, 0x58D36D).setDepth(44));
        this.addDynamic(this.add.text(x + 21, 633, '✓', {
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
    this.addDynamic(this.add.text(1024, 557, 'BACK', {
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
    this.addDynamic(this.add.text(1184, 557, label, {
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
    const text = this.addDynamic(this.add.text(1062, 455, interaction.button || 'RUN', {
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
          this.addDynamic(this.add.text(1062, 512, interaction.result || '', {
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

    const shade = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.58).setOrigin(0).setDepth(100).setInteractive();
    const panel = this.add.rectangle(640, 360, 820, 395, 0xFFF6FF).setStrokeStyle(6, 0x685680).setDepth(101);
    const portraitKey = info.speaker || `scientist-${Math.floor(this.currentIndex / 2) + 1}`;
    const portrait = this.add.image(310, 345, portraitKey).setDisplaySize(130, 178).setDepth(102);
    const title = this.add.text(700, 214, info.title || 'Info', {
      fontFamily: 'Courier New',
      fontSize: this.fitFont(info.title || 'Info', 590, 30, 18),
      fontStyle: 'bold',
      color: palette.ink,
      align: 'center',
      wordWrap: { width: 590 }
    }).setOrigin(0.5).setDepth(102);
    const caption = this.add.text(705, 306, info.text || '', {
      fontFamily: 'Courier New',
      fontSize: '21px',
      color: palette.ink,
      align: 'left',
      lineSpacing: 6,
      wordWrap: { width: 575 }
    }).setOrigin(0.5).setDepth(102);
    const status = this.add.text(705, 430, this.audioStatus(info.audio), {
      fontFamily: 'Courier New',
      fontSize: '13px',
      color: palette.purple,
      align: 'center',
      wordWrap: { width: 590 }
    }).setOrigin(0.5).setDepth(102);

    this.modalObjects = [shade, panel, portrait, title, caption, status];
    const audio = this.makeAudio(info.audio, status);
    const buttons = [
      ['PLAY', 480, () => this.playAudio(audio, status)],
      ['PAUSE', 585, () => this.pauseAudio(audio, status)],
      ['REPLAY', 700, () => this.replayAudio(audio, status)],
      ['MUTE', 820, (_button, label) => this.toggleMute(audio, status, label)]
    ];

    buttons.forEach(([label, x, handler]) => this.addModalButton(x, 475, label, handler));

    const close = this.add.text(640, 535, '[ CLOSE ]', {
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
    const text = this.add.text(x, y, label, {
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
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    const base = import.meta.env.BASE_URL || './';
    if (path.startsWith('/assets/')) return `${base}${path.slice(1)}`;
    if (path.startsWith('assets/')) return `${base}${path}`;
    return path;
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
      NOTES: 'Presenter note: each scientist owns two scenes. Replace MP3 files in public/assets/audio/scientist-n/ and keep captions visible.'
    }[label] || '';

    this.stopAudio();
    this.closeModal(false);
    const shade = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.55).setOrigin(0).setDepth(100).setInteractive();
    const panel = this.add.rectangle(640, 360, 760, 335, 0xFFF6FF).setStrokeStyle(6, 0x685680).setDepth(101);
    const title = this.add.text(640, 245, label, {
      fontFamily: 'Courier New',
      fontSize: '30px',
      fontStyle: 'bold',
      color: palette.ink
    }).setOrigin(0.5).setDepth(102);
    const body = this.add.text(640, 350, content, {
      fontFamily: 'Courier New',
      fontSize: '21px',
      color: palette.ink,
      align: 'center',
      wordWrap: { width: 650 }
    }).setOrigin(0.5).setDepth(102);
    const close = this.add.text(640, 475, '[ CLOSE ]', {
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
    this.modalObjects.forEach(obj => obj?.destroy?.());
    this.modalObjects = [];
  }

  fitFont(text, width, maxSize, minSize) {
    const longest = String(text).split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), '');
    if (!longest) return `${maxSize}px`;
    const estimate = longest.length * maxSize * 0.62;
    if (estimate <= width) return `${maxSize}px`;
    return `${Math.max(minSize, Math.floor(width / (longest.length * 0.62)))}px`;
  }
}
