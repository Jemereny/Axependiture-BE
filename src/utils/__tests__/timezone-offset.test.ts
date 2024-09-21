import { getDayRangeFromOffset, getMonthRangeFromOffset } from '../timezone-offset';

describe('timezone-offset', () => {
  describe('getDayRangeFromOffset', () => {
    it('should return correct date range for offset +08:00', () => {
      const date = new Date('2024-09-22T18:00:00Z');
      const offset = '+08:00';
      const { startDateTimeInUTC, endDateTimeInUTC } = getDayRangeFromOffset(date, offset);

      expect(startDateTimeInUTC.toISOString()).toEqual('2024-09-22T16:00:00.000Z');
      expect(endDateTimeInUTC.toISOString()).toEqual('2024-09-23T15:59:59.000Z');
    });

    it('should return correct date range for offset +05:00', () => {
      const date = new Date('2024-09-22T18:00:00Z');
      const offset = '+05:00';
      const { startDateTimeInUTC, endDateTimeInUTC } = getDayRangeFromOffset(date, offset);

      expect(startDateTimeInUTC.toISOString()).toEqual('2024-09-21T19:00:00.000Z');
      expect(endDateTimeInUTC.toISOString()).toEqual('2024-09-22T18:59:59.000Z');
    });

    it('should return correct date range for offset -05:00', () => {
      const date = new Date('2024-09-22T18:00:00Z');
      const offset = '-05:00';
      const { startDateTimeInUTC, endDateTimeInUTC } = getDayRangeFromOffset(date, offset);

      expect(startDateTimeInUTC.toISOString()).toEqual('2024-09-22T05:00:00.000Z');
      expect(endDateTimeInUTC.toISOString()).toEqual('2024-09-23T04:59:59.000Z');
    });

    it('should return correct date range for offset -05:00', () => {
      const date = new Date('2024-09-22T03:00:00Z');
      const offset = '-05:00';
      const { startDateTimeInUTC, endDateTimeInUTC } = getDayRangeFromOffset(date, offset);

      expect(startDateTimeInUTC.toISOString()).toEqual('2024-09-21T05:00:00.000Z');
      expect(endDateTimeInUTC.toISOString()).toEqual('2024-09-22T04:59:59.000Z');
    });
  });

  describe('getMonthRangeFromOffset', () => {
    it('should return correct date range for months for offset +08:00', () => {
      const date = new Date('2024-09-22T18:00:00Z');
      const offset = '+08:00';
      const { startDateTimeInUTC, endDateTimeInUTC } = getMonthRangeFromOffset(date, offset);

      expect(startDateTimeInUTC.toISOString()).toEqual('2024-08-31T16:00:00.000Z');
      expect(endDateTimeInUTC.toISOString()).toEqual('2024-09-30T15:59:59.000Z');
    });

    it('should return correct date range for months for offset +08:00 as it spans over next month', () => {
      const date = new Date('2024-09-30T18:00:00Z');
      const offset = '+08:00';
      const { startDateTimeInUTC, endDateTimeInUTC } = getMonthRangeFromOffset(date, offset);

      expect(startDateTimeInUTC.toISOString()).toEqual('2024-09-30T16:00:00.000Z');
      expect(endDateTimeInUTC.toISOString()).toEqual('2024-10-31T15:59:59.000Z');
    });

    it('should return correct date range for months for offset -08:00 as it spans from previous month', () => {
      const date = new Date('2024-09-01T00:00:00Z');
      const offset = '-08:00';
      const { startDateTimeInUTC, endDateTimeInUTC } = getMonthRangeFromOffset(date, offset);

      expect(startDateTimeInUTC.toISOString()).toEqual('2024-08-01T08:00:00.000Z');
      expect(endDateTimeInUTC.toISOString()).toEqual('2024-09-01T07:59:59.000Z');
    });
  });
});
