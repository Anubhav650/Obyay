import { parseISO8601Duration } from './youtube';

describe('parseISO8601Duration', () => {
  it('parses seconds only correctly', () => {
    expect(parseISO8601Duration('PT45S')).toBe(45);
    expect(parseISO8601Duration('PT5S')).toBe(5);
  });

  it('parses minutes and seconds correctly', () => {
    expect(parseISO8601Duration('PT4M13S')).toBe(253);
    expect(parseISO8601Duration('PT10M0S')).toBe(600);
    expect(parseISO8601Duration('PT5M')).toBe(300);
  });

  it('parses hours, minutes and seconds correctly', () => {
    expect(parseISO8601Duration('PT1H2M3S')).toBe(3723);
    expect(parseISO8601Duration('PT2H0M0S')).toBe(7200);
    expect(parseISO8601Duration('PT1H')).toBe(3600);
  });

  it('handles invalid duration formats gracefully', () => {
    expect(parseISO8601Duration('invalid')).toBe(0);
    expect(parseISO8601Duration('')).toBe(0);
  });
});
