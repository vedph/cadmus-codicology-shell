import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cellTypeColor',
})
export class CellTypeColorPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    if (!value) {
      return null;
    }
    const id = value as string;
    if (!id.length) {
      return null;
    }
    switch (id.charAt(0)) {
      case 'q':
        return '#f5decb';
      case 'n':
        return '#d5e6e6';
      case 'c':
        return '#d1e6d1';
      case 's':
        return '#f5dfdf';
      case 'r':
        return '#ddc3fa';
    }
    return null;
  }
}
