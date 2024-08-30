import { generateCalendar } from '../telegram-calendar';

describe('telegram-calendar', () => {
  describe('generateCalendar', () => {
    test('should return an array of array of dates given a year and month july', () => {
      const output = generateCalendar(2023, 6);
      expect(output).toEqual(
        expect.arrayContaining([
          // Sunday, monday, tuesday, ...
          [undefined, undefined, undefined, undefined, undefined, undefined, 1],
          [2, 3, 4, 5, 6, 7, 8],
          [9, 10, 11, 12, 13, 14, 15],
          [16, 17, 18, 19, 20, 21, 22],
          [23, 24, 25, 26, 27, 28, 29],
          [30, 31, undefined, undefined, undefined, undefined, undefined],
        ]),
      );
    });
  });
});
