import Phaser from 'phaser';
import './styles.css';
import BootScene from './scenes/BootScene.js';
import LessonScene from './scenes/LessonScene.js';

const game = new Phaser.Game({
  type: Phaser.CANVAS,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#0F1732',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, LessonScene]
});

window.hlaQuestGame = game;
