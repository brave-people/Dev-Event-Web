import {
  getMockHostDetail,
  getMockHostEvents,
  getMockHostList,
} from 'lib/mock/hosts';

describe('mock host API', () => {
  describe('getMockHostList', () => {
    it('returns the API-shaped response with meta + hosts', async () => {
      const res = await getMockHostList();
      expect(res.meta.total_hosts).toBeGreaterThan(0);
      expect(res.meta.total_ongoing_events).toBeGreaterThan(0);
      expect(Array.isArray(res.hosts)).toBe(true);
      expect(res.hosts.length).toBeGreaterThan(0);
      expect(res.hosts[0]).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          host_name: expect.any(String),
          classification: expect.any(String),
          ongoing_count: expect.any(Number),
          total_count: expect.any(Number),
        })
      );
    });

    it('filters by ongoing category', async () => {
      const res = await getMockHostList({ category: 'ongoing' });
      expect(res.hosts.every((h) => h.ongoing_count > 0)).toBe(true);
    });

    it('filters by classification', async () => {
      const res = await getMockHostList({ category: 'COMPANY' });
      expect(res.hosts.every((h) => h.classification === 'COMPANY')).toBe(true);
    });

    it('sorts by name (Korean locale)', async () => {
      const res = await getMockHostList({ sort: 'name' });
      const names = res.hosts.map((h) => h.host_name);
      const sorted = [...names].sort((a, b) => a.localeCompare(b, 'ko'));
      expect(names).toEqual(sorted);
    });

    it('respects q search', async () => {
      const res = await getMockHostList({ q: '당근' });
      expect(res.hosts).toHaveLength(1);
      expect(res.hosts[0].host_name).toBe('당근');
    });
  });

  describe('getMockHostDetail', () => {
    it('returns full detail for known host id', async () => {
      const res = await getMockHostDetail(1);
      expect(res.host_name).toBe('당근');
      expect(res.ongoing_events.length).toBeGreaterThan(0);
      expect(res.past_events.length).toBeGreaterThan(0);
      expect(res.links.length).toBeGreaterThan(0);
      expect(res.summary.total_events).toBeGreaterThan(0);
    });

    it('returns fallback detail for unknown id (no 404)', async () => {
      const res = await getMockHostDetail(9999);
      expect(res.id).toBe(9999);
      expect(res.host_name).toContain('9999');
      expect(res.ongoing_events.length).toBeGreaterThan(0);
    });
  });

  describe('getMockHostEvents', () => {
    it('returns ongoing only when status=ongoing', async () => {
      const res = await getMockHostEvents(1, { status: 'ongoing' });
      expect(res.events.length).toBeGreaterThan(0);
      expect(res.total_elements).toBe(res.events.length);
    });

    it('returns past only when status=past', async () => {
      const res = await getMockHostEvents(1, { status: 'past' });
      expect(res.events.length).toBeGreaterThan(0);
    });

    it('returns combined when status=all', async () => {
      const ongoing = await getMockHostEvents(1, { status: 'ongoing' });
      const past = await getMockHostEvents(1, { status: 'past' });
      const all = await getMockHostEvents(1, { status: 'all' });
      expect(all.total_elements).toBe(ongoing.events.length + past.events.length);
    });
  });
});
