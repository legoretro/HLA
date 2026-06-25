import Phaser from 'phaser';

const imageAssets = {
  'bg-room-shell': 'assets/backgrounds/bg-room-shell.png',
  'bg-pixel-lab': 'assets/backgrounds/bg-pixel-lab.png',
  'bg-main-lab': 'assets/backgrounds/bg-main-lab.png',
  'bg-hospital': 'assets/backgrounds/bg-hospital.png',
  'bg-immune-system': 'assets/backgrounds/bg-immune-system.png',
  'bg-chromosome-6': 'assets/backgrounds/bg-chromosome-6.png',
  'bg-organ-case': 'assets/backgrounds/bg-organ-case.png',
  'bg-molecular-lab': 'assets/backgrounds/bg-molecular-lab.png',
  'logo': 'assets/logo/logo-hla-quest.png',
  'dialog-panel': 'assets/ui/dialog-panel-blank.png',
  'next-button': 'assets/ui/next-button.png',
  'info-icon': 'assets/icons/popup-info.png',
  'icon-welcome': 'assets/icons/icon-welcome.png',
  'icon-cell-id': 'assets/icons/icon-cell-id.png',
  'icon-chromosome': 'assets/icons/icon-chromosome.png',
  'icon-class-i': 'assets/icons/icon-class-i.png',
  'icon-class-ii': 'assets/icons/icon-class-ii.png',
  'icon-family': 'assets/icons/icon-family.png',
  'icon-kidney': 'assets/icons/icon-kidney.png',
  'icon-dna-tube': 'assets/icons/icon-dna-tube.png',
  'icon-pcr': 'assets/icons/icon-pcr.png',
  'icon-analyzer': 'assets/icons/icon-analyzer.png',
  'icon-match': 'assets/icons/icon-match.png',
  'icon-rejection': 'assets/icons/icon-rejection.png',
  'lab-bench': 'assets/props/lab-bench.png',
  'pcr-machine': 'assets/props/pcr-machine.png',
  'hla-analyzer': 'assets/props/hla-analyzer.png',
  'sample-tubes': 'assets/props/sample-tubes.png',
  'microscope': 'assets/props/microscope.png',
  'chromosome-6': 'assets/props/chromosome-6.png',
  'class-i-cell': 'assets/props/class-i-cell.png',
  'class-ii-apc': 'assets/props/class-ii-apc.png',
  'family-map': 'assets/props/family-map.png',
  'kidney-cooler': 'assets/props/kidney-cooler.png',
  'dna-helix': 'assets/props/dna-helix.png',
  'allele-report': 'assets/props/allele-report.png',
  'report-printer': 'assets/props/report-printer.png',
  'scientist-1': 'assets/characters/scientist-1.png',
  'scientist-2': 'assets/characters/scientist-2.png',
  'scientist-3': 'assets/characters/scientist-3.png',
  'scientist-4': 'assets/characters/scientist-4.png',
  'guide-portrait': 'assets/characters/prof-histo.png'
};

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {
    Object.entries(imageAssets).forEach(([key, path]) => this.load.image(key, path));
    for (let i = 1; i <= 4; i += 1) {
      this.load.spritesheet(`scientist-${i}-sheet`, `assets/characters/scientist-${i}-sheet.png`, {
        frameWidth: 128,
        frameHeight: 192
      });
    }
  }
  create() {
    this.scene.start('LessonScene');
  }
}
