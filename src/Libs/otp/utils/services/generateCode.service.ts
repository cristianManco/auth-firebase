import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateCodeService {
  constructor() {}

  async generateNumber(min: number, max: number): Promise<number> {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async generateCode(): Promise<number> {
    const code: number[] = [];
    for (let i = 0; i < 6; i++) {
      code.push(await this.generateNumber(0, 9));
    }
    return parseInt(code.join(''));
  }
}
