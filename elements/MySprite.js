import * as THREE from 'three';

/**
 * This class contains a sprite
 */
class MySprite {
    /**
     * constructor
     * @param {string} text The text to be displayed
     * @param {number} color The color of the text
     * @param {number} pos The initial offset position of the text in the object
     * @param {number} offset The offset between each character
     * @param {number} scale The scale of the text
     * @param {number} width The width of the text object
     * @param {number} height The height of the text object
     */
    constructor(text, color, pos, offset, scale, width, height) {
        this.text = text;
        this.color = color;
        this.pos = pos;
        this.offset = offset;
        this.scale = scale;
        this.width = width;
        this.height = height;
        this.spriteSize = 32 / 512;

        this.build();
    }

    /**
     * Builds the text object
     * @returns {THREE.Group} The text object
     */
    build() {
        const sprites = new THREE.Group();
        let x = this.pos;
        for (let i = 0; i < this.text.length; i++) {
            const character = this.text.charAt(i);
            const column = character.charCodeAt(0) % 16; 
            const row = 15 - Math.floor(character.charCodeAt(0) / 16); 

            const texture = new THREE.TextureLoader().load('images/spritesheet.png');
            const material = new THREE.SpriteMaterial({
                map: texture,
                color: this.color
            });
            material.map.repeat.set(this.spriteSize, this.spriteSize);
            material.map.offset.set(column * this.spriteSize, row * this.spriteSize);

            const sprite = new THREE.Sprite(material);
            x = x + this.offset;
            let center = this.offset * this.text.length / 2;
            sprite.position.x = x - center;
            sprite.position.z = 0.1;
            sprite.scale.set(this.scale, this.scale, this.scale);
            sprites.add(sprite);

            switch (this.text) {
                case 'Diogo Silva':
                    if (character === 'D' || character === 'S') x += 0.1;
                    else if (character === 'i' || character === 'l') x -= 0.1;
                    break;
                case 'Tomás Pires':
                    if (character === 'i') x -= 0.1;
                    else if (character === 'r') x -= 0.1;
                    else if (character === 'm') x += 0.15;
                    else if (character === 'P') x += 0.1;
                    break;
                case 'SGI FEUP':
                    if (character === 'G') x += 0.1;
                    else if (character === 'I') x -= 0.2;
                    break;
                case 'Player Name':
                    if (character === 'P') x += 0.1;
                    else if (character === 'l') x -= 0.1;
                    else if (character === 'e') x += 0.05;
                    else if (character === 'N') x += 0.1;
                    else if (character === 'm') x += 0.15;
                    break;
                case 'Start':
                    if (character === 'S') x += 0.1;
                    else if (character === 't') x -= 0.1;
                    else if (character === 'r') x -= 0.05;
                    break;
                case 'Pick Your Car':
                    if (character === 'i') x -= 0.1;
                    else if (character === 'P') x += 0.1;
                    break;
                case 'Pick Opponent Car':
                    if (character === 'i') x -= 0.1;
                    else if (character === 'P' || character === 'O') x += 0.1;
                    break;
                case 'DIFFICULTY':
                    if (character === 'I') x -= 0.2;
                case 'Normal':
                    if (character === 'N') x += 0.05;
                    else if (character === 'r') x -= 0.05;
                    else if (character === 'm') x += 0.15;
                    break;
                case 'Hard':
                    if (character === 'H') x += 0.1;
                    else if (character === 'r') x -= 0.05;
                    break;
                case 'Restart':
                    if (character === 'R') x += 0.05;
                    else if (character === 't') x -= 0.1;
                    else if (character === 'r') x -= 0.05;
                    break;
                case 'Return To Menu':
                    if (character === 'R') x += 0.05;
                    else if (character === 't') x -= 0.1;
                    else if (character === 'r') x -= 0.05;
                    else if (character === 'M') x += 0.1;
                    break;
                case 'Winner':
                    if (character === 'W') x += 0.2;
                    else if (character === 'i') x -= 0.1;
                    break;
                default:
                    break;
            }
            if (this.text.startsWith('Time')) {
                if (character === 'T') x += 0.05;
                else if (character === 'i') x -= 0.1;
                else if (character === 'm') x += 0.15;
                else if (character === 'e') x += 0.05;
                else if (character === ' ') x -= 0.2;
            }
        }
        
        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const mesh = new THREE.Mesh(geometry, material);
        sprites.add(mesh);
        return sprites;
    }
}

export { MySprite };