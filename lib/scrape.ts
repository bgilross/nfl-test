import * as cheerio from 'cheerio';
import { prisma } from './prisma';

// Placeholder category endpoints (slugs) – adjust to real TeamRankings URLs
export const STAT_ENDPOINTS: { slug: string; name: string; url: string }[] = [
  { slug: 'opponent-rushing-touchdowns-per-game', name: 'Opponent Rush TDs/G', url: 'https://www.teamrankings.com/nfl/stat/opponent-rushing-touchdowns-per-game' },
  { slug: 'opponent-gross-passing-yards-per-game', name: 'Opponent Gross Pass Yds/G', url: 'https://www.teamrankings.com/nfl/stat/opponent-gross-passing-yards-per-game' },
  { slug: 'opponent-sacks-per-game', name: 'Opponent Sacks/G', url: 'https://www.teamrankings.com/nfl/stat/opponent-sacks-per-game' }
];

export interface ParsedRow {
  team: string;
  rank?: number;
  currentYear?: number;
  prevYear?: number;
  valueCurrent?: number;
  valuePrev?: number;
  last1?: number;
  last3?: number;
  home?: number;
  away?: number;
  seasonYear?: number;
}

// Simplified header mapping stub – expand with robust logic port later
function parseTable(html: string): ParsedRow[] {
  const $ = cheerio.load(html);
  const rows: ParsedRow[] = [];
  $('table tr').each((i, el) => {
    const cells = $(el).find('td');
    if (cells.length < 2) return;
    const rank = parseInt($(cells[0]).text().trim(), 10);
    const team = $(cells[1]).text().trim();
    const valueCurrent = parseFloat($(cells[2]).text().trim()) || undefined;
    rows.push({ team, rank: isNaN(rank) ? undefined : rank, valueCurrent });
  });
  return rows;
}

export async function scrapeAndStore(seasonYear?: number) {
  const results: Record<string, number> = {};
  for (const cat of STAT_ENDPOINTS) {
    const res = await fetch(cat.url, { headers: { 'User-Agent': 'Mozilla/5.0 scrape' } });
    if (!res.ok) continue;
    const html = await res.text();
    const rows = parseTable(html).slice(0, 40); // limit
    // Ensure category
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { slug: cat.slug, name: cat.name }
    });
    for (const r of rows) {
      if (!r.team) continue;
      const team = await prisma.team.upsert({
        where: { name: r.team },
        update: {},
        create: { name: r.team }
      });
      await prisma.statSnapshot.create({
        data: {
          teamId: team.id,
            categoryId: category.id,
            rank: r.rank,
            valueCurrent: r.valueCurrent,
            seasonYear: seasonYear
        }
      });
    }
    results[cat.slug] = rows.length;
  }
  return { stored: results };
}
