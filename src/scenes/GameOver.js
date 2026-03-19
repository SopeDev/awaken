export class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOver')
  }

  create() {
    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x1a0a0a)
      .setOrigin(0.5, 0.5)
    this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, 'Game Over\n(Entropy reached 100)', {
      fontFamily: 'Arial Black',
      fontSize: 64,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5)
  }
}
