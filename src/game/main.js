import Phaser from 'phaser'
import { Boot } from '../scenes/Boot.js'
import { Preloader } from '../scenes/Preloader.js'
import { Game } from '../scenes/Game.js'
import { Room } from '../scenes/Room.js'
import { GameOver } from '../scenes/GameOver.js'

/**
 * Create and return the Phaser game instance. Parent must be a DOM element (e.g. from React ref).
 */
export function createGame(parent) {
  const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent,
    backgroundColor: '#2d3436',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      }
    },
    scene: [Boot, Preloader, Room, Game, GameOver]
  }
  return new Phaser.Game(config)
}
